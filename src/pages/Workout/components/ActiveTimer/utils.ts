export function clampActiveTimer(time: number): number {
  return Math.max(0, Math.min(time, 3600));
}
