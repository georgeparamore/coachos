"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { listTimezones } from "@/lib/timezone";

export function BusinessProfileForm({
  fullName,
  email,
  timezone,
}: {
  fullName: string;
  email: string;
  timezone: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(fullName);
  const [tz, setTz] = useState(timezone);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [timezones] = useState(() => listTimezones());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ full_name: name, timezone: tz }).eq("id", user.id);
    }
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <label className="form-label">Your name</label>
        <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-row">
        <label className="form-label">Email address</label>
        <input className="form-input" value={email} disabled />
      </div>
      <div className="form-row">
        <label className="form-label">Time zone</label>
        <select className="form-input" value={tz} onChange={(e) => setTz(e.target.value)}>
          {timezones.map((z) => (
            <option key={z.value} value={z.value}>
              {z.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label className="form-label">Custom domain (when live)</label>
        <input className="form-input" placeholder="yourname.com" disabled />
      </div>
      <button className="btn btn-primary" type="submit" disabled={saving}>
        {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
      </button>
    </form>
  );
}
