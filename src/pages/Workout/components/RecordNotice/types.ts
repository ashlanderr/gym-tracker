import type { WeightUnits } from "../../../../db";

export interface RecordNoticeProps {
  title: string;
  current: number;
  previous: number;
  units: WeightUnits;
}
