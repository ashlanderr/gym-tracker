import type { MuscleType } from "../../db";

export interface MuscleFigureProps {
  // The first one is the main muscle and picks the side of the body.
  muscles: MuscleType[];
}
