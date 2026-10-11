import type { Muscle } from "react-body-highlighter";
import type { MuscleType } from "../../db";

export const BODY_COLOR = "#232323";

// The warm ramp of the body map at the end of a workout: the brightest is the
// main muscle, the dimmer one the muscles that help it.
export const SECONDARY_COLOR = "#a06a22";
export const PRIMARY_COLOR = "#ffb340";

// Muscles drawn only on the back of the model, or seen better there.
export const POSTERIOR_MUSCLES: MuscleType[] = [
  "calves",
  "glutes",
  "hamstrings",
  "lats",
  "lower_back",
  "traps",
  "triceps",
  "upper_back",
];

// The model has no separate lats, so they share the upper back.
export const MODEL_MUSCLES: Record<MuscleType, Muscle[]> = {
  abs: ["abs", "obliques"],
  abductors: ["abductors"],
  adductors: ["adductor"],
  biceps: ["biceps"],
  calves: ["calves", "left-soleus", "right-soleus"],
  chest: ["chest"],
  forearms: ["forearm"],
  glutes: ["gluteal"],
  hamstrings: ["hamstring"],
  lats: ["upper-back"],
  lower_back: ["lower-back"],
  neck: ["neck"],
  quadriceps: ["quadriceps"],
  shoulders: ["front-deltoids", "back-deltoids"],
  traps: ["trapezius"],
  triceps: ["triceps"],
  upper_back: ["upper-back"],
};
