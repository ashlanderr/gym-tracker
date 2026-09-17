import type { Muscle } from "react-body-highlighter";
import type { MuscleType } from "../../../../db";

export const BODY_COLOR = "#232323";

// A warm ramp: the hue carries the data, brightness stays free to mean
// hierarchy as it does everywhere else in the app.
export const LEVEL_COLORS = ["#463619", "#a06a22", "#ffb340"];

export const VIEWS = [
  { type: "anterior", label: "Перед" },
  { type: "posterior", label: "Спина" },
] as const;

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
