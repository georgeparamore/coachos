import { createClient } from "@/lib/supabase/server";
import { LEAD_STAGES } from "@/lib/leads";
import { PLANS } from "@/lib/stripe";
import { formatCurrencyWhole } from "@/lib/analytics";
import { StatTile } from "@/components/charts/stat-tile";
import { BarList } from "@/components/charts/bar-list";
import { SeriesChart } from "@/components/charts/series-chart";

const STAGE_CHART_COLOR: Record<string, string> = {
  new: "var(--chart-stage-new)",
  in_conversation: "var(--chart-stage-in-conversation)",
  proposal_sent: "var(--chart-stage-proposal-sent)",
  signed: "var(--chart-stage-signed)",
};

function weekLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function monthLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short" });
}

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: leads }, { data: subscriptions }, { data: invoices }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, stage, source, value_cents, fit_score, created_at")
      .eq("coach_id", user!.id),
    supabase.from("subscriptions").select("status, plan_key").eq("coach_id", user!.id),
    supabase.from("invoices").select("status, amount_cents, created_at").eq("coach_id", user!.id),
  ]);

  const allLeads = leads ?? [];
  const allSubs = subscriptions ?? [];
  const allInvoices = invoices ?? [];

  // Stat tiles
  const totalLeads = allLeads.length;
  const signedCount = allLeads.filter((l) => l.stage === "signed").length;
  const winRate = totalLeads > 0 ? Math.round((signedCount / totalLeads) * 100) : 0;
  const openPipelineValue = allLeads
    .filter((l) => l.stage !== "signed")
    .reduce((sum, l) => sum + (l.value_cents ?? 0), 0);
  const openLeadsWithScore = allLeads.filter((l) => l.stage !== "signed" && l.fit_score != null);
  const avgFitScore = openLeadsWithScore.length
    ? (openLeadsWithScore.reduce((sum, l) => sum + (l.fit_score ?? 0), 0) / openLeadsWithScore.length).toFixed(1)
    : "—";
  const mrrCents = allSubs
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + (PLANS[s.plan_key as keyof typeof PLANS]?.amountCents ?? 0), 0);

  // Pipeline funnel
  const funnelData = LEAD_STAGES.map((stage) => ({
    label: stage.label,
    value: allLeads.filter((l) => l.stage === stage.key).length,
    color: STAGE_CHART_COLOR[stage.key],
  }));

  // Lead sources (top 5 + Other)
  const sourceCounts = new Map<string, number>();
  for (const lead of allLeads) {
    const key = lead.source?.trim() || "Unspecified";
    sourceCounts.set(key, (sourceCounts.get(key) ?? 0) + 1);
  }
  const sortedSources = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1]);
  const topSources = sortedSources.slice(0, 5);
  const otherCount = sortedSources.slice(5).reduce((sum, [, count]) => sum + count, 0);
  const sourceData = [
    ...topSources.map(([label, value]) => ({ label, value, color: "var(--chart-trend)" })),
    ...(otherCount > 0 ? [{ label: "Other", value: otherCount, color: "var(--text-3)" }] : []),
  ];

  // New leads per week, last 8 weeks
  const weeks: { start: Date; end: Date }[] = [];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let i = 7; i >= 0; i--) {
    const end = new Date(todayStart);
    end.setDate(end.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    weeks.push({ start, end });
  }
  const leadTrend = weeks.map(({ start, end }) => {
    const endExclusive = new Date(end);
    endExclusive.setDate(endExclusive.getDate() + 1);
    const count = allLeads.filter((l) => {
      const created = new Date(l.created_at);
      return created >= start && created < endExclusive;
    }).length;
    return { label: weekLabel(start), value: count };
  });

  // Revenue collected by month, last 6 months
  const months: Date[] = [];
  for (let i = 5; i >= 0; i--) {
    months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  }
  const revenueTrend = months.map((monthStart) => {
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    const total = allInvoices
      .filter((inv) => {
        if (inv.status !== "paid") return false;
        const created = new Date(inv.created_at);
        return created >= monthStart && created < monthEnd;
      })
      .reduce((sum, inv) => sum + inv.amount_cents, 0);
    return { label: monthLabel(monthStart), value: Math.round(total / 100) };
  });
  const hasRevenue = revenueTrend.some((m) => m.value > 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Analytics</div>
          <div className="page-sub">How your pipeline and revenue are trending</div>
        </div>
      </div>

      <div className="metrics">
        <StatTile label="Win rate" value={`${winRate}%`} sub={`${signedCount} of ${totalLeads} leads signed`} />
        <StatTile label="Open pipeline value" value={formatCurrencyWhole(openPipelineValue)} sub="Across leads not yet signed" />
        <StatTile label="Monthly recurring revenue" value={formatCurrencyWhole(mrrCents)} sub="From active subscriptions" />
        <StatTile label="Avg. fit score" value={String(avgFitScore)} sub="Open leads only" />
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">Pipeline by stage</div>
          {totalLeads === 0 ? (
            <div className="empty-state">
              <p>No leads yet — add some in the CRM to see your funnel.</p>
            </div>
          ) : (
            <BarList data={funnelData} formatValue={(n) => String(n)} total={totalLeads} />
          )}
        </div>

        <div className="card">
          <div className="card-title">Lead sources</div>
          {sourceData.length === 0 ? (
            <div className="empty-state">
              <p>No leads yet.</p>
            </div>
          ) : (
            <BarList data={sourceData} formatValue={(n) => String(n)} total={totalLeads} />
          )}
        </div>
      </div>

      <div className="card">
        <div className="chart-card-header">
          <div className="card-title" style={{ marginBottom: 0 }}>
            New leads, last 8 weeks
          </div>
          <div className="chart-headline">{leadTrend.reduce((sum, w) => sum + w.value, 0)}</div>
        </div>
        <SeriesChart points={leadTrend} color="var(--chart-trend)" mode="line" labelEvery={2} />
      </div>

      <div className="card">
        <div className="chart-card-header">
          <div className="card-title" style={{ marginBottom: 0 }}>
            Revenue collected, last 6 months
          </div>
          <div className="chart-headline">{formatCurrencyWhole(revenueTrend.reduce((sum, m) => sum + m.value, 0) * 100)}</div>
        </div>
        {hasRevenue ? (
          <SeriesChart points={revenueTrend} color="var(--chart-money)" mode="bar" formatValue={(n) => `$${n.toLocaleString()}`} />
        ) : (
          <div className="empty-state">
            <p>No paid invoices yet — this fills in once Stripe billing is connected and invoices are collected.</p>
          </div>
        )}
      </div>
    </div>
  );
}
