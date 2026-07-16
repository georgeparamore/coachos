export default function ContractsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Contracts</div>
          <div className="page-sub">Digital agreements and e-signatures</div>
        </div>
      </div>

      <div className="notes-box">
        Phase 2: contract templates, send/track, and e-signature capture wire up alongside the
        proposal builder.
      </div>

      <div className="card">
        <div className="card-title">Contract templates</div>
        <div className="list-row">
          <div className="list-row-left">
            <div>
              <div className="name">Elite coaching agreement</div>
              <div className="sub">1:1 coaching · 3-month minimum</div>
            </div>
          </div>
          <button className="btn btn-sm" disabled>
            Use template
          </button>
        </div>
        <div className="list-row">
          <div className="list-row-left">
            <div>
              <div className="name">Group program agreement</div>
              <div className="sub">Community &amp; group coaching</div>
            </div>
          </div>
          <button className="btn btn-sm" disabled>
            Use template
          </button>
        </div>
        <div className="list-row">
          <div className="list-row-left">
            <div>
              <div className="name">VIP day agreement</div>
              <div className="sub">One-time intensive session</div>
            </div>
          </div>
          <button className="btn btn-sm" disabled>
            Use template
          </button>
        </div>
      </div>
    </div>
  );
}
