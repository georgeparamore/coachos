import type { BarDatum } from "@/lib/analytics";

export function BarList({
  data,
  formatValue = (n) => String(n),
  total,
}: {
  data: BarDatum[];
  formatValue?: (value: number) => string;
  total?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const sumForPct = total ?? data.reduce((sum, d) => sum + d.value, 0) ?? 1;

  return (
    <div>
      {data.map((d) => {
        const pct = sumForPct > 0 ? Math.round((d.value / sumForPct) * 100) : 0;
        return (
          <div
            className="barlist-row"
            key={d.label}
            title={`${d.label}: ${formatValue(d.value)} (${pct}% of ${formatValue(sumForPct)})`}
          >
            <div className="barlist-label">{d.label}</div>
            <div className="barlist-track">
              <div
                className="barlist-fill"
                style={{ width: `${Math.max((d.value / max) * 100, d.value > 0 ? 2 : 0)}%`, background: d.color }}
              />
            </div>
            <div className="barlist-value">{formatValue(d.value)}</div>
          </div>
        );
      })}
    </div>
  );
}
