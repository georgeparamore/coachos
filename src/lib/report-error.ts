import { getErrorMessage } from "@/lib/errors";

/** Fire-and-forget client-side error report. Returns a short id you can show
 * the user as a reference (e.g. "Error ref: a1b2c3d4") if the log succeeds. */
export async function reportError(err: unknown, context: string): Promise<string | null> {
  const message = getErrorMessage(err);
  const stack = err instanceof Error ? err.stack : undefined;

  try {
    const res = await fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context,
        message,
        stack,
        url: typeof window !== "undefined" ? window.location.href : undefined,
      }),
    });
    const data = await res.json();
    return typeof data.id === "string" ? data.id.slice(0, 8) : null;
  } catch {
    // Logging failed too — nothing more we can do client-side.
    return null;
  }
}
