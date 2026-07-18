import Link from "next/link";

export function PreviewCard({
  title,
  href,
  linkLabel = "View →",
  children,
}: {
  title: string;
  href: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <div className="card-title-row">
        <div className="card-title">{title}</div>
        <Link href={href}>{linkLabel}</Link>
      </div>
      {children}
    </div>
  );
}

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="mini-stat-row">
      <div className="mini-stat-label">{label}</div>
      <div className="mini-stat-value">{value}</div>
    </div>
  );
}
