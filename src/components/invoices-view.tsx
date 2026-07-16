"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InvoiceFormModal } from "@/components/invoice-form-modal";
import { INVOICE_STATUS_BADGE, type Invoice } from "@/lib/billing";
import { centsToDollars } from "@/lib/format";
import type { Lead } from "@/lib/leads";

export function InvoicesView({ invoices, leads }: { invoices: Invoice[]; leads: Lead[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const totalCollected = invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount_cents, 0);
  const outstanding = invoices
    .filter((i) => i.status === "open")
    .reduce((sum, i) => sum + i.amount_cents, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Invoices</div>
          <div className="page-sub">One-time payments and billing history</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          New invoice
        </button>
      </div>

      <div className="metrics" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="metric">
          <div className="metric-label">Total collected</div>
          <div className="metric-value">{centsToDollars(totalCollected)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Outstanding</div>
          <div className="metric-value">{centsToDollars(outstanding)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Invoices sent</div>
          <div className="metric-value">{invoices.length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Recent invoices</div>
        {invoices.length === 0 ? (
          <div className="empty-state">
            <p>No invoices yet. Click &quot;New invoice&quot; to send your first one via Stripe.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Sent</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.client_name}</td>
                  <td>{invoice.description}</td>
                  <td>{centsToDollars(invoice.amount_cents)}</td>
                  <td>{new Date(invoice.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${INVOICE_STATUS_BADGE[invoice.status]}`}>{invoice.status}</span>
                  </td>
                  <td>
                    {invoice.hosted_invoice_url && (
                      <a className="btn btn-sm" href={invoice.hosted_invoice_url} target="_blank" rel="noreferrer">
                        View
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <InvoiceFormModal
          leads={leads}
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
