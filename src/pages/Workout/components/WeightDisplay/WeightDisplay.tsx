import type { WeightDisplayProps } from "./types.ts";
import s from "./styles.module.scss";
import React from "react";
import { UNITS_TRANSLATION } from "../../../constants.ts";

export function WeightDisplay({ data }: WeightDisplayProps) {
  return (
    <div className={s.root}>
      <div className={s.row}>
        {data.steps?.map((step) => (
          <React.Fragment key={step.weight}>
            <div className={s.weight}>
              <span>
                {step.weight} {UNITS_TRANSLATION[data.units]}
              </span>
              {step.count !== 1 && <span> x {step.count}</span>}
            </div>
            <div className={s.separator}> +</div>
          </React.Fragment>
        ))}
        {data.additional && (
          <React.Fragment>
            <div className={s.weight}>
              <span>
                {data.additional} {UNITS_TRANSLATION[data.units]}
              </span>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}
