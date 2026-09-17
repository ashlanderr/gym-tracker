import type { MuscleType } from "../../../../db";
import type { MuscleLevel } from "../../../../domain";

export interface BodyMapProps {
  levels: Partial<Record<MuscleType, MuscleLevel>>;
}
