"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { getErrorMessage } from "@/lib/errors";
import { reportError } from "@/lib/report-error";

type Toast = {
  id: number;
  message: string;
  context: string;
  refId: string | null;
};

type ErrorToastContextValue = {
  showError: (err: unknown, context: string) => void;
};

const ErrorToastContext = createContext<ErrorToastContextValue | null>(null);

export function useErrorToast() {
  const ctx = useContext(ErrorToastContext);
  if (!ctx) throw new Error("useErrorToast must be used within ErrorToastProvider");
  return ctx;
}

let nextId = 1;

export function ErrorToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showError = useCallback(
    (err: unknown, context: string) => {
      const id = nextId++;
      const message = getErrorMessage(err);
      setToasts((prev) => [...prev, { id, message, context, refId: null }]);

      reportError(err, context).then((refId) => {
        if (refId) {
          setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, refId } : t)));
        }
      });

      setTimeout(() => dismiss(id), 20000);
    },
    [dismiss],
  );

  return (
    <ErrorToastContext.Provider value={{ showError }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 200,
          maxWidth: 340,
        }}
      >
        {toasts.map((toast) => (
          <ErrorToastCard key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ErrorToastContext.Provider>
  );
}

function ErrorToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  function copyDetails() {
    const details = [
      `Context: ${toast.context}`,
      `Message: ${toast.message}`,
      toast.refId ? `Ref: ${toast.refId}` : null,
      `URL: ${typeof window !== "undefined" ? window.location.href : ""}`,
      `Time: ${new Date().toISOString()}`,
    ]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard.writeText(details);
  }

  return (
    <div
      className="card"
      style={{
        marginBottom: 0,
        borderColor: "var(--red-text)",
        background: "var(--red-bg)",
        padding: "12px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontSize: 12.5, color: "var(--red-text)", fontWeight: 500 }}>Something went wrong</div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red-text)", fontSize: 14, lineHeight: 1 }}
        >
          ×
        </button>
      </div>
      <div style={{ fontSize: 12.5, color: "var(--red-text)", marginTop: 4 }}>{toast.message}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <span style={{ fontSize: 11, color: "var(--red-text)", opacity: 0.75 }}>
          {toast.refId ? `Ref: ${toast.refId}` : "Reporting…"}
        </span>
        <button className="btn btn-sm" onClick={copyDetails} style={{ padding: "3px 9px", fontSize: 11 }}>
          Copy details
        </button>
      </div>
    </div>
  );
}
