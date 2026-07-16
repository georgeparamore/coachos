"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Role = "coach" | "client";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("coach");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (!profile || profile.role !== role) {
      await supabase.auth.signOut();
      setError(`No ${role} account found for these credentials.`);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      <div className="card" style={{ width: 380, marginBottom: 0 }}>
        <div className="logo-name" style={{ marginBottom: 2 }}>
          CoachOS
        </div>
        <div className="page-sub" style={{ marginBottom: 20 }}>
          Sign in to your platform
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 18,
            background: "var(--surface2)",
            padding: 4,
            borderRadius: "var(--radius)",
          }}
        >
          {(["coach", "client"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className="btn btn-sm"
              style={{
                flex: 1,
                justifyContent: "center",
                border: "none",
                background: role === r ? "var(--surface)" : "transparent",
                fontWeight: role === r ? 500 : 400,
              }}
            >
              {r === "coach" ? "Coach login" : "Client login"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="notes-box" style={{ background: "var(--red-bg)", color: "var(--red-text)" }}>
              {error}
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {role === "coach" && (
          <div className="sub" style={{ marginTop: 14, textAlign: "center" }}>
            No account yet? <Link href="/signup" style={{ color: "var(--accent)" }}>Create one</Link>
          </div>
        )}
      </div>
    </div>
  );
}
