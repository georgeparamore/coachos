// The common list most booking/scheduling sites offer, rather than the full
// ~400-entry IANA database — easier to actually find your own timezone in.
export const COMMON_TIMEZONES: { value: string; label: string }[] = [
  { value: "Pacific/Honolulu", label: "Hawaii Time" },
  { value: "America/Anchorage", label: "Alaska Time" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Phoenix", label: "Arizona (no DST)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "America/Halifax", label: "Atlantic Time (Canada)" },
  { value: "America/Sao_Paulo", label: "Brasília Time" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Central European Time (Paris, Berlin)" },
  { value: "Europe/Athens", label: "Eastern European Time (Athens, Cairo)" },
  { value: "Europe/Moscow", label: "Moscow" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Kolkata", label: "India" },
  { value: "Asia/Bangkok", label: "Bangkok" },
  { value: "Asia/Singapore", label: "Singapore / Hong Kong" },
  { value: "Asia/Tokyo", label: "Tokyo / Seoul" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "Pacific/Auckland", label: "Auckland" },
];

export function listTimezones() {
  return COMMON_TIMEZONES;
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
