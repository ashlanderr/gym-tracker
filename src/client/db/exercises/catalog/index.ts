import { CHEST_GROUPS } from "./chest.ts";
import { BACK_GROUPS } from "./back.ts";
import { SHOULDER_GROUPS } from "./shoulders.ts";
import { ARM_GROUPS } from "./arms.ts";
import { LEG_GROUPS } from "./legs.ts";
import { CORE_GROUPS } from "./core.ts";
import type { ExerciseGroup } from "./types.ts";

// The order here is the order the catalog is browsed in: push, pull, legs,
// core — the same grouping the programs in docs/exercises are built from.
export const CATALOG_GROUPS: ExerciseGroup[] = [
  ...CHEST_GROUPS,
  ...BACK_GROUPS,
  ...SHOULDER_GROUPS,
  ...ARM_GROUPS,
  ...LEG_GROUPS,
  ...CORE_GROUPS,
];

export { buildExercises } from "./build.ts";
export type { ExerciseDefinition, ExerciseGroup } from "./types.ts";
