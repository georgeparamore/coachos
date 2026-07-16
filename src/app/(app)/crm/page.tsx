import { createClient } from "@/lib/supabase/server";
import { CrmBoard } from "@/components/crm-board";
import type { Lead } from "@/lib/leads";

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string }>;
}) {
  const { lead: initialLeadId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("coach_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">CRM &amp; pipeline</div>
          <div className="page-sub">Track every lead from first touch to signed client</div>
        </div>
      </div>

      <CrmBoard initialLeads={(leads as Lead[]) ?? []} coachId={user!.id} initialLeadId={initialLeadId} />
    </div>
  );
}
