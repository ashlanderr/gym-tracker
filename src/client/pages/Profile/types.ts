import type { AnchorId } from "../../db";
import type { LiftSource, StrengthLevelResult } from "../../domain";

export interface LiftRow {
  anchor: AnchorId;
  name: string;
  source: LiftSource;
  oneRepMax: number | null;
  level: StrengthLevelResult | null;
}
