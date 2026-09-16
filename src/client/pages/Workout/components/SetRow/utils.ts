import type { RepRange } from "../../../../db";

export function formatRepRange({ min, max }: RepRange): string {
  return min === max ? min.toString() : `${min} - ${max}`;
}
