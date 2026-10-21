import type { DayMark } from "../../types.ts";

export interface WeekStripProps {
  weeks: Date[][];
  week: number;
  selected: string;
  today: string;
  marks: Map<string, DayMark>;
  onSelect: (day: string) => void;
  onWeekChange: (week: number) => void;
}
