"use client";

import { useState } from "react";
import type { Lead } from "@/lib/leads";
import { getErrorMessage } from "@/lib/errors";

type Props = {
  leads: Lead[];
  onClose: () => void;
  onCreated: () => void;
};

export function InvoiceFormModal({ leads, onClose, onCreated }: Props) {
  const [leadId, setLeadId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const res = await fetch("/api/stripe/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: leadId || null,
          clientName,
          clientEmail,
          description,
          amountCents: Math.round(parseFloat(amount) * 100),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create invoice");
      onCreated();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="card-title">New invoice</div>
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
            <label className="form-label">Description</label>
            <input
              className="form-input"
              required
              placeholder="e.g. VIP Day — strategy session"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label className="form-label">Amount ($)</label>
            <input
              className="form-input"
              type="number"
              min="1"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {error && (
            <div className="notes-box" style={{ background: "var(--red-bg)", color: "var(--red-text)" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Sending…" : "Create & send invoice"}
            </button>
            <button className="btn" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
