"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";

export default function AppErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportError(error, "app-error-boundary");
  }, [error]);

  return (
    <div className="page">
      <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
        <div className="card-title">This page couldn&apos;t load</div>
        <p className="sub" style={{ marginBottom: 18 }}>
          Something went wrong loading this section. It&apos;s been reported automatically.
        </p>
        <button className="btn btn-primary" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
