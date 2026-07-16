import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AVATAR_CLASSES, initialsOf } from "@/lib/format";
import { EVENT_TYPE_BADGE, EVENT_TYPE_LABEL, type CalendarEvent } from "@/lib/events";
import { TodayReminders } from "@/components/today-reminders";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const [{ data: leads }, { data: todaysEvents }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, name, stage, source, created_at")
      .eq("coach_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("events")
      .select("*")
      .eq("coach_id", user!.id)
      .gte("start_time", startOfDay.toISOString())
      .lt("start_time", endOfDay.toISOString())
      .order("start_time", { ascending: true }),
  ]);

  const allLeads = leads ?? [];
  const activeClients = allLeads.filter((l) => l.stage === "signed").length;
  const openLeads = allLeads.filter((l) => l.stage !== "signed").length;
  const recentLeads = allLeads.slice(0, 5);
  const events = (todaysEvents as CalendarEvent[]) ?? [];

  const formattedDate = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Good morning, Coach — {formattedDate}</div>
          <div className="page-sub">Here&apos;s what&apos;s happening with your business today</div>
        </div>
      </div>

      <TodayReminders events={events} />

      <div className="notes-box">
        Phase 1: Active clients &amp; open leads below are live from your CRM. Revenue, course
        enrollments, and billing metrics connect once Stripe (Phase 2) and courses (Phase 3) are wired up.
      </div>

      <div className="metrics">
        <div className="metric">
          <div className="metric-label">Active clients</div>
          <div className="metric-value">{activeClients}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Monthly revenue</div>
          <div className="metric-value">—</div>
          <div className="metric-delta delta-neutral">Connect Stripe in Phase 2</div>
        </div>
        <div className="metric">
          <div className="metric-label">Open leads</div>
          <div className="metric-value">{openLeads}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Course enrollments</div>
          <div className="metric-value">—</div>
          <div className="metric-delta delta-neutral">Connect courses in Phase 3</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">Today&apos;s schedule</div>
          {events.length === 0 ? (
            <div className="empty-state">
              <p>Nothing on the calendar today.</p>
            </div>
          ) : (
            events.map((event) => (
              <Link
                href={`/calendar`}
                className="list-row list-row-clickable"
                key={event.id}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div>
                  <div className="name">{event.title}</div>
                  <div className="sub">
                    {new Date(event.start_time).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                  </div>
                </div>
                <span className={`badge ${EVENT_TYPE_BADGE[event.event_type]}`}>{EVENT_TYPE_LABEL[event.event_type]}</span>
              </Link>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-title">Recent leads</div>
          {recentLeads.length === 0 ? (
            <div className="empty-state">
              <p>No leads yet. Add your first lead from the CRM &amp; pipeline page.</p>
            </div>
          ) : (
            recentLeads.map((lead) => (
              <Link
                href={`/crm?lead=${lead.id}`}
                className="list-row list-row-clickable"
                key={lead.id}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="list-row-left">
                  <div className={`avatar ${AVATAR_CLASSES[lead.id.charCodeAt(0) % AVATAR_CLASSES.length]}`}>
                    {initialsOf(lead.name)}
                  </div>
                  <div>
                    <div className="name">{lead.name}</div>
                    <div className="sub">{lead.source || "No source recorded"}</div>
                  </div>
                </div>
                <span className="badge badge-blue">{lead.stage.replace("_", " ")}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
