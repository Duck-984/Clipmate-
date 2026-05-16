export const config = {
  port: parseInt(process.env.PORT || "4000"),
  jwt: {
    secret: process.env.JWT_SECRET || "dev_secret_change_in_production",
    expiresIn: "30d",
  },
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    platformFeePct: 15,
    currency: "uzs",
  },
  ai: {
    provider: "openai",
    model: "gpt-4o",
    freeCredits: 3,
    plusCredits: 999,
    barberFreeCredits: 10,
    barberProCredits: 50,
    barberPremiumCredits: 999,
    creditResetDays: 30,
    costPerMessage: 1,
    costPerImage: 3,
  },
  booking: {
    slotLockTimeout: 300, // seconds (5 min to confirm payment)
    reminderWindows: [24 * 60, 2 * 60, 30], // minutes before appointment
    cancellationWindow: 60, // minutes before — can cancel without penalty
  },
  subscription: {
    trialDays: 14,
    barber: {
      pro: { price: 2900, currency: "usd" },      // $29/mo
      premium: { price: 9900, currency: "usd" },   // $99/mo
    },
    client: {
      plus: { price: 499, currency: "usd" },       // $4.99/mo
    },
  },
};
