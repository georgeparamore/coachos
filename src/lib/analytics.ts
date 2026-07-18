export type BarDatum = {
  label: string;
  value: number;
  color: string;
};

export type SeriesPoint = {
  label: string;
  value: number;
};

export function formatCurrencyWhole(cents: number) {
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

export function formatCount(n: number) {
  return n.toLocaleString();
}
