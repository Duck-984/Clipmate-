import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import { typeDefs } from "./graphql/types/index.js";
import { resolvers } from "./graphql/resolvers/index.js";
import { authMiddleware } from "./graphql/middleware/auth.js";
import { config } from "./config/index.js";
import { stripeWebhookRouter } from "./stripe/webhook.js";

const prisma = new PrismaClient();
const redis = new Redis(config.redis.url);

export interface Context {
  prisma: PrismaClient;
  redis: Redis;
  userId: string | null;
  userRole: string | null;
}

const app = express();
const httpServer = http.createServer(app);

// Stripe webhook needs raw body BEFORE json parser
app.use("/stripe/webhook", stripeWebhookRouter);

const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  "/graphql",
  cors<cors.CorsRequest>({ origin: "*" }),
  express.json({ limit: "10mb" }),
  expressMiddleware(server, {
    context: async ({ req }): Promise<Context> => {
      const auth = await authMiddleware(req, prisma);
      return {
        prisma,
        redis,
        userId: auth.userId,
        userRole: auth.userRole,
      };
    },
  })
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

await new Promise<void>((resolve) =>
  httpServer.listen({ port: config.port }, resolve)
);

console.log(`🚀 ClipMate server ready at http://localhost:${config.port}/graphql`);
console.log(`📦 Health check: http://localhost:${config.port}/health`);
console.log(`💳 Stripe webhook: http://localhost:${config.port}/stripe/webhook`);

// Graceful shutdown
process.on("SIGTERM", async () => {
  await server.stop();
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});
