import type { CompletedSet, Performance } from "../../db";

export interface ExercisePageParams {
  exerciseId: string;
}

export type ExerciseTab = "technique" | "progress" | "history";

export type ChartMetric = "averageRepMax" | "bestRepMax" | "maxWeight";

export type ChartPeriod = "three_months" | "one_year" | "all";

export interface HistoryPoint {
  date: number;
  averageRepMax: number;
  bestRepMax: number;
  maxWeight: number;
}

export interface HistorySession {
  performance: Performance;
  sets: CompletedSet[];
}
