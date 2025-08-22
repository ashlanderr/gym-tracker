import type { RepRange } from "../../../../domain";

export function formatRepRange({ min, max }: RepRange): string {
  return min === max ? min.toString() : `${min} - ${max}`;
}
