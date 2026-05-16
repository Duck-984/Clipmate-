import { requireAuth, requireRole } from "../middleware/auth.js";
import type { Context } from "../../server.js";

function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const barberResolvers = {
  Query: {
    barber: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return prisma.barber.findUnique({
        where: { id },
        include: {
          user: true,
          services: { where: { isActive: true } },
          schedule: { where: { isActive: true } },
          portfolio: true,
        },
      });
    },

    searchBarbers: async (
      _: any,
      { input }: { input: any },
      { prisma }: Context
    ) => {
      const {
        lat, lng, radius = 10,
        minRating, maxPrice,
        serviceCategory, sortBy = "rating",
      } = input;

      const barbers = await prisma.barber.findMany({
        where: {
          isAvailable: true,
          isVerified: true,
          ...(minRating ? { avgRating: { gte: minRating } } : {}),
        },
        include: {
          user: true,
          services: {
            where: {
              isActive: true,
              ...(maxPrice ? { price: { lte: maxPrice } } : {}),
              ...(serviceCategory ? { category: serviceCategory } : {}),
            },
            orderBy: { price: "asc" },
          },
          schedule: { where: { isActive: true } },
          portfolio: true,
        },
      });

      let results = barbers.filter((b) => b.services.length > 0);

      if (lat != null && lng != null) {
        results = results.filter((b) => {
          if (!b.user.locationLat || !b.user.locationLng) return false;
          const dist = haversineKm(lat, lng, b.user.locationLat, b.user.locationLng);
          return dist <= radius;
        });
        results = results.map((b) => ({
          ...b,
          distance: haversineKm(lat, lng, b.user.locationLat!, b.user.locationLng!),
        }));
      }

      switch (sortBy) {
        case "rating":
          results.sort((a: any, b: any) => b.avgRating - a.avgRating);
          break;
        case "price":
          results.sort(
            (a: any, b: any) =>
              Math.min(...a.services.map((s: any) => s.price)) -
              Math.min(...b.services.map((s: any) => s.price))
          );
          break;
        case "distance":
          results.sort((a: any, b: any) => (a.distance || 999) - (b.distance || 999));
          break;
      }

      return results.slice(0, 50);
    },

    featuredBarbers: async (_: any, { limit = 10 }: { limit: number }, { prisma }: Context) => {
      return prisma.barber.findMany({
        where: { isVerified: true, isAvailable: true },
        orderBy: [{ subscriptionTier: "desc" }, { avgRating: "desc" }],
        take: limit,
        include: {
          user: true,
          services: { where: { isActive: true } },
          portfolio: true,
        },
      });
    },
  },

  Mutation: {
    addService: async (_: any, { input }: { input: any }, ctx: Context) => {
      requireRole(ctx, "BARBER");
      const barber = await ctx.prisma.barber.findUnique({ where: { userId: ctx.userId! } });
      if (!barber) throw new Error("BARBER_PROFILE_REQUIRED");

      return ctx.prisma.service.create({
        data: { ...input, barberId: barber.id },
      });
    },

    updateService: async (_: any, { id, input }: { id: string; input: any }, ctx: Context) => {
      requireRole(ctx, "BARBER");
      const barber = await ctx.prisma.barber.findUnique({ where: { userId: ctx.userId! } });
      const service = await ctx.prisma.service.findUnique({ where: { id } });
      if (!service || service.barberId !== barber?.id) throw new Error("FORBIDDEN");

      return ctx.prisma.service.update({ where: { id }, data: input });
    },

    deleteService: async (_: any, { id }: { id: string }, ctx: Context) => {
      requireRole(ctx, "BARBER");
      const barber = await ctx.prisma.barber.findUnique({ where: { userId: ctx.userId! } });
      const service = await ctx.prisma.service.findUnique({ where: { id } });
      if (!service || service.barberId !== barber?.id) throw new Error("FORBIDDEN");

      await ctx.prisma.service.update({ where: { id }, data: { isActive: false } });
      return true;
    },

    setSchedule: async (_: any, { schedule }: { schedule: any[] }, ctx: Context) => {
      requireRole(ctx, "BARBER");
      const barber = await ctx.prisma.barber.findUnique({ where: { userId: ctx.userId! } });
      if (!barber) throw new Error("BARBER_PROFILE_REQUIRED");

      await ctx.prisma.schedule.deleteMany({ where: { barberId: barber.id } });
      return ctx.prisma.$transaction(
        schedule.map((s) =>
          ctx.prisma.schedule.create({ data: { ...s, barberId: barber.id } })
        )
      );
    },
  },

  Barber: {
    user: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.user.findUnique({ where: { id: parent.userId } });
    },
  },
};
