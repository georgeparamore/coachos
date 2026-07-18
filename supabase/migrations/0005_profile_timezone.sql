-- CoachOS: per-coach timezone, used for the dashboard greeting/clock and for
-- computing "today" boundaries (e.g. today's schedule) correctly.
alter table public.profiles
  add column if not exists timezone text not null default 'UTC';
