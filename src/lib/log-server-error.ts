import { createServiceClient } from "@/lib/supabase/service";

/** Server-side (RSC/route handler) equivalent of reportError — call this when
 * a Supabase query returns an error you're about to swallow into an empty
 * state, so it still reaches the admin error log. */
export async function logServerError(
  error: { message: string } | null | undefined,
  context: string,
  extra?: { userId?: string; userEmail?: string },
) {
  if (!error) return;
  try {
    const service = createServiceClient();
    await service.from("error_logs").insert({
      user_id: extra?.userId ?? null,
      user_email: extra?.userEmail ?? null,
      context,
      message: error.message,
    });
  } catch {
    // If logging itself fails, there's nothing more to do — don't throw from
    // inside error-handling code.
  }
}
