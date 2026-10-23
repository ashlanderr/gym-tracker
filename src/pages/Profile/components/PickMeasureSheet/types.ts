import type { MeasurementType } from "../../../../db";

export interface PickMeasureSheetData {
  // Those not tracked yet: a tracked one is added with its own plus.
  types: MeasurementType[];
}
