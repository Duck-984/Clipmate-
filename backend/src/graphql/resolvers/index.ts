import { authResolvers } from "./auth.js";
import { barberResolvers } from "./barbers.js";
import { bookingResolvers } from "./bookings.js";
import { aiResolvers } from "./ai.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { config } from "../../config/index.js";
import type { Context } from "../../server.js";
import Stripe from "stripe";

const stripe = new Stripe(config.stripe.secretKey || "sk_test_placeholder");

export const resolvers = {
  Query: {
    ...barberResolvers.Query,
    ...bookingResolvers.Query,
    ...aiResolvers.Query,

    me: async (_: any, __: any, ctx: Context) => {
      requireAuth(ctx);
      return ctx.prisma.user.findUnique({
        where: { id: ctx.userId! },
        include: { barber: true, client: true },
      });
    },

    mySubscription: async (_: any, __: any, ctx: Context) => {
      requireAuth(ctx);
      return ctx.prisma.subscription.findFirst({
        where: { userId: ctx.userId!, status: "active" },
        orderBy: { createdAt: "desc" },
      });
    },

    myBarberAnalytics: async (_: any, __: any, ctx: Context) => {
      requireRole(ctx, "BARBER");
      const barber = await ctx.prisma.barber.findUnique({
        where: { userId: ctx.userId! },
        include: { services: { where: { isActive: true } } },
      });
      if (!barber) throw new Error("BARBER_PROFILE_REQUIRED");

      const bookings = await ctx.prisma.booking.findMany({
        where: { barberId: barber.id, status: "COMPLETED" },
        include: { services: { include: { service: true } } },
      });

      const totalBookings = bookings.length;
      const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

      const serviceCounts: Record<string, number> = {};
      for (const b of bookings) {
        for (const bs of b.services) {
          serviceCounts[bs.service.name] = (serviceCounts[bs.service.name] || 0) + 1;
        }
      }

      const occupancyRate = totalBookings > 0 ? Math.min(totalBookings / 200, 1) : 0;

      return {
        totalBookings,
        totalRevenue,
        avgRating: barber.avgRating,
        occupancyRate,
        topServices: barber.services.filter((s) => (serviceCounts[s.name] || 0) > 0),
        revenueTrend: [],
      };
    },

    platformMetrics: async (_: any, __: any, ctx: Context) => {
      requireRole(ctx, "ADMIN");
      const [totalUsers, totalBarbers, totalBookings] = await Promise.all([
        ctx.prisma.user.count(),
        ctx.prisma.barber.count(),
        ctx.prisma.booking.count(),
      ]);

      return {
        totalUsers,
        totalBarbers,
        totalBookings,
        gmv: 0,
        platformRevenue: 0,
        activeSubscriptions: 0,
        aiRevenue: 0,
      };
    },

    // Marketplace
    marketItems: async (
      _: any,
      { category, search, minPrice, maxPrice }: any,
      ctx: Context
    ) => {
      const where: any = { isActive: true };
      if (category) where.category = category;
      if (search) where.title = { contains: search, mode: "insensitive" };
      if (minPrice != null || maxPrice != null) {
        where.price = {};
        if (minPrice != null) where.price.gte = minPrice;
        if (maxPrice != null) where.price.lte = maxPrice;
      }
      return ctx.prisma.marketItem.findMany({
        where,
        include: { seller: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
      });
    },

    marketItem: async (_: any, { id }: { id: string }, ctx: Context) => {
      return ctx.prisma.marketItem.findUnique({
        where: { id },
        include: { seller: { include: { user: true } } },
      });
    },
  },

  Mutation: {
    ...authResolvers.Mutation,
    ...barberResolvers.Mutation,
    ...bookingResolvers.Mutation,
    ...aiResolvers.Mutation,

    updateProfile: async (_: any, { input }: { input: any }, ctx: Context) => {
      requireAuth(ctx);
      return ctx.prisma.user.update({
        where: { id: ctx.userId! },
        data: input,
        include: { barber: true, client: true },
      });
    },

    setupBarberProfile: async (_: any, { input }: { input: any }, ctx: Context) => {
      requireRole(ctx, "BARBER");
      return ctx.prisma.barber.update({
        where: { userId: ctx.userId! },
        data: input,
        include: { user: true, services: true, schedule: true },
      });
    },

    // Payments
    createPaymentIntent: async (
      _: any,
      { bookingId }: { bookingId: string },
      ctx: Context
    ) => {
      requireAuth(ctx);
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: bookingId },
      });
      if (!booking || booking.clientId !== ctx.userId) throw new Error("FORBIDDEN");

      if (config.stripe.secretKey) {
        const pi = await stripe.paymentIntents.create({
          amount: Math.round(booking.totalPrice * 100),
          currency: config.stripe.currency,
          metadata: { bookingId },
        });

        await ctx.prisma.payment.create({
          data: {
            bookingId,
            userId: ctx.userId!,
            amount: booking.totalPrice,
            currency: config.stripe.currency,
            status: "PENDING",
            stripePiId: pi.id,
            type: "BOOKING",
          },
        });

        return pi.client_secret;
      }
      return "stripe_not_configured";
    },

    createSubscriptionCheckout: async (
      _: any,
      { tier, role }: { tier: string; role: string },
      ctx: Context
    ) => {
      requireAuth(ctx);
      return "subscription_checkout_url_placeholder";
    },

    createMarketItem: async (_: any, { input }: { input: any }, ctx: Context) => {
      requireRole(ctx, "SELLER", "BARBER");
      const barber = await ctx.prisma.barber.findUnique({
        where: { userId: ctx.userId! },
      });
      if (!barber) throw new Error("BARBER_PROFILE_REQUIRED");

      return ctx.prisma.marketItem.create({
        data: { ...input, sellerId: barber.id },
        include: { seller: { include: { user: true } } },
      });
    },

    verifyBarber: async (_: any, { barberId }: { barberId: string }, ctx: Context) => {
      requireRole(ctx, "ADMIN");
      return ctx.prisma.barber.update({
        where: { id: barberId },
        data: { isVerified: true },
        include: { user: true },
      });
    },

    updateCommission: async (
      _: any,
      { barberId, pct }: { barberId: string; pct: number },
      ctx: Context
    ) => {
      requireRole(ctx, "ADMIN");
      return ctx.prisma.barber.update({
        where: { id: barberId },
        data: { commissionPct: pct },
        include: { user: true },
      });
    },
  },

  // Type resolvers
  User: {
    barber: async (parent: any, _: any, { prisma }: Context) =>
      prisma.barber.findUnique({ where: { userId: parent.id } }),
    client: async (parent: any, _: any, { prisma }: Context) =>
      prisma.client.findUnique({ where: { userId: parent.id } }),
  },

  Booking: {
    client: async (parent: any, _: any, { prisma }: Context) =>
      prisma.user.findUnique({ where: { id: parent.clientId } }),
    barber: async (parent: any, _: any, { prisma }: Context) =>
      prisma.barber.findUnique({
        where: { id: parent.barberId },
        include: { user: true },
      }),
    services: async (parent: any, _: any, { prisma }: Context) =>
      prisma.bookingService.findMany({
        where: { bookingId: parent.id },
        include: { service: true },
      }),
    payment: async (parent: any, _: any, { prisma }: Context) =>
      prisma.payment.findUnique({ where: { bookingId: parent.id } }),
    review: async (parent: any, _: any, { prisma }: Context) =>
      prisma.review.findUnique({ where: { bookingId: parent.id } }),
  },

  Barber: {
    ...barberResolvers.Barber,
    services: async (parent: any, _: any, { prisma }: Context) =>
      prisma.service.findMany({
        where: { barberId: parent.id, isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    schedule: async (parent: any, _: any, { prisma }: Context) =>
      prisma.schedule.findMany({
        where: { barberId: parent.id, isActive: true },
        orderBy: { dayOfWeek: "asc" },
      }),
    portfolio: async (parent: any, _: any, { prisma }: Context) =>
      prisma.portfolioItem.findMany({
        where: { barberId: parent.id },
        orderBy: { sortOrder: "asc" },
      }),
  },

  Client: {
    user: async (parent: any, _: any, { prisma }: Context) =>
      prisma.user.findUnique({ where: { id: parent.userId } }),
  },

  MarketItem: {
    seller: async (parent: any, _: any, { prisma }: Context) =>
      prisma.barber.findUnique({
        where: { id: parent.sellerId },
        include: { user: true },
      }),
  },
};
