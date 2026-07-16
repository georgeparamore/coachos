export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";

export type Invoice = {
  id: string;
  coach_id: string;
  lead_id: string | null;
  client_name: string;
  client_email: string;
  description: string;
  amount_cents: number;
  status: InvoiceStatus;
  stripe_invoice_id: string | null;
  hosted_invoice_url: string | null;
  created_at: string;
};

export const INVOICE_STATUS_BADGE: Record<InvoiceStatus, string> = {
  draft: "badge-blue",
  open: "badge-amber",
  paid: "badge-green",
  void: "badge-red",
  uncollectible: "badge-red",
};

export type SubscriptionStatus = "incomplete" | "active" | "past_due" | "canceled";

export type Subscription = {
  id: string;
  coach_id: string;
  lead_id: string | null;
  client_name: string;
  client_email: string;
  plan_key: string;
  status: SubscriptionStatus;
  current_period_end: string | null;
  created_at: string;
};

export const SUBSCRIPTION_STATUS_BADGE: Record<SubscriptionStatus, string> = {
  incomplete: "badge-blue",
  active: "badge-green",
  past_due: "badge-amber",
  canceled: "badge-red",
};
