import s from "./styles.module.scss";
import { clsx } from "clsx";
import { PiMedalFill } from "react-icons/pi";
import { UNITS_SHORT } from "../../../constants.ts";
import { kgToUnits } from "../../../../domain";
import { formatNumber } from "../../../../utils";
import type { RecordNoticeProps } from "./types.ts";
import type { WeightUnits } from "../../../../db";

// An estimated 1RM has no meaning past a tenth.
function formatRecord(valueKg: number, units: WeightUnits): string {
  return formatNumber(kgToUnits(valueKg, units), { maximumFractionDigits: 1 });
}

export function RecordNotice({
  title,
  current,
  previous,
  units,
}: RecordNoticeProps) {
  const delta = current - previous;
  const sign = delta >= 0 ? "+" : "−";

  return (
    <div className={s.root}>
      <PiMedalFill className={s.medal} />
      <span>
        {title}: <b>{formatRecord(current, units)}</b>{" "}
        <span className={clsx(delta >= 0 ? s.increment : s.decrement)}>
          ({sign}
          {formatRecord(Math.abs(delta), units)})
        </span>{" "}
        {UNITS_SHORT[units]}
      </span>
    </div>
  );
}
