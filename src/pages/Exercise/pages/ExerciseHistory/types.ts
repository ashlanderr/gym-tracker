export interface ExerciseHistoryParams {
  exerciseId: string;
}

export interface HistoryPoint {
  date: Date;
  maxWeight: number;
  oneRepMax: number;
  bestSetVolume: number;
  workoutVolume: number;
}

export type ChartParameterType =
  | "maxWeight"
  | "oneRepMax"
  | "bestSetVolume"
  | "workoutVolume";

export interface ChartParameter {
  key: ChartParameterType;
  label: string;
}
