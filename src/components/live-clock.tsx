"use client";

import { useEffect, useState } from "react";

export function LiveClock({ timezone }: { timezone: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Deliberately client-only: the server can't know "now" at the moment this
    // renders in the viewer's browser, so we start blank and fill in on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000 * 15);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const time = now.toLocaleTimeString(undefined, { timeZone: timezone, hour: "numeric", minute: "2-digit" });
  const zoneLabel = now
    .toLocaleTimeString(undefined, { timeZone: timezone, timeZoneName: "short" })
    .split(" ")
    .pop();

  return (
    <span className="sub" style={{ fontVariantNumeric: "tabular-nums" }}>
      {time} {zoneLabel}
    </span>
  );
}
