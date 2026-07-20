import { createClient } from "@/lib/supabase/server";
import { ContractsView } from "@/components/contracts-view";
import { DataLoadError } from "@/components/data-load-error";
import { logServerError } from "@/lib/log-server-error";
import type { Contract, ContractTemplate } from "@/lib/contracts";
import type { Lead } from "@/lib/leads";

export default async function ContractsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [contractsRes, templatesRes, leadsRes] = await Promise.all([
    supabase.from("contracts").select("*").eq("coach_id", user!.id).order("created_at", { ascending: false }),
    supabase.from("contract_templates").select("*").eq("coach_id", user!.id).order("created_at", { ascending: true }),
    supabase.from("leads").select("*").eq("coach_id", user!.id).order("created_at", { ascending: false }),
  ]);
  const { data: contracts } = contractsRes;
  const { data: templates } = templatesRes;
  const { data: leads } = leadsRes;

  const queryErrors = [contractsRes.error, templatesRes.error, leadsRes.error].filter(Boolean);
  if (queryErrors.length > 0) {
    await Promise.all(
      queryErrors.map((err) => logServerError(err, "contracts.load", { userId: user!.id, userEmail: user!.email })),
    );
  }

  return (
    <div className="page">
      {queryErrors.length > 0 && <DataLoadError what="your contracts" />}
      <ContractsView
        contracts={(contracts as Contract[]) ?? []}
        templates={(templates as ContractTemplate[]) ?? []}
        leads={(leads as Lead[]) ?? []}
        coachId={user!.id}
      />
    </div>
  );
}
