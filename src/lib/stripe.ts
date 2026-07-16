import Stripe from "stripe";

let cachedClient: Stripe | null = null;

// Lazily constructed so the app can build and run (courses/community/CRM
// etc. all work fine) before STRIPE_SECRET_KEY is configured — only routes
// that actually call getStripe() require it, and only at request time.
export function getStripe() {
  if (!cachedClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set — add it in your environment variables.");
    }
    cachedClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return cachedClient;
}

export const PLANS = {
  starter: { label: "Starter", priceId: process.env.STRIPE_PRICE_STARTER, amountCents: 12000 },
  group: { label: "Group program", priceId: process.env.STRIPE_PRICE_GROUP, amountCents: 20000 },
  elite: { label: "Elite 1:1", priceId: process.env.STRIPE_PRICE_ELITE, amountCents: 50000 },
} as const;

export type PlanKey = keyof typeof PLANS;
