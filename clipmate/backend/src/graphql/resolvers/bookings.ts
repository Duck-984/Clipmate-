import { requireAuth, requireRole } from "../middleware/auth.js";
import { config } from "../../config/index.js";
import type { Context } from "../../server.js";

export const bookingResolvers = {
  Query: {
    myBookings: async (
      _: any,
      { status }: { status?: string },
      ctx: Context
    ) => {
      requireAuth(ctx);
      const where: any = {};
      if (ctx.userRole === "CLIENT") where.clientId = ctx.userId;
      else if (ctx.userRole === "BARBER") {
        const barber = await ctx.prisma.barber.findUnique({
          where: { userId: ctx.userId! },
        });
        if (!barber) throw new Error("BARBER_PROFILE_REQUIRED");
        where.barberId = barber.id;
      }
      if (status) where.status = status;

      return ctx.prisma.booking.findMany({
        where,
        include: {
          client: true,
          barber: { include: { user: true } },
          services: { include: { service: true } },
          payment: true,
          review: true,
        },
        orderBy: { startTime: "desc" },
      });
    },

    booking: async (_: any, { id }: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      return ctx.prisma.booking.findUnique({
        where: { id },
        include: {
          client: true,
          barber: { include: { user: true } },
          services: { include: { service: true } },
          payment: true,
        },
      });
    },

    barberBookings: async (
      _: any,
      { barberId, status, date }: { barberId: string; status?: string; date?: string },
      ctx: Context
    ) => {
      const where: any = { barberId };
      if (status) where.status = status;
      if (date) {
        const d = new Date(date);
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        where.startTime = { gte: d, lt: next };
      }
      return ctx.prisma.booking.findMany({
        where,
        include: {
          client: true,
          services: { include: { service: true } },
        },
        orderBy: { startTime: "asc" },
      });
    },

    availableSlots: async (
      _: any,
      { barberId, date }: { barberId: string; date: string },
      ctx: Context
    ) => {
      const d = new Date(date);
      const dayOfWeek = d.getDay();

      const schedules = await ctx.prisma.schedule.findMany({
        where: { barberId, dayOfWeek, isActive: true },
      });
      if (schedules.length === 0) return [];

      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const existingBookings = await ctx.prisma.booking.findMany({
        where: {
          barberId,
          startTime: { gte: startOfDay, lte: endOfDay },
          status: { in: ["CONFIRMED", "PENDING"] },
        },
        include: { services: { include: { service: true } } },
      });

      const bookedSlots = new Set<string>();
      for (const b of existingBookings) {
        bookedSlots.add(b.startTime.toISOString());
      }

      const availableSlots: Date[] = [];
      for (const sched of schedules) {
        const [sh, sm] = sched.startTime.split(":").map(Number);
        const [eh, em] = sched.endTime.split(":").map(Number);
        const start = new Date(d);
        start.setHours(sh, sm, 0, 0);
        const end = new Date(d);
        end.setHours(eh, em, 0, 0);

        for (let t = start; t < end; t = new Date(t.getTime() + 30 * 60 * 1000)) {
          if (!bookedSlots.has(t.toISOString())) {
            availableSlots.push(new Date(t));
          }
        }
      }

      return availableSlots;
    },
  },

  Mutation: {
    createBooking: async (
      _: any,
      { input }: { input: any },
      ctx: Context
    ) => {
      requireRole(ctx, "CLIENT");

      const barber = await ctx.prisma.barber.findUnique({
        where: { id: input.barberId },
        include: { services: true },
      });
      if (!barber || !barber.isAvailable) throw new Error("BARBER_UNAVAILABLE");

      // Validate services
      const services = input.serviceIds.map((sid: string) => {
        const svc = barber.services.find((s) => s.id === sid && s.isActive);
        if (!svc) throw new Error(`Service ${sid} not found`);
        return svc;
      });

      const totalDuration = services.reduce((sum: number, s: any) => sum + s.duration, 0);
      const startTime = new Date(input.startTime);
      const endTime = new Date(startTime.getTime() + totalDuration * 60 * 1000);

      // Lock slot with Redis
      const slotKey = `slot:${barber.id}:${startTime.toISOString()}`;
      const locked = await ctx.redis.set(
        slotKey,
        ctx.userId!,
        "EX",
        config.booking.slotLockTimeout,
        "NX"
      );
      if (!locked) throw new Error("SLOT_TAKEN");

      const totalPrice = services.reduce((sum: number, s: any) => sum + s.price, 0);
      const platformFee = totalPrice * (barber.commissionPct / 100);
      const barberPayout = totalPrice - platformFee;

      try {
        const booking = await ctx.prisma.booking.create({
          data: {
            clientId: ctx.userId!,
            barberId: barber.id,
            startTime,
            endTime,
            totalPrice,
            platformFee,
            barberPayout,
            notes: input.notes,
            status: "PENDING",
            services: {
              create: services.map((s: any) => ({
                serviceId: s.id,
                priceAtBooking: s.price,
              })),
            },
          },
          include: {
            client: true,
            barber: { include: { user: true } },
            services: { include: { service: true } },
          },
        });

        await ctx.prisma.barber.update({
          where: { id: barber.id },
          data: { totalBookings: { increment: 1 } },
        });

        return booking;
      } catch (e) {
        await ctx.redis.del(slotKey);
        throw e;
      }
    },

    confirmBooking: async (_: any, { bookingId }: { bookingId: string }, ctx: Context) => {
      requireRole(ctx, "BARBER");
      const barber = await ctx.prisma.barber.findUnique({ where: { userId: ctx.userId! } });
      if (!barber) throw new Error("BARBER_PROFILE_REQUIRED");

      const booking = await ctx.prisma.booking.findUnique({ where: { id: bookingId } });
      if (!booking || booking.barberId !== barber.id) throw new Error("FORBIDDEN");
      if (booking.status !== "PENDING") throw new Error("INVALID_STATUS");

      const updated = await ctx.prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
        include: {
          client: true,
          barber: { include: { user: true } },
          services: { include: { service: true } },
        },
      });

      // Create notifications
      await ctx.prisma.notification.create({
        data: {
          userId: booking.clientId,
          type: "BOOKING_CONFIRMED",
          title: "Заказ подтверждён",
          body: `Барбер ${barber.userId} подтвердил запись на ${booking.startTime.toLocaleDateString()}`,
        },
      });

      return updated;
    },

    cancelBooking: async (
      _: any,
      { bookingId, reason }: { bookingId: string; reason?: string },
      ctx: Context
    ) => {
      requireAuth(ctx);
      const booking = await ctx.prisma.booking.findUnique({ where: { id: bookingId } });
      if (!booking) throw new Error("NOT_FOUND");

      const isClient = booking.clientId === ctx.userId;
      const isBarber = booking.barberId === (
        await ctx.prisma.barber.findUnique({ where: { userId: ctx.userId! } })
      )?.id;
      if (!isClient && !isBarber) throw new Error("FORBIDDEN");

      if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
        throw new Error("INVALID_STATUS");
      }

      return ctx.prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED", cancelReason: reason },
        include: {
          client: true,
          barber: { include: { user: true } },
          services: { include: { service: true } },
        },
      });
    },

    completeBooking: async (_: any, { bookingId }: { bookingId: string }, ctx: Context) => {
      requireRole(ctx, "BARBER");
      const barber = await ctx.prisma.barber.findUnique({ where: { userId: ctx.userId! } });
      const booking = await ctx.prisma.booking.findUnique({ where: { id: bookingId } });
      if (!booking || booking.barberId !== barber?.id) throw new Error("FORBIDDEN");
      if (booking.status !== "CONFIRMED") throw new Error("INVALID_STATUS");

      return ctx.prisma.booking.update({
        where: { id: bookingId },
        data: { status: "COMPLETED" },
        include: {
          client: true,
          barber: { include: { user: true } },
          services: { include: { service: true } },
        },
      });
    },

    submitReview: async (
      _: any,
      { bookingId, rating, comment }: { bookingId: string; rating: number; comment?: string },
      ctx: Context
    ) => {
      requireRole(ctx, "CLIENT");
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { barber: true },
      });
      if (!booking || booking.clientId !== ctx.userId) throw new Error("FORBIDDEN");
      if (booking.status !== "COMPLETED") throw new Error("BOOKING_NOT_COMPLETED");

      const existing = await ctx.prisma.review.findUnique({ where: { bookingId } });
      if (existing) throw new Error("ALREADY_REVIEWED");

      const review = await ctx.prisma.review.create({
        data: {
          authorId: ctx.userId!,
          subjectId: booking.barber.userId,
          bookingId,
          rating,
          comment,
        },
        include: { author: true },
      });

      // Update barber average
      const agg = await ctx.prisma.review.aggregate({
        where: { subjectId: booking.barber.userId },
        _avg: { rating: true },
        _count: true,
      });

      await ctx.prisma.barber.update({
        where: { userId: booking.barber.userId },
        data: {
          avgRating: agg._avg.rating || 0,
          totalReviews: agg._count,
        },
      });

      return review;
    },
  },
};
