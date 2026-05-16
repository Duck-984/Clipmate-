import { requireAuth, requireRole } from "../middleware/auth.js";
import { config } from "../../config/index.js";
import type { Context } from "../../server.js";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export const aiResolvers = {
  Query: {
    myAISessions: async (_: any, __: any, ctx: Context) => {
      requireAuth(ctx);
      return ctx.prisma.aISession.findMany({
        where: { userId: ctx.userId! },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    },
  },

  Mutation: {
    aiChat: async (
      _: any,
      { input }: { input: { message: string } },
      ctx: Context
    ) => {
      requireAuth(ctx);

      // Check credits
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.userId! },
        include: { client: true, barber: true },
      });
      if (!user) throw new Error("USER_NOT_FOUND");

      const credits = user.client?.aiCredits ?? user.barber?.aiCredits ?? 0;
      if (credits <= 0) throw new Error("NO_AI_CREDITS");

      // Fetch recent history
      const recentSessions = await ctx.prisma.aISession.findMany({
        where: { userId: ctx.userId!, type: "CHAT" },
        orderBy: { createdAt: "desc" },
        take: 3,
      });

      const messages: any[] = [
        {
          role: "system",
          content:
            user.role === "BARBER"
              ? "Ты AI-ассистент для барбера платформы ClipMate. Помогай советами по увеличению дохода, анализу загрузки, идеями для контента и акций, рекомендациями по ценам. Отвечай на русском, профессионально и по делу."
              : "Ты AI-ассистент для клиента платформы ClipMate. Помогай с подбором стрижек, советами по уходу за волосами, рекомендациями барберов. Отвечай на русском, дружелюбно и полезно.",
        },
      ];

      for (const s of recentSessions.reverse()) {
        const msgs = s.messages as any[];
        messages.push(...msgs.slice(-4));
      }

      messages.push({ role: "user", content: input.message });

      let reply: string;
      try {
        const completion = await openai.chat.completions.create({
          model: config.ai.model,
          messages,
          max_tokens: 600,
          temperature: 0.7,
        });
        reply = completion.choices[0]?.message?.content || "Извините, не могу ответить сейчас.";
      } catch {
        reply = "Извините, AI-сервис временно недоступен. Попробуйте позже.";
      }

      const costCredits = config.ai.costPerMessage;
      const saveMessages = [
        ...messages,
        { role: "assistant", content: reply },
      ];

      await ctx.prisma.aISession.create({
        data: {
          userId: ctx.userId!,
          type: "CHAT",
          messages: saveMessages,
          tokensUsed: 0,
          costCredits,
        },
      });

      // Deduct credits
      if (user.client) {
        await ctx.prisma.client.update({
          where: { userId: ctx.userId! },
          data: { aiCredits: { decrement: costCredits } },
        });
      } else if (user.barber) {
        await ctx.prisma.barber.update({
          where: { userId: ctx.userId! },
          data: { aiCredits: { decrement: costCredits } },
        });
      }

      const finalCredits = credits - costCredits;
      return { reply, creditsUsed: costCredits, creditsRemaining: finalCredits };
    },

    aiStyleAdvice: async (
      _: any,
      { input }: { input: { imageUrl?: string; description?: string } },
      ctx: Context
    ) => {
      requireRole(ctx, "CLIENT");

      const client = await ctx.prisma.client.findUnique({
        where: { userId: ctx.userId! },
      });
      if (!client || client.aiCredits < config.ai.costPerImage) {
        throw new Error("NO_AI_CREDITS");
      }

      const messages: any[] = [
        {
          role: "system",
          content:
            "Ты AI-стилист платформы ClipMate. Анализируй запрос клиента и рекомендуй стрижку. Формат ответа — JSON: { recommendedStyle: string, explanation: string, faceShape: string, hairType: string }. Только русский язык.",
        },
      ];

      if (input.imageUrl) {
        messages.push({
          role: "user",
          content: [
            { type: "text", text: `Посоветуй стрижку. Описание: ${input.description || "Не указано"}` },
            { type: "image_url", image_url: { url: input.imageUrl } },
          ],
        });
      } else {
        messages.push({
          role: "user",
          content: `Посоветуй стрижку. Описание: ${input.description || "Не указано"}`,
        });
      }

      let result: any;
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages,
          max_tokens: 400,
          response_format: { type: "json_object" },
        });
        result = JSON.parse(completion.choices[0]?.message?.content || "{}");
      } catch {
        result = {
          recommendedStyle: "Классический фейд",
          explanation: "Универсальный вариант, подходит большинству форм лица.",
        };
      }

      // Find compatible barbers
      const barbers = await ctx.prisma.barber.findMany({
        where: { isAvailable: true, isVerified: true },
        include: { user: true, services: { where: { isActive: true } }, portfolio: true },
        take: 5,
        orderBy: { avgRating: "desc" },
      });

      await ctx.prisma.client.update({
        where: { userId: ctx.userId! },
        data: { aiCredits: { decrement: config.ai.costPerImage } },
      });

      return {
        recommendedStyle: result.recommendedStyle || "Классический фейд",
        confidence: 0.85,
        explanation: result.explanation || "Этот стиль подойдёт вам.",
        compatibleBarbers: barbers,
      };
    },

    aiOptimizePrice: async (
      _: any,
      { barberId }: { barberId: string },
      ctx: Context
    ) => {
      requireRole(ctx, "BARBER");
      const barber = await ctx.prisma.barber.findUnique({
        where: { id: barberId, userId: ctx.userId! },
        include: { services: true },
      });
      if (!barber) throw new Error("FORBIDDEN");
      if (barber.subscriptionTier === "FREE") {
        throw new Error("UPGRADE_REQUIRED — AI price optimization requires Pro or Premium");
      }

      if (barber.aiCredits < 2) throw new Error("NO_AI_CREDITS");

      const bookings = await ctx.prisma.booking.findMany({
        where: { barberId, status: "COMPLETED" },
        include: { services: { include: { service: true } } },
        orderBy: { startTime: "desc" },
        take: 100,
      });

      const serviceStats: Record<string, { count: number; revenue: number }> = {};
      for (const b of bookings) {
        for (const bs of b.services) {
          if (!serviceStats[bs.serviceId]) {
            serviceStats[bs.serviceId] = { count: 0, revenue: 0 };
          }
          serviceStats[bs.serviceId].count++;
          serviceStats[bs.serviceId].revenue += bs.priceAtBooking;
        }
      }

      const recommendations: any[] = [];
      for (const svc of barber.services) {
        const stats = serviceStats[svc.id];
        const demand = stats?.count || 0;
        const suggestedPrice =
          demand > 20
            ? Math.round(svc.price * 1.15)
            : demand > 5
              ? Math.round(svc.price * 1.05)
              : svc.price;

        recommendations.push({
          serviceId: svc.id,
          serviceName: svc.name,
          currentPrice: svc.price,
          suggestedPrice,
          demand,
          reasoning:
            demand > 20
              ? "Высокий спрос — можно увеличить цену на 15%"
              : demand > 5
                ? "Стабильный спрос — умеренное повышение на 5%"
                : "Недостаточно данных — сохранить текущую цену",
        });
      }

      await ctx.prisma.barber.update({
        where: { id: barberId },
        data: { aiCredits: { decrement: 2 } },
      });

      return { recommendations };
    },
  },
};
