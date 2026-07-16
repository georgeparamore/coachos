import { createClient } from "@/lib/supabase/server";
import { SubscriptionsView } from "@/components/subscriptions-view";
import type { Subscription } from "@/lib/billing";
import type { Lead } from "@/lib/leads";

export default async function SubscriptionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: subscriptions }, { data: leads }] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("coach_id", user!.id).order("created_at", { ascending: false }),
    supabase
      .from("leads")
      .select("*")
      .eq("coach_id", user!.id)
      .eq("stage", "signed")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="page">
      <SubscriptionsView subscriptions={(subscriptions as Subscription[]) ?? []} leads={(leads as Lead[]) ?? []} />
    </div>
  );
}
