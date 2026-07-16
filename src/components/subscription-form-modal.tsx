"use client";

import { useState } from "react";
import type { Lead } from "@/lib/leads";

const PLAN_OPTIONS = [
  { key: "starter", label: "Starter — $120/mo" },
  { key: "group", label: "Group program — $200/mo" },
  { key: "elite", label: "Elite 1:1 — $500/mo" },
];

export function SubscriptionFormModal({
  leads,
  onClose,
  onCreated,
}: {
  leads: Lead[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [leadId, setLeadId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [planKey, setPlanKey] = useState("starter");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  function handleLeadSelect(id: string) {
    setLeadId(id);
    const lead = leads.find((l) => l.id === id);
    if (lead) {
      setClientName(lead.name);
      setClientEmail(lead.email ?? "");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: leadId || null, clientName, clientEmail, planKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create checkout link");
      setCheckoutUrl(data.url);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="card-title">New subscription</div>

        {checkoutUrl ? (
          <div>
            <div className="notes-box">Share this checkout link with your client to start their subscription.</div>
            <div className="form-row">
              <input className="form-input" readOnly value={checkoutUrl} onFocus={(e) => e.target.select()} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => navigator.clipboard.writeText(checkoutUrl)}
              >
                Copy link
              </button>
              <a className="btn" href={checkoutUrl} target="_blank" rel="noreferrer">
                Open
              </a>
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
              <input
                className="form-input"
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label className="form-label">Plan</label>
              <select className="form-input" value={planKey} onChange={(e) => setPlanKey(e.target.value)}>
                {PLAN_OPTIONS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="notes-box" style={{ background: "var(--red-bg)", color: "var(--red-text)" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Generating…" : "Generate checkout link"}
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
