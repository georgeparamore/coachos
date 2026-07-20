import { createClient } from "@/lib/supabase/server";
import { SubscriptionsView } from "@/components/subscriptions-view";
import { DataLoadError } from "@/components/data-load-error";
import { logServerError } from "@/lib/log-server-error";
import type { Subscription } from "@/lib/billing";
import type { Lead } from "@/lib/leads";

export default async function SubscriptionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [subsRes, leadsRes] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("coach_id", user!.id).order("created_at", { ascending: false }),
    supabase
      .from("leads")
      .select("*")
      .eq("coach_id", user!.id)
      .eq("stage", "signed")
      .order("created_at", { ascending: false }),
  ]);
  const { data: subscriptions } = subsRes;
  const { data: leads } = leadsRes;

  const queryErrors = [subsRes.error, leadsRes.error].filter(Boolean);
  if (queryErrors.length > 0) {
    await Promise.all(
      queryErrors.map((err) => logServerError(err, "subscriptions.load", { userId: user!.id, userEmail: user!.email })),
    );
  }

  return (
    <div className="page">
      {queryErrors.length > 0 && <DataLoadError what="your subscriptions" />}
      <SubscriptionsView subscriptions={(subscriptions as Subscription[]) ?? []} leads={(leads as Lead[]) ?? []} />
    </div>
  );
}
