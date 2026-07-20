-- CoachOS: sample data for the demo account.
--
-- Run this AFTER creating the demo coach account (sign up at /signup with the
-- same email/password you put in NEXT_PUBLIC_DEMO_EMAIL / _PASSWORD).
--
-- Replace REPLACE_WITH_DEMO_COACH_ID below with that account's id — find it
-- in Supabase: Table Editor -> profiles -> the row with the demo email ->
-- copy its `id`. Then paste this whole file into the SQL Editor and run it.

do $$
declare
  demo_coach_id uuid := 4767331f-e485-457a-8bb3-c7e2891f6351;
begin
  insert into public.leads (coach_id, name, email, phone, source, stage, value_cents, fit_score, notes) values
    (demo_coach_id, 'Priya Patel', 'priya@example.com', null, 'Website form', 'new', null, null, null),
    (demo_coach_id, 'James Carter', 'james@example.com', null, 'Referral', 'new', null, null, null),
    (demo_coach_id, 'Nina Torres', 'nina@example.com', null, 'Instagram DM', 'new', null, null, null),
    (demo_coach_id, 'Marcus Johnson', 'marcus@example.com', null, 'Website form', 'in_conversation', 50000, 8, 'Discovery call went well.'),
    (demo_coach_id, 'Sofia Lee', 'sofia@example.com', null, 'Referral', 'in_conversation', 32000, 9, 'Proposal sent, awaiting reply.'),
    (demo_coach_id, 'David Wu', 'david@example.com', null, 'Instagram DM', 'proposal_sent', 50000, 8, 'Negotiating terms.'),
    (demo_coach_id, 'Rachel Kim', 'rachel@example.com', null, 'Website form', 'proposal_sent', 20000, 6, 'Reviewing proposal.'),
    (demo_coach_id, 'Aisha Brown', 'aisha@example.com', null, 'Referral', 'signed', 20000, 9, 'Active client.'),
    (demo_coach_id, 'Carlos Rivera', 'carlos@example.com', null, 'Website form', 'signed', 12000, 7, 'Active client.');

  insert into public.events (coach_id, lead_id, title, event_type, start_time, location) values
    (demo_coach_id, null, 'Discovery call — Marcus Johnson', 'call', now() + interval '3 hours', 'Zoom'),
    (demo_coach_id, null, 'Weekly group coaching call', 'session', now() + interval '1 day 2 hours', 'Zoom'),
    (demo_coach_id, null, 'VIP day — strategy session', 'session', now() + interval '4 days', 'In person'),
    (demo_coach_id, null, 'Follow up with Rachel Kim', 'reminder', now() + interval '6 days', null);
end $$;
