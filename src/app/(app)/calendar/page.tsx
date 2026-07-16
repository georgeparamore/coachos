import { createClient } from "@/lib/supabase/server";
import { CalendarView } from "@/components/calendar-view";
import type { CalendarEvent } from "@/lib/events";
import type { Lead } from "@/lib/leads";

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: events }, { data: leads }] = await Promise.all([
    supabase.from("events").select("*").eq("coach_id", user!.id).order("start_time", { ascending: true }),
    supabase.from("leads").select("*").eq("coach_id", user!.id).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Calendar</div>
          <div className="page-sub">Schedule calls, sessions, and reminders</div>
        </div>
      </div>

      <CalendarView initialEvents={(events as CalendarEvent[]) ?? []} leads={(leads as Lead[]) ?? []} coachId={user!.id} />
    </div>
  );
}
