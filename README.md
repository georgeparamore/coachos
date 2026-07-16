# CoachOS

Full-stack coaching/consulting platform combining CRM (leads, pipeline, proposals),
billing (subscriptions, invoices, contracts), courses, and community — built for a
solo coach to run their business from one place.

This repo is the real build. The visual/interaction design is a direct port of the
original clickable HTML demo (`coachos-platform.html`, kept as design reference) —
same tokens, same layout, same components.

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database & auth | Supabase |
| Payments & subscriptions | Stripe (Phase 2) |
| Video hosting & streaming | Bunny.net (Phase 3) |
| App hosting | Vercel or Railway |
| Email/notifications | SMTP via Resend or similar (Phase 4) |

## Phase 1 — Foundation (this build)

- [x] Supabase project schema: `profiles` (coach/client roles) + `leads` (CRM pipeline), with RLS
- [x] Next.js App Router structure, design system ported from the HTML reference
- [x] Auth: coach login/signup + client login, role-checked against `profiles.role`
- [x] CRM: real lead CRUD (add / edit / change stage / delete) wired to Supabase, kanban by stage
- [x] Dashboard: active clients & open leads pulled live from Supabase
- [ ] Everything else (subscriptions, invoices, contracts, courses, community) is stubbed with
      the ported UI and a "Phase N" notice — see `src/app/(app)/*/page.tsx`

## Local setup

1. Create a Supabase project.
2. In the SQL editor, run `supabase/migrations/0001_init.sql`.
3. Copy `.env.example` to `.env.local` and fill in your project's URL and anon key
   (Project Settings → API in the Supabase dashboard).
4. `npm install`
5. `npm run dev`

Sign up at `/signup` to create your coach account (this creates a `profiles` row with
`role = 'coach'` via a database trigger on `auth.users`). Client accounts are created the
same way with `role = 'client'` in user metadata — the coach-invite flow for that lands in
a later phase.

## Project structure

```
src/app/(app)/          authenticated shell (sidebar) + one folder per screen
src/app/login, /signup  auth pages
src/components/         shared UI: sidebar, nav config/icons, theme toggle, CRM board, forms
src/lib/supabase/       browser client, server client, middleware session refresh
src/proxy.ts            Next.js 16 request middleware — redirects unauthenticated users to /login
supabase/migrations/    SQL schema + RLS policies
```

## Build order (remaining phases)

**Phase 2 — Monetization**
Stripe subscriptions/checkout/webhooks · invoices (generate, send, mark paid) · contract
templates with send-link + signature tracking.

**Phase 3 — Courses**
Bunny.net video upload/streaming · course/module/lesson data model · enrollment tied to
subscription plan · per-lesson progress tracking.

**Phase 4 — Community + polish**
Community feed (posts, replies, announcements) · client-facing portal (separate view from
the coach dashboard) · email notifications · custom domain + branding.

## Key decisions still to make

- Platform name (currently "CoachOS" — placeholder)
- Actual plan names, prices, and what's included in each
- Course lineup — titles, modules, which plans get access
- Contract templates — exact language and terms
- What lead sources to track (website form, Instagram, referral, etc.)
