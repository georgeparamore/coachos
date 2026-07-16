export default function SubscriptionsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Subscriptions</div>
          <div className="page-sub">Monthly recurring billing — powered by Stripe when live</div>
        </div>
      </div>

      <div className="notes-box">
        Phase 2: connect Stripe to replace these placeholder plans with real products, prices, and
        subscriber billing state.
      </div>

      <div className="card">
        <div className="card-title">Plans (placeholder — set real names, prices, and features)</div>
        <div className="three-col">
          <div className="plan-card">
            <div className="plan-name">Starter</div>
            <div className="plan-price">
              $120<span>/mo</span>
            </div>
            <div className="plan-feature">Course access</div>
            <div className="plan-feature">Community membership</div>
            <div className="plan-feature">Monthly group call</div>
          </div>
          <div className="plan-card featured">
            <div style={{ marginBottom: 8 }}>
              <span className="badge badge-purple">Most popular</span>
            </div>
            <div className="plan-name">Group program</div>
            <div className="plan-price">
              $200<span>/mo</span>
            </div>
            <div className="plan-feature">Everything in Starter</div>
            <div className="plan-feature">Weekly group calls</div>
            <div className="plan-feature">Voxer check-ins</div>
          </div>
          <div className="plan-card">
            <div className="plan-name">Elite 1:1</div>
            <div className="plan-price">
              $500<span>/mo</span>
            </div>
            <div className="plan-feature">Everything in Group</div>
            <div className="plan-feature">Weekly 1:1 calls</div>
            <div className="plan-feature">Custom roadmap</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Subscribers</div>
        <div className="empty-state">
          <p>No subscribers yet — this table will populate once Stripe billing is connected in Phase 2.</p>
        </div>
      </div>
    </div>
  );
}
