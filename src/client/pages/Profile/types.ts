import type { MeasureRange } from "../Onboarding/types.ts";
import type { AnchorId, MeasurementType, Sex } from "../../db";
import type { LiftSource, StrengthLevelResult } from "../../domain";

export interface LiftRow {
  anchor: AnchorId;
  name: string;
  source: LiftSource;
  oneRepMax: number | null;
  level: StrengthLevelResult | null;
}

export interface MeasureSpec {
  title: string;
  units: string;
  decimals: number;
  range: MeasureRange;
  // Where the scale opens while nothing is recorded yet.
  fallback: Record<Sex, number>;
  addLabel: string;
}

export interface MeasurementParams {
  type: MeasurementType;
}
