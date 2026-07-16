import { createClient } from "@/lib/supabase/server";
import { InvoicesView } from "@/components/invoices-view";
import type { Invoice } from "@/lib/billing";
import type { Lead } from "@/lib/leads";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: invoices }, { data: leads }] = await Promise.all([
    supabase.from("invoices").select("*").eq("coach_id", user!.id).order("created_at", { ascending: false }),
    supabase
      .from("leads")
      .select("*")
      .eq("coach_id", user!.id)
      .eq("stage", "signed")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="page">
      <InvoicesView invoices={(invoices as Invoice[]) ?? []} leads={(leads as Lead[]) ?? []} />
    </div>
  );
}
