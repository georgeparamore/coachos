import { createClient } from "@/lib/supabase/server";
import { ContractsView } from "@/components/contracts-view";
import type { Contract, ContractTemplate } from "@/lib/contracts";
import type { Lead } from "@/lib/leads";

export default async function ContractsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: contracts }, { data: templates }, { data: leads }] = await Promise.all([
    supabase.from("contracts").select("*").eq("coach_id", user!.id).order("created_at", { ascending: false }),
    supabase.from("contract_templates").select("*").eq("coach_id", user!.id).order("created_at", { ascending: true }),
    supabase.from("leads").select("*").eq("coach_id", user!.id).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="page">
      <ContractsView
        contracts={(contracts as Contract[]) ?? []}
        templates={(templates as ContractTemplate[]) ?? []}
        leads={(leads as Lead[]) ?? []}
        coachId={user!.id}
      />
    </div>
  );
}
