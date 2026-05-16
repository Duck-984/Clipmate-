import jwt from "jsonwebtoken";
import { config } from "../../config/index.js";
import type { PrismaClient } from "@prisma/client";

interface AuthResult {
  userId: string | null;
  userRole: string | null;
}

export async function authMiddleware(
  req: any,
  prisma: PrismaClient
): Promise<AuthResult> {
  const header = req.headers.authorization || "";
  const token = header.replace("Bearer ", "");

  if (!token) return { userId: null, userRole: null };

  try {
    const payload = jwt.verify(token, config.jwt.secret) as {
      userId: string;
      role: string;
    };
    return { userId: payload.userId, userRole: payload.role };
  } catch {
    return { userId: null, userRole: null };
  }
}

export function requireAuth(ctx: { userId: string | null; userRole: string | null }) {
  if (!ctx.userId) throw new Error("UNAUTHENTICATED");
}

export function requireRole(
  ctx: { userId: string | null; userRole: string | null },
  ...roles: string[]
) {
  requireAuth(ctx);
  if (!roles.includes(ctx.userRole!)) throw new Error("FORBIDDEN");
}
