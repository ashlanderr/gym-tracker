import s from "./styles.module.scss";
import { clsx } from "clsx";
import type { CSSProperties } from "react";
import type { LadderSet, SetsLadderProps } from "../SetsLadder";

interface Run {
  weight: number;
  start: number;
  sets: LadderSet[];
}

// The sets of the last time in one line: sets in a row with one weight join
// into a bar signed with the weight once. Today ends the line.
export function SetsStrip({
  sets,
  range,
  today,
  formatWeight,
}: SetsLadderProps) {
  const runs = sets.reduce<Run[]>((runs, set, index) => {
    const last = runs.at(-1);
    if (last?.weight === set.weight) {
      last.sets.push(set);
    } else {
      runs.push({ weight: set.weight, start: index, sets: [set] });
    }
    return runs;
  }, []);

  return (
    <div className={s.strip}>
      {runs.map((run) => (
        <div
          key={run.start}
          className={s.group}
          style={
            {
              flexGrow: run.sets.length,
              "--count": run.sets.length,
            } as CSSProperties
          }
        >
          <div className={s.weight}>{formatWeight(run.weight)}</div>
          <div className={s.run}>
            {run.sets.map((set, index) => (
              <span
                key={index}
                className={clsx(
                  s.set,
                  set.reps >= range.max && s.top,
                  set.reps < range.min && s.short,
                )}
              >
                {set.reps}
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className={clsx(s.group, s.todayGroup)}>
        <div className={clsx(s.weight, s.current)}>{formatWeight(today)}</div>
        <div className={s.today}>
          {range.min}–{range.max}
        </div>
      </div>
    </div>
  );
}
