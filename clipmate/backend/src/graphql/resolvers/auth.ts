import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../config/index.js";
import type { Context } from "../../server.js";

export const authResolvers = {
  Mutation: {
    register: async (
      _: any,
      { input }: { input: any },
      { prisma }: Context
    ) => {
      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: input.phone },
            ...(input.email ? [{ email: input.email }] : []),
          ],
        },
      });
      if (existing) throw new Error("USER_EXISTS");

      const passwordHash = await bcrypt.hash(input.password, 12);
      const user = await prisma.user.create({
        data: {
          phone: input.phone,
          email: input.email,
          passwordHash,
          name: input.name,
          role: input.role,
          city: input.city,
          ...(input.role === "BARBER"
            ? {
                barber: {
                  create: { subscriptionTier: "FREE", aiCredits: 10 },
                },
              }
            : {}),
          ...(input.role === "CLIENT"
            ? { client: { create: { tier: "FREE", aiCredits: 3 } } }
            : {}),
          ...(input.role === "SELLER"
            ? { seller: { create: { storeName: input.name } } }
            : {}),
        },
        include: { barber: true, client: true },
      });

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return { token, user };
    },

    login: async (
      _: any,
      { input }: { input: any },
      { prisma }: Context
    ) => {
      const user = await prisma.user.findUnique({
        where: { phone: input.phone },
        include: { barber: true, client: true },
      });
      if (!user) throw new Error("INVALID_CREDENTIALS");

      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) throw new Error("INVALID_CREDENTIALS");

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return { token, user };
    },
  },
};
