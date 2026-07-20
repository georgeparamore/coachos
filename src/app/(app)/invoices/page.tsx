import { createClient } from "@/lib/supabase/server";
import { InvoicesView } from "@/components/invoices-view";
import { DataLoadError } from "@/components/data-load-error";
import { logServerError } from "@/lib/log-server-error";
import type { Invoice } from "@/lib/billing";
import type { Lead } from "@/lib/leads";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [invoicesRes, leadsRes] = await Promise.all([
    supabase.from("invoices").select("*").eq("coach_id", user!.id).order("created_at", { ascending: false }),
    supabase
      .from("leads")
      .select("*")
      .eq("coach_id", user!.id)
      .eq("stage", "signed")
      .order("created_at", { ascending: false }),
  ]);
  const { data: invoices } = invoicesRes;
  const { data: leads } = leadsRes;

  const queryErrors = [invoicesRes.error, leadsRes.error].filter(Boolean);
  if (queryErrors.length > 0) {
    await Promise.all(
      queryErrors.map((err) => logServerError(err, "invoices.load", { userId: user!.id, userEmail: user!.email })),
    );
  }

  return (
    <div className="page">
      {queryErrors.length > 0 && <DataLoadError what="your invoices" />}
      <InvoicesView invoices={(invoices as Invoice[]) ?? []} leads={(leads as Lead[]) ?? []} />
    </div>
  );
}
