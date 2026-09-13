import type { PeriodizationMode } from "../../../../db";

export interface ExerciseHistoryParams {
  exerciseId: string;
}

export interface HistoryPoint {
  date: Date;
  maxWeight: number;
  oneRepMax: number;
  bestSetVolume: number;
  workoutVolume: number;
  averageRepMax: number;
  sets: number;
  periodization: PeriodizationMode | undefined;
}

export type ChartParameterType =
  | "maxWeight"
  | "oneRepMax"
  | "bestSetVolume"
  | "workoutVolume"
  | "averageRepMax";

export interface ChartParameter {
  key: ChartParameterType;
  label: string;
}

export type ChartPeriodType = "three_months" | "one_year" | "all";

export interface ChartPeriod {
  key: ChartPeriodType;
  label: string;
}
