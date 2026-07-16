-- CoachOS: calendar / scheduling
-- Run via `supabase db push` or paste into the Supabase SQL editor.

create type public.event_type as enum (
  'call',
  'meeting',
  'session',
  'reminder',
  'other'
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  title text not null,
  description text,
  event_type public.event_type not null default 'meeting',
  start_time timestamptz not null,
  end_time timestamptz,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_coach_id_idx on public.events (coach_id);
create index if not exists events_start_time_idx on public.events (start_time);

alter table public.events enable row level security;

create policy "events: coach full access to own rows"
  on public.events for all
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute procedure public.set_updated_at();
