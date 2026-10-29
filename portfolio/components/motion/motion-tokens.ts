export function readMotionValue(name: string, fallback: string) {
  if (typeof document === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export function readMotionMilliseconds(name: string, fallback: number) {
  const value = readMotionValue(name, `${fallback}ms`);
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount)) return fallback;
  return value.endsWith("s") && !value.endsWith("ms") ? amount * 1000 : amount;
}

export function readMotionBezier(name: string, fallback: [number, number, number, number]) {
  const value = readMotionValue(name, `cubic-bezier(${fallback.join(",")})`);
  const match = value.match(/^cubic-bezier\(\s*([-+\d.e]+)\s*,\s*([-+\d.e]+)\s*,\s*([-+\d.e]+)\s*,\s*([-+\d.e]+)\s*\)$/i);
  if (!match) return fallback;
  const values = match.slice(1).map(Number);
  if (values.some((item) => !Number.isFinite(item))) return fallback;
  return values as [number, number, number, number];
}
