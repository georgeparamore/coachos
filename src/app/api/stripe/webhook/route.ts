import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook signature/secret" }, { status: 400 });
  }

  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid signature: ${err instanceof Error ? err.message : "unknown error"}` },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await supabase
          .from("subscriptions")
          .update({
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            status: subscription.status === "active" ? "active" : "incomplete",
            current_period_end: new Date(subscription.items.data[0].current_period_end * 1000).toISOString(),
          })
          .eq("stripe_checkout_session_id", session.id);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const status = ["active", "past_due", "canceled"].includes(subscription.status)
        ? subscription.status
        : "incomplete";
      await supabase
        .from("subscriptions")
        .update({
          status,
          current_period_end: new Date(subscription.items.data[0].current_period_end * 1000).toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      await supabase
        .from("invoices")
        .update({ status: "paid", hosted_invoice_url: invoice.hosted_invoice_url })
        .eq("stripe_invoice_id", invoice.id);
      break;
    }

    case "invoice.voided": {
      const invoice = event.data.object as Stripe.Invoice;
      await supabase.from("invoices").update({ status: "void" }).eq("stripe_invoice_id", invoice.id);
      break;
    }

    case "invoice.marked_uncollectible": {
      const invoice = event.data.object as Stripe.Invoice;
      await supabase
        .from("invoices")
        .update({ status: "uncollectible" })
        .eq("stripe_invoice_id", invoice.id);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
