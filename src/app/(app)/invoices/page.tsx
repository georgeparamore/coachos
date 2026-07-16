export default function InvoicesPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Invoices</div>
          <div className="page-sub">One-time payments and billing history</div>
        </div>
      </div>

      <div className="notes-box">Phase 2: invoices generate and sync from Stripe once billing is connected.</div>

      <div className="card">
        <div className="card-title">Recent invoices</div>
        <div className="empty-state">
          <p>No invoices yet. Connect Stripe in Phase 2 to start sending and tracking payments.</p>
        </div>
      </div>
    </div>
  );
}
