import { firestore, useFirestoreQuery } from "./db.ts";
import { collection, query, where } from "firebase/firestore";

export type SetType = "warm-up" | "working";

export interface Set {
  id: string;
  performance: string;
  order: number;
  type: SetType;
  weight: number;
  reps: number;
}

export interface QuerySetByPerformanceRequest {
  enabled?: boolean;
  performance: string | undefined;
}

export function useQuerySetsByPerformance({
  enabled,
  performance,
}: QuerySetByPerformanceRequest): Set[] {
  const docs = useFirestoreQuery<Set>({
    query: () =>
      query(
        collection(firestore, "sets"),
        where("performance", "==", performance),
      ),
    enabled,
    deps: [performance],
  });
  return [...docs].sort((a, b) => a.order - b.order);
}
