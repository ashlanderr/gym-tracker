import type { ExerciseAsset } from "../types.ts";

export const crossFade = (frames: {
  start: string;
  end: string;
}): ExerciseAsset => ({
  type: "cross-fade",
  startUrl: frames.start,
  endUrl: frames.end,
});
