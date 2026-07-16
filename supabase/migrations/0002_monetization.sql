-- CoachOS Phase 2 schema: subscriptions, invoices, contracts
-- Run via `supabase db push` or paste into the Supabase SQL editor.

-- ---------------------------------------------------------------------------
-- subscriptions: mirrors Stripe subscription state for a coach's client
-- ---------------------------------------------------------------------------
create type public.subscription_status as enum (
  'incomplete',
  'active',
  'past_due',
  'canceled'
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  client_name text not null,
  client_email text not null,
  plan_key text not null,
  status public.subscription_status not null default 'incomplete',
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_checkout_session_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_coach_id_idx on public.subscriptions (coach_id);
create index if not exists subscriptions_stripe_subscription_id_idx on public.subscriptions (stripe_subscription_id);

alter table public.subscriptions enable row level security;

create policy "subscriptions: coach full access to own rows"
  on public.subscriptions for all
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- invoices: one-time Stripe invoices
-- ---------------------------------------------------------------------------
create type public.invoice_status as enum (
  'draft',
  'open',
  'paid',
  'void',
  'uncollectible'
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  client_name text not null,
  client_email text not null,
  description text not null,
  amount_cents integer not null,
  status public.invoice_status not null default 'draft',
  stripe_invoice_id text unique,
  hosted_invoice_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_coach_id_idx on public.invoices (coach_id);
create index if not exists invoices_stripe_invoice_id_idx on public.invoices (stripe_invoice_id);

alter table public.invoices enable row level security;

create policy "invoices: coach full access to own rows"
  on public.invoices for all
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- contract_templates: coach-editable agreement text
-- ---------------------------------------------------------------------------
create table if not exists public.contract_templates (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  summary text not null default '',
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contract_templates_coach_id_idx on public.contract_templates (coach_id);

alter table public.contract_templates enable row level security;

create policy "contract_templates: coach full access to own rows"
  on public.contract_templates for all
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

drop trigger if exists contract_templates_set_updated_at on public.contract_templates;
create trigger contract_templates_set_updated_at
  before update on public.contract_templates
  for each row execute procedure public.set_updated_at();

-- Seed three starter templates for every new coach, alongside their profile row.
create or replace function public.seed_contract_templates()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'coach' then
    insert into public.contract_templates (coach_id, name, summary, body) values
      (
        new.id,
        'Elite coaching agreement',
        '1:1 coaching · 3-month minimum',
        E'ELITE 1:1 COACHING AGREEMENT\n\nThis agreement is between [Coach Name] ("Coach") and [Client Name] ("Client").\n\n1. SERVICES\nCoach will provide weekly 1:1 coaching calls, a custom roadmap, and priority messaging access for the duration of this agreement.\n\n2. TERM\nThis agreement begins on [Start Date] and continues for a minimum of 3 months, after which it renews month-to-month until either party cancels with 30 days notice.\n\n3. INVESTMENT\nClient agrees to pay [Amount] per month, billed automatically.\n\n4. ACKNOWLEDGEMENT\nBy signing below, Client agrees to the terms of this agreement.'
      ),
      (
        new.id,
        'Group program agreement',
        'Community & group coaching',
        E'GROUP PROGRAM AGREEMENT\n\nThis agreement is between [Coach Name] ("Coach") and [Client Name] ("Client").\n\n1. SERVICES\nCoach will provide access to the group program, including weekly group calls, community access, and program materials.\n\n2. TERM\nThis agreement begins on [Start Date] and continues month-to-month until either party cancels with 30 days notice.\n\n3. INVESTMENT\nClient agrees to pay [Amount] per month, billed automatically.\n\n4. ACKNOWLEDGEMENT\nBy signing below, Client agrees to the terms of this agreement.'
      ),
      (
        new.id,
        'VIP day agreement',
        'One-time intensive session',
        E'VIP DAY AGREEMENT\n\nThis agreement is between [Coach Name] ("Coach") and [Client Name] ("Client").\n\n1. SERVICES\nCoach will provide one intensive VIP day session on [Session Date], including pre-work, a live working session, and a written follow-up plan.\n\n2. INVESTMENT\nClient agrees to pay [Amount], due in full before the session date.\n\n3. ACKNOWLEDGEMENT\nBy signing below, Client agrees to the terms of this agreement.'
      );
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_created_seed_templates on public.profiles;
create trigger on_profile_created_seed_templates
  after insert on public.profiles
  for each row execute procedure public.seed_contract_templates();

-- ---------------------------------------------------------------------------
-- contracts: a template sent to a specific client, with a public sign link
-- ---------------------------------------------------------------------------
create type public.contract_status as enum (
  'draft',
  'sent',
  'viewed',
  'signed'
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  template_id uuid references public.contract_templates (id) on delete set null,
  client_name text not null,
  client_email text,
  contract_type text not null,
  value_cents integer,
  body text not null,
  status public.contract_status not null default 'draft',
  sign_token uuid not null default gen_random_uuid(),
  signer_name text,
  signed_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists contracts_sign_token_idx on public.contracts (sign_token);
create index if not exists contracts_coach_id_idx on public.contracts (coach_id);

alter table public.contracts enable row level security;

create policy "contracts: coach full access to own rows"
  on public.contracts for all
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

drop trigger if exists contracts_set_updated_at on public.contracts;
create trigger contracts_set_updated_at
  before update on public.contracts
  for each row execute procedure public.set_updated_at();

-- Public signing page reads/writes a single contract by sign_token via the
-- service-role API route in src/app/api/contracts/[token] — it deliberately
-- does NOT get an anon RLS policy here, since "know the token" should not by
-- itself grant open row access outside that narrow, validated code path.
