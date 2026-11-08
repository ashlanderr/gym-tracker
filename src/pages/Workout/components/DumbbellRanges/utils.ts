import type { DumbbellRange } from "../../../../db";
import { rangeWeights } from "../../../../domain";
import type { RangeDraft } from "../RangeFields/types.ts";

function parseWeight(value: string): number | undefined {
  const trimmed = value.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return undefined;
  const weight = Number.parseFloat(trimmed);
  return weight > 0 ? weight : undefined;
}

export function parseRange(draft: RangeDraft): DumbbellRange | undefined {
  const from = parseWeight(draft.from);
  const to = parseWeight(draft.to);
  const step = parseWeight(draft.step);
  if (from === undefined || to === undefined || step === undefined) return;
  if (from > to) return;
  return { from, to, step };
}

export function isRangeFilled(draft: RangeDraft): boolean {
  return draft.from !== "" && draft.to !== "" && draft.step !== "";
}

// Ranges sorted by their start, a weight shown once in the first range that
// has it.
export function groupWeights(ranges: DumbbellRange[]): number[][] {
  const seen = new Set<number>();
  return ranges
    .map(rangeWeights)
    .filter((weights) => weights.length !== 0)
    .sort((a, b) => a[0] - b[0])
    .map((weights) =>
      weights.filter((weight) => {
        if (seen.has(weight)) return false;
        seen.add(weight);
        return true;
      }),
    )
    .filter((weights) => weights.length !== 0);
}
