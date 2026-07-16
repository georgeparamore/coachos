import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { leadId, clientName, clientEmail, planKey } = body as {
    leadId: string | null;
    clientName: string;
    clientEmail: string;
    planKey: PlanKey;
  };

  const plan = PLANS[planKey];
  if (!plan || !plan.priceId) {
    return NextResponse.json(
      { error: `Plan "${planKey}" has no Stripe price configured. Set STRIPE_PRICE_${planKey.toUpperCase()}.` },
      { status: 400 },
    );
  }
  if (!clientName || !clientEmail) {
    return NextResponse.json({ error: "Client name and email are required" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: clientEmail,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${appUrl}/subscriptions?checkout=success`,
    cancel_url: `${appUrl}/subscriptions?checkout=cancelled`,
    metadata: {
      coach_id: user.id,
      lead_id: leadId ?? "",
      plan_key: planKey,
    },
  });

  const { error: insertError } = await supabase.from("subscriptions").insert({
    coach_id: user.id,
    lead_id: leadId || null,
    client_name: clientName,
    client_email: clientEmail,
    plan_key: planKey,
    status: "incomplete",
    stripe_checkout_session_id: session.id,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
