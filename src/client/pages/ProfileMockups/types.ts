import type { MuscleType } from "../../db";
import type { MuscleLevel } from "../../domain";
import type { AnchorId } from "../Onboarding/types.ts";

// Where the set came from: the best one of the last 90 days, the onboarding
// answer or its default while the lift was never done, or nothing because
// the lift was done, but too long ago to say anything.
export type LiftSource = "history" | "survey" | "stale";

// For pullups the weight is what hangs on the belt, negative when a machine
// takes some of the body weight off. The one-rep max counts the whole load.
export interface DemoSet {
  weight: number;
  reps: number;
}

export interface DemoLift {
  anchor: AnchorId;
  exercise: string;
  source: LiftSource;
  best: DemoSet | null;
  // Where the second, third and fourth levels start, in one-rep max kg.
  thresholds: [number, number, number];
}

export interface DemoProfile {
  name: string;
  summary: string;
  bodyWeight: number;
  lifts: DemoLift[];
  muscles: Partial<Record<MuscleType, MuscleLevel>>;
  workouts: number;
}

export interface LiftLevel {
  index: number;
  // Share of the way from this level to the next one, 1 at the top.
  progress: number;
  oneRepMax: number;
  toNext: number | null;
}
