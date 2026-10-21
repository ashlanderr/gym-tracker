import type { DayMark } from "../../types.ts";

export interface DayCellProps {
  date: Date;
  weekday?: string;
  mark?: DayMark;
  selected: boolean;
  today: boolean;
  // A day of the next or previous month in the month grid.
  muted?: boolean;
  onClick: () => void;
}
