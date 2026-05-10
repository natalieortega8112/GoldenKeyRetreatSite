// Money helpers used by both server and client code. Kept here (no DB
// imports) so Client Components can use them without dragging postgres
// into the browser bundle.

export function dollarsToCents(
  value: string | number | null | undefined,
): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[$,]/g, ""));
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

export function centsToDollars(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "";
  return (cents / 100).toFixed(2);
}
