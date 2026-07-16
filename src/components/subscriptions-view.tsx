"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionFormModal } from "@/components/subscription-form-modal";
import { SUBSCRIPTION_STATUS_BADGE, type Subscription } from "@/lib/billing";
import type { Lead } from "@/lib/leads";

const PLAN_CARDS = [
  { key: "starter", name: "Starter", price: "$120", features: ["Course access", "Community membership", "Monthly group call"] },
  {
    key: "group",
    name: "Group program",
    price: "$200",
    featured: true,
    features: ["Everything in Starter", "Weekly group calls", "Voxer check-ins", "Accountability partner"],
  },
  {
    key: "elite",
    name: "Elite 1:1",
    price: "$500",
    features: ["Everything in Group", "Weekly 1:1 calls", "Custom roadmap", "Priority Voxer access"],
  },
];

export function SubscriptionsView({ subscriptions, leads }: { subscriptions: Subscription[]; leads: Lead[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const active = subscriptions.filter((s) => s.status === "active");
  const mrr = active.reduce((sum, s) => {
    const plan = PLAN_CARDS.find((p) => p.key === s.plan_key);
    return sum + (plan ? parseInt(plan.price.replace("$", ""), 10) : 0);
  }, 0);

  const countByPlan = (key: string) => active.filter((s) => s.plan_key === key).length;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Subscriptions</div>
          <div className="page-sub">Monthly recurring billing — powered by Stripe</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          New subscription
        </button>
      </div>

      <div className="notes-box">
        Plan names and prices below are placeholders — update them in <code>src/components/subscriptions-view.tsx</code> and
        <code> src/lib/stripe.ts</code> (plus your Stripe product prices) once you&apos;ve decided on your real offers.
      </div>

      <div className="metrics" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="metric">
          <div className="metric-label">Monthly recurring revenue</div>
          <div className="metric-value">${mrr}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Active subscribers</div>
          <div className="metric-value">{active.length}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Avg. plan value</div>
          <div className="metric-value">{active.length ? `$${Math.round(mrr / active.length)}` : "—"}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Your plans</div>
        <div className="three-col">
          {PLAN_CARDS.map((plan) => (
            <div className={`plan-card${plan.featured ? " featured" : ""}`} key={plan.key}>
              {plan.featured && (
                <div style={{ marginBottom: 8 }}>
                  <span className="badge badge-purple">Most popular</span>
                </div>
              )}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">
                {plan.price}
                <span>/mo</span>
              </div>
              {plan.features.map((f) => (
                <div className="plan-feature" key={f}>
                  {f}
                </div>
              ))}
              <div style={{ marginTop: 14 }}>
                <span className="badge badge-green">{countByPlan(plan.key)} active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">All subscribers</div>
        {subscriptions.length === 0 ? (
          <div className="empty-state">
            <p>No subscribers yet. Click &quot;New subscription&quot; to generate a checkout link for a client.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Plan</th>
                <th>Next billing</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => {
                const plan = PLAN_CARDS.find((p) => p.key === sub.plan_key);
                return (
                  <tr key={sub.id}>
                    <td>{sub.client_name}</td>
                    <td>{plan?.name ?? sub.plan_key}</td>
                    <td>{sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "—"}</td>
                    <td>
                      <span className={`badge ${SUBSCRIPTION_STATUS_BADGE[sub.status]}`}>{sub.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <SubscriptionFormModal
          leads={leads}
          onClose={() => setShowModal(false)}
          onCreated={() => router.refresh()}
        />
      )}
    </>
  );
}
