import { Router, raw } from "express";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { config } from "../config/index.js";

const stripe = new Stripe(config.stripe.secretKey, { apiVersion: "2024-06-20" as any });
const prisma = new PrismaClient();

export const stripeWebhookRouter = Router();

stripeWebhookRouter.post(
  "/webhook",
  raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.webhookSecret
      );
    } catch (err: any) {
      console.error("Webhook signature failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    try {
      switch (event.type) {
        // ── Подписки ──
        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const sub = event.data.object as Stripe.Subscription;
          const userId = sub.metadata.userId;
          const tier = sub.metadata.tier as string;
          const role = sub.metadata.role as string;

          if (userId && tier) {
            const now = new Date();
            const periodEnd = new Date(sub.current_period_end * 1000);

            const existing = await prisma.subscription.findFirst({
              where: { userId, role },
            });

            if (existing) {
              await prisma.subscription.update({
                where: { id: existing.id },
                data: {
                  tier,
                  status: sub.status === "active" ? "active" : "past_due",
                  stripeSubId: sub.id,
                  currentPeriodStart: now,
                  currentPeriodEnd: periodEnd,
                },
              });
            } else {
              await prisma.subscription.create({
                data: {
                  userId,
                  role,
                  tier,
                  status: sub.status === "active" ? "active" : "past_due",
                  stripeSubId: sub.id,
                  currentPeriodStart: now,
                  currentPeriodEnd: periodEnd,
                },
              });
            }
          }
          break;
        }

        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          const userId = sub.metadata.userId;
          const role = sub.metadata.role;

          if (userId) {
            await prisma.subscription.updateMany({
              where: { userId, role, stripeSubId: sub.id },
              data: { status: "cancelled", tier: "FREE" },
            });
          }
          break;
        }

        // ── Платежи за заказы ──
        case "payment_intent.succeeded": {
          const pi = event.data.object as Stripe.PaymentIntent;
          await prisma.payment.updateMany({
            where: { stripePiId: pi.id },
            data: { status: "SUCCEEDED" },
          });
          break;
        }

        case "payment_intent.payment_failed": {
          const pi = event.data.object as Stripe.PaymentIntent;
          await prisma.payment.updateMany({
            where: { stripePiId: pi.id },
            data: { status: "FAILED" },
          });
          break;
        }
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Webhook handler error:", err);
      res.status(500).json({ error: "Internal webhook error" });
    }
  }
);

// ── Создание Stripe Checkout Session для подписки ──
export async function createSubscriptionCheckout(params: {
  userId: string;
  userEmail: string;
  role: "BARBER" | "CLIENT";
  tier: "PRO" | "PREMIUM" | "PLUS";
  successUrl: string;
  cancelUrl: string;
}) {
  const priceMap: Record<string, string> = {
    BARBER_PRO: config.stripe.prices.barberPro,
    BARBER_PREMIUM: config.stripe.prices.barberPremium,
    CLIENT_PLUS: config.stripe.prices.clientPlus,
  };

  const priceId = priceMap[`${params.role}_${params.tier}`];
  if (!priceId) throw new Error("Invalid tier/role combination");

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: params.userEmail,
    metadata: {
      userId: params.userId,
      tier: params.tier,
      role: params.role,
    },
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    subscription_data: {
      trial_period_days: 14,
      metadata: {
        userId: params.userId,
        tier: params.tier,
        role: params.role,
      },
    },
  });

  return session;
}

// ── Создание PaymentIntent для разовой оплаты заказа ──
export async function createBookingPayment(params: {
  bookingId: string;
  amount: number;
  currency: string;
  customerId?: string;
  metadata: Record<string, string>;
}) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(params.amount * 100),
    currency: params.currency.toLowerCase(),
    customer: params.customerId,
    metadata: {
      bookingId: params.bookingId,
      ...params.metadata,
    },
  });

  return paymentIntent;
}

// ── Рефанд ──
export async function refundPayment(paymentIntentId: string, amount?: number) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amount ? { amount: Math.round(amount * 100) } : {}),
  });
}

// ── Создание Stripe Customer ──
export async function getOrCreateCustomer(params: {
  userId: string;
  email: string;
  name: string;
}) {
  const customers = await stripe.customers.list({ email: params.email, limit: 1 });
  if (customers.data.length > 0) return customers.data[0];

  return stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: { userId: params.userId },
  });
}

// ── Получение статуса подписки ──
export async function getSubscriptionStatus(stripeSubscriptionId: string) {
  const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  return {
    status: sub.status,
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  };
}
