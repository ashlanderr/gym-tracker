import type { Set } from "../db";

export function groupSets(sets: Set[]): Map<string, Set[]> {
  const result = new Map<string, Set[]>();
  for (const set of [...sets].sort((a, b) => a.order - b.order)) {
    result.set(set.performance, [...(result.get(set.performance) ?? []), set]);
  }
  return result;
}
