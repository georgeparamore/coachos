"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EVENT_TYPE_BADGE, EVENT_TYPE_LABEL, isSameDay, type CalendarEvent, type EventType } from "@/lib/events";
import { EventFormModal } from "@/components/event-form-modal";
import type { Lead } from "@/lib/leads";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildMonthGrid(monthStart: Date) {
  const firstWeekday = monthStart.getDay();
  const gridStart = new Date(monthStart);
  gridStart.setDate(gridStart.getDate() - firstWeekday);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }
  return days;
}

export function CalendarView({
  initialEvents,
  leads,
  coachId,
}: {
  initialEvents: CalendarEvent[];
  leads: Lead[];
  coachId: string;
}) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [modalState, setModalState] = useState<{ event: CalendarEvent | null } | null>(null);

  const days = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);
  const today = new Date();

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = new Date(event.start_time).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(event);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    return map;
  }, [events]);

  const selectedDayEvents = eventsByDay.get(selectedDate.toDateString()) ?? [];

  async function handleSave(input: {
    title: string;
    description: string;
    event_type: EventType;
    start_time: string;
    end_time: string | null;
    location: string;
    lead_id: string | null;
  }) {
    const supabase = createClient();
    if (modalState?.event) {
      const { data, error } = await supabase
        .from("events")
        .update(input)
        .eq("id", modalState.event.id)
        .select()
        .single();
      if (error) throw error;
      setEvents((prev) => prev.map((e) => (e.id === data.id ? (data as CalendarEvent) : e)));
    } else {
      const { data, error } = await supabase
        .from("events")
        .insert({ ...input, coach_id: coachId })
        .select()
        .single();
      if (error) throw error;
      setEvents((prev) => [...prev, data as CalendarEvent]);
    }
    setModalState(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!modalState?.event) return;
    const supabase = createClient();
    const { error } = await supabase.from("events").delete().eq("id", modalState.event.id);
    if (error) throw error;
    setEvents((prev) => prev.filter((e) => e.id !== modalState.event!.id));
    setModalState(null);
    router.refresh();
  }

  return (
    <>
      <div className="two-col" style={{ gridTemplateColumns: "1fr 320px", alignItems: "start" }}>
        <div className="card">
          <div className="calendar-header">
            <button
              className="btn btn-sm"
              onClick={() => setMonthCursor((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            >
              ←
            </button>
            <div className="calendar-month-label">
              {monthCursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </div>
            <button
              className="btn btn-sm"
              onClick={() => setMonthCursor((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            >
              →
            </button>
          </div>

          <div className="calendar-grid" style={{ marginBottom: 6 }}>
            {WEEKDAYS.map((day) => (
              <div className="calendar-weekday" key={day}>
                {day}
              </div>
            ))}
          </div>
          <div className="calendar-grid">
            {days.map((day) => {
              const dayEvents = eventsByDay.get(day.toDateString()) ?? [];
              const classes = [
                "calendar-day",
                day.getMonth() !== monthCursor.getMonth() ? "is-outside" : "",
                isSameDay(day, today) ? "is-today" : "",
                isSameDay(day, selectedDate) ? "is-selected" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <div className={classes} key={day.toISOString()} onClick={() => setSelectedDate(day)}>
                  <div className="calendar-day-number">{day.getDate()}</div>
                  {dayEvents.length > 0 && (
                    <div className="calendar-day-dots">
                      {dayEvents.slice(0, 4).map((e) => (
                        <div className="calendar-day-dot" key={e.id} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <button className="btn btn-primary btn-sm" style={{ marginBottom: 14 }} onClick={() => setModalState({ event: null })}>
            Add event
          </button>
          {selectedDayEvents.length === 0 ? (
            <div className="sub">No events scheduled.</div>
          ) : (
            selectedDayEvents.map((event) => (
              <div className="list-row list-row-clickable" key={event.id} onClick={() => setModalState({ event })}>
                <div>
                  <div className="name">{event.title}</div>
                  <div className="sub">
                    {new Date(event.start_time).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                    {event.location ? ` · ${event.location}` : ""}
                  </div>
                </div>
                <span className={`badge ${EVENT_TYPE_BADGE[event.event_type]}`}>{EVENT_TYPE_LABEL[event.event_type]}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {modalState && (
        <EventFormModal
          event={modalState.event}
          defaultDate={selectedDate}
          leads={leads}
          onClose={() => setModalState(null)}
          onSave={handleSave}
          onDelete={modalState.event ? handleDelete : undefined}
        />
      )}
    </>
  );
}
