import type { Performance, Set } from "../db";

export function groupSets(sets: Set[]): Map<string, Set[]> {
  const result = new Map<string, Set[]>();
  for (const set of [...sets].sort((a, b) => a.order - b.order)) {
    result.set(set.performance, [...(result.get(set.performance) ?? []), set]);
  }
  return result;
}

// The next set is the first one not done, going through the exercises in
// their order. Nothing keeps it: it moves as sets are done.
export function findNextSet(
  performances: Performance[],
  setsByPerformance: Map<string, Set[]>,
): Set | undefined {
  return performances
    .flatMap((p) => setsByPerformance.get(p.id) ?? [])
    .find((s) => !s.completed);
}
