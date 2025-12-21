export function safeNumber(input: string, fallback: number): number {
  const n = Number(input);
  return Number.isFinite(n) ? n : fallback;
}

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function makeSkuBase(base: string): string {
  return base.trim().toUpperCase().replace(/\s+/g, "-");
}

export function cartesian<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])),
    [[]]
  );
}

export function genSkuFromParts(parts: string[]): string {
  const cleaned = parts
    .map((p) => makeSkuBase(p))
    .filter(Boolean)
    .slice(0, 10);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return [...cleaned, String(rand)].join("-");
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
