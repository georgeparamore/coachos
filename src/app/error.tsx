"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";

export default function GlobalErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportError(error, "root-error-boundary");
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: 20,
      }}
    >
      <div className="card" style={{ width: 420, marginBottom: 0, textAlign: "center" }}>
        <div className="card-title">Something went wrong</div>
        <p className="sub" style={{ marginBottom: 18 }}>
          This page hit an unexpected error. It&apos;s been reported automatically — try again, or head back to the
          dashboard.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={reset}>
            Try again
          </button>
          <a className="btn" href="/dashboard">
            Go to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
