export const AVATAR_CLASSES = ["av-purple", "av-teal", "av-coral", "av-amber", "av-blue"];

export function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function centsToDollars(cents: number | null | undefined) {
  if (cents == null) return "—";
  return `$${(cents / 100).toLocaleString()}`;
}
