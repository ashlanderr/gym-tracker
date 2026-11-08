import { clsx } from "clsx";
import { formatNumber } from "../../../../utils";
import type { WeightGridProps } from "./types.ts";
import s from "./styles.module.scss";

export function WeightGrid({ groups, excluded, onToggle }: WeightGridProps) {
  return (
    <div className={s.root}>
      {groups.map((weights) => (
        <div className={s.group} key={weights[0]}>
          {weights.map((weight) => (
            <button
              className={clsx(s.cell, excluded.includes(weight) && s.excluded)}
              key={weight}
              aria-pressed={!excluded.includes(weight)}
              onClick={() => onToggle(weight)}
            >
              {formatNumber(weight)}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
