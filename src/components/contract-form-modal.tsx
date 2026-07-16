"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Lead } from "@/lib/leads";
import type { ContractTemplate } from "@/lib/contracts";
import { getErrorMessage } from "@/lib/errors";

export function ContractFormModal({
  leads,
  templates,
  initialTemplateId,
  coachId,
  onClose,
  onCreated,
}: {
  leads: Lead[];
  templates: ContractTemplate[];
  initialTemplateId?: string;
  coachId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [leadId, setLeadId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [templateId, setTemplateId] = useState(initialTemplateId ?? templates[0]?.id ?? "");
  const [value, setValue] = useState("");
  const [body, setBody] = useState(templates.find((t) => t.id === (initialTemplateId ?? templates[0]?.id))?.body ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signLink, setSignLink] = useState<string | null>(null);

  function handleLeadSelect(id: string) {
    setLeadId(id);
    const lead = leads.find((l) => l.id === id);
    if (lead) {
      setClientName(lead.name);
      setClientEmail(lead.email ?? "");
    }
  }

  function handleTemplateSelect(id: string) {
    setTemplateId(id);
    const template = templates.find((t) => t.id === id);
    if (template) setBody(template.body);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const template = templates.find((t) => t.id === templateId);
      const supabase = createClient();
      const { data, error: insertError } = await supabase
        .from("contracts")
        .insert({
          coach_id: coachId,
          lead_id: leadId || null,
          template_id: templateId || null,
          client_name: clientName,
          client_email: clientEmail || null,
          contract_type: template?.name ?? "Coaching agreement",
          value_cents: value ? Math.round(parseFloat(value) * 100) : null,
          body,
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .select("sign_token")
        .single();

      if (insertError) throw insertError;

      const appUrl = window.location.origin;
      setSignLink(`${appUrl}/sign/${data.sign_token}`);
      onCreated();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="card-title">New contract</div>

        {signLink ? (
          <div>
            <div className="notes-box">Share this link with your client to review and sign.</div>
            <div className="form-row">
              <input className="form-input" readOnly value={signLink} onFocus={(e) => e.target.select()} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" type="button" onClick={() => navigator.clipboard.writeText(signLink)}>
                Copy link
              </button>
              <button className="btn" type="button" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {leads.length > 0 && (
              <div className="form-row">
                <label className="form-label">Link to a lead (optional)</label>
                <select className="form-input" value={leadId} onChange={(e) => handleLeadSelect(e.target.value)}>
                  <option value="">— None —</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-row">
              <label className="form-label">Client name</label>
              <input className="form-input" required value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div className="form-row">
              <label className="form-label">Client email</label>
              <input className="form-input" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
            </div>
            <div className="form-row">
              <label className="form-label">Template</label>
              <select className="form-input" value={templateId} onChange={(e) => handleTemplateSelect(e.target.value)}>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">Value ($/mo or one-time)</label>
              <input className="form-input" type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            <div className="form-row">
              <label className="form-label">Agreement text</label>
              <textarea
                className="form-input"
                style={{ minHeight: 160, fontFamily: "inherit", fontSize: 12 }}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            {error && (
              <div className="notes-box" style={{ background: "var(--red-bg)", color: "var(--red-text)" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Creating…" : "Create sign link"}
              </button>
              <button className="btn" type="button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
