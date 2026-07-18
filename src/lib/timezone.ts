export const FALLBACK_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function listTimezones(): string[] {
  if (typeof Intl.supportedValuesOf === "function") {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return FALLBACK_TIMEZONES;
    }
  }
  return FALLBACK_TIMEZONES;
}

/** The UTC instants for local midnight → next local midnight, in the given IANA timezone. */
export function getZonedDayBounds(timeZone: string, reference: Date): { start: Date; end: Date } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .formatToParts(reference)
    .reduce<Record<string, string>>((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});

  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour === "24" ? "0" : parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  const offsetMs = asUTC - reference.getTime();

  const localMidnightUTC = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) - offsetMs;
  const start = new Date(localMidnightUTC);
  const end = new Date(localMidnightUTC + 24 * 60 * 60 * 1000);
  return { start, end };
}

export function formatDateInZone(date: Date, timeZone: string) {
  return date.toLocaleDateString(undefined, { timeZone, weekday: "long", month: "long", day: "numeric" });
}
