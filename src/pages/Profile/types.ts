import type { MeasurePickerProps } from "../../components";
import type { MeasurementType } from "../../db";

export interface MeasureSpec {
  title: string;
  units: string;
  decimals: number;
  range: MeasurePickerProps["range"];
  // Where the scale opens while nothing is recorded yet.
  fallback: number;
}

export interface MeasurementParams {
  type: MeasurementType;
}
