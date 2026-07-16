"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LEAD_STAGES, type Lead, type LeadInput } from "@/lib/leads";
import { LeadFormModal } from "@/components/lead-form-modal";

export function CrmBoard({ initialLeads, coachId }: { initialLeads: Lead[]; coachId: string }) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [editingLead, setEditingLead] = useState<Lead | null | undefined>(undefined);

  async function handleSave(input: LeadInput) {
    const supabase = createClient();

    if (editingLead) {
      const { data, error } = await supabase
        .from("leads")
        .update(input)
        .eq("id", editingLead.id)
        .select()
        .single();
      if (error) throw error;
      setLeads((prev) => prev.map((l) => (l.id === data.id ? (data as Lead) : l)));
    } else {
      const { data, error } = await supabase
        .from("leads")
        .insert({ ...input, coach_id: coachId })
        .select()
        .single();
      if (error) throw error;
      setLeads((prev) => [data as Lead, ...prev]);
    }

    setEditingLead(undefined);
    router.refresh();
  }

  async function handleDelete() {
    if (!editingLead) return;
    const supabase = createClient();
    const { error } = await supabase.from("leads").delete().eq("id", editingLead.id);
    if (error) throw error;
    setLeads((prev) => prev.filter((l) => l.id !== editingLead.id));
    setEditingLead(undefined);
    router.refresh();
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setEditingLead(null)}>
          Add lead
        </button>
      </div>

      <div className="pipeline-wrap">
        {LEAD_STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.key);
          return (
            <div className="pipeline-col" key={stage.key}>
              <div className="pipeline-col-header">
                {stage.label} <span className={`badge ${stage.badge}`}>{stageLeads.length}</span>
              </div>
              {stageLeads.map((lead) => (
                <div className="pipeline-card" key={lead.id} onClick={() => setEditingLead(lead)}>
                  <div className="pipeline-card-name">{lead.name}</div>
                  <div className="pipeline-card-meta">
                    {[lead.source, lead.value_cents != null ? `$${lead.value_cents / 100}/mo` : null]
                      .filter(Boolean)
                      .join(" · ") || "No details yet"}
                  </div>
                  {lead.fit_score != null && <span className="badge badge-blue">Fit {lead.fit_score}/10</span>}
                </div>
              ))}
              {stageLeads.length === 0 && (
                <div className="sub" style={{ padding: "8px 0" }}>
                  No leads in this stage
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editingLead !== undefined && (
        <LeadFormModal
          lead={editingLead}
          onClose={() => setEditingLead(undefined)}
          onSave={handleSave}
          onDelete={editingLead ? handleDelete : undefined}
        />
      )}
    </>
  );
}
