import type { MeasurementType } from "../../../../db";

export interface MeasureSheetData {
  type: MeasurementType;
  // Where the scale opens: the latest record, or a default before the first.
  value: number;
}
