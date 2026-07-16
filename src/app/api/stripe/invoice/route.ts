import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { leadId, clientName, clientEmail, description, amountCents } = body as {
    leadId: string | null;
    clientName: string;
    clientEmail: string;
    description: string;
    amountCents: number;
  };

  if (!clientName || !clientEmail || !description || !amountCents) {
    return NextResponse.json({ error: "Missing required invoice fields" }, { status: 400 });
  }

  const stripe = getStripe();

  const existingCustomers = await stripe.customers.list({ email: clientEmail, limit: 1 });
  const customer =
    existingCustomers.data[0] ?? (await stripe.customers.create({ name: clientName, email: clientEmail }));

  await stripe.invoiceItems.create({
    customer: customer.id,
    amount: amountCents,
    currency: "usd",
    description,
  });

  const invoice = await stripe.invoices.create({
    customer: customer.id,
    collection_method: "send_invoice",
    days_until_due: 7,
  });

  const finalized = await stripe.invoices.finalizeInvoice(invoice.id!);
  await stripe.invoices.sendInvoice(invoice.id!);

  const { data: row, error: insertError } = await supabase
    .from("invoices")
    .insert({
      coach_id: user.id,
      lead_id: leadId || null,
      client_name: clientName,
      client_email: clientEmail,
      description,
      amount_cents: amountCents,
      status: "open",
      stripe_invoice_id: finalized.id,
      hosted_invoice_url: finalized.hosted_invoice_url,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ invoice: row });
}
