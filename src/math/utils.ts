export function clamp(n: number, min: number, max: number) {
  n = Math.max(n, min);
  return Math.min(n, max);
}

export function clamp01(n: number) {
  return clamp(n, 0, 1);
}
