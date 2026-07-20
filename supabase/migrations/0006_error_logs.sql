-- CoachOS: error logging for the corner-toast error reporting system.
-- Written by the service-role API route (src/app/api/log-error/route.ts), so
-- no anon RLS insert policy is needed. Only the admin can read these — there's
-- no "admin" role yet, so reads happen via the service role too (either the
-- Supabase dashboard directly, or the /admin/errors page gated by ADMIN_EMAIL).

create table if not exists public.error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  user_email text,
  context text not null,
  message text not null,
  stack text,
  url text,
  created_at timestamptz not null default now()
);

create index if not exists error_logs_created_at_idx on public.error_logs (created_at desc);

alter table public.error_logs enable row level security;
-- No policies: anon/authenticated roles get zero access via RLS. All reads
-- and writes go through the service-role key (server-only), which bypasses
-- RLS entirely — this is intentional, not an oversight.
