"use client";

import { useState } from "react";
import { getErrorMessage } from "@/lib/errors";
import { useErrorToast } from "@/components/error-toast-provider";

export function SignContractForm({ token }: { token: string }) {
  const [signerName, setSignerName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);
  const { showError } = useErrorToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/contracts/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signerName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sign");
      setSigned(true);
    } catch (err) {
      setError(getErrorMessage(err));
      showError(err, "contract-sign.public");
    } finally {
      setSaving(false);
    }
  }

  if (signed) {
    return <div className="notes-box" style={{ background: "var(--green-bg)", color: "var(--green-text)" }}>Signed — thank you! A copy of this agreement is on record with your coach.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="card-title">Sign this agreement</div>
      <div className="form-row">
        <label className="form-label">Type your full name to sign</label>
        <input className="form-input" required value={signerName} onChange={(e) => setSignerName(e.target.value)} />
      </div>
      {error && (
        <div className="notes-box" style={{ background: "var(--red-bg)", color: "var(--red-text)" }}>
          {error}
        </div>
      )}
      <button className="btn btn-primary" type="submit" disabled={saving}>
        {saving ? "Signing…" : "Sign agreement"}
      </button>
    </form>
  );
}
