"use client";

import { useEffect, useState } from "react";
import type { CalendarEvent } from "@/lib/events";

export function TodayReminders({ events }: { events: CalendarEvent[] }) {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    // Synced once from the browser's Notification API, which isn't knowable
    // during server rendering — there's no React state to derive this from.
    if (typeof window === "undefined" || !("Notification" in window)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (permission !== "granted") return;

    const timers = events
      .map((event) => {
        const msUntilStart = new Date(event.start_time).getTime() - Date.now();
        if (msUntilStart <= 0 || msUntilStart > 24 * 60 * 60 * 1000) return null;
        return setTimeout(() => {
          new Notification(event.title, {
            body: event.location ? `Starting now · ${event.location}` : "Starting now",
          });
        }, msUntilStart);
      })
      .filter((t): t is ReturnType<typeof setTimeout> => t !== null);

    return () => timers.forEach(clearTimeout);
  }, [permission, events]);

  async function enableReminders() {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }

  if (permission === "unsupported" || permission === "granted" || events.length === 0) return null;

  return (
    <div className="notes-box" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <span>Turn on reminders to get notified when today&apos;s events start (while this tab is open).</span>
      <button className="btn btn-sm" onClick={enableReminders}>
        Enable reminders
      </button>
    </div>
  );
}
