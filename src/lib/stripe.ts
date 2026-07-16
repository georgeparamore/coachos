import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PLANS = {
  starter: { label: "Starter", priceId: process.env.STRIPE_PRICE_STARTER, amountCents: 12000 },
  group: { label: "Group program", priceId: process.env.STRIPE_PRICE_GROUP, amountCents: 20000 },
  elite: { label: "Elite 1:1", priceId: process.env.STRIPE_PRICE_ELITE, amountCents: 50000 },
} as const;

export type PlanKey = keyof typeof PLANS;
