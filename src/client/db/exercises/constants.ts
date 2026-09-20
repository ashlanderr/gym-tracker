import type { Exercise } from "./types.ts";
import { buildExercises, CATALOG_GROUPS } from "./catalog";

// The built-in catalog: one entry per equipment variation, because the weight
// calculator and the recommendations need to know whether the movement is done
// with dumbbells, with a stack or with plates. Artwork exists only for a few
// of them so far; the rest render without it.
//
// Exercises are declared in catalog/ as groups of variations of one movement,
// and the alternatives between them are generated from those groups.
export const EXERCISES: Record<string, Exercise> =
  buildExercises(CATALOG_GROUPS);
