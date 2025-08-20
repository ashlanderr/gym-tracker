import type { Exercise } from "../../../../db";

export interface ExerciseHistoryProps {
  exercise: Exercise;
  onClose: () => void;
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
