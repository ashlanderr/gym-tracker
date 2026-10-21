import type { DayMark } from "../../types.ts";

export interface MonthSheetData {
  month: Date;
  selected: string;
  today: string;
  marks: Map<string, DayMark>;
}
