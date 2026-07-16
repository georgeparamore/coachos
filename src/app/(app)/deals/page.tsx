export default function DealsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Deal evaluations</div>
          <div className="page-sub">Score prospects, build proposals, send contracts</div>
        </div>
      </div>

      <div className="notes-box">Phase 2: proposal builder + fit scoring will wire up to real CRM leads and Stripe checkout.</div>

      <div className="card">
        <div className="card-title">Open deals</div>
        <table className="table">
          <thead>
            <tr>
              <th>Prospect</th>
              <th>Offer</th>
              <th>Value</th>
              <th>Fit score</th>
              <th>Stage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="avatar av-sm av-purple">DW</div> David Wu
                </div>
              </td>
              <td>Elite 1:1 coaching</td>
              <td>$500/mo</td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="prog-track" style={{ width: 64 }}>
                    <div className="prog-fill prog-green" style={{ width: "80%" }} />
                  </div>
                  <span style={{ fontSize: 12 }}>8/10</span>
                </div>
              </td>
              <td>
                <span className="badge badge-purple">Negotiating</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-title">Quick proposal builder</div>
        <div className="two-col">
          <div>
            <div className="form-row">
              <label className="form-label">Client name</label>
              <input className="form-input" placeholder="e.g. David Wu" />
            </div>
            <div className="form-row">
              <label className="form-label">Program / offer name</label>
              <input className="form-input" placeholder="e.g. Elite 1:1 Coaching" />
            </div>
            <div className="form-row">
              <label className="form-label">Investment amount</label>
              <input className="form-input" placeholder="$500/mo" />
            </div>
            <div className="form-row">
              <label className="form-label">Duration</label>
              <input className="form-input" placeholder="e.g. 3 months, ongoing" />
            </div>
          </div>
          <div>
            <div className="form-row">
              <label className="form-label">Key deliverables</label>
              <textarea className="form-input" placeholder="Weekly 1:1 calls, Voxer access, custom roadmap..." />
            </div>
            <div className="form-row">
              <label className="form-label">Your guarantee / promise</label>
              <textarea className="form-input" placeholder="What outcome do you guarantee your client?" />
            </div>
          </div>
        </div>
        <button className="btn btn-accent" disabled>
          Generate proposal (Phase 2)
        </button>
      </div>
    </div>
  );
}
