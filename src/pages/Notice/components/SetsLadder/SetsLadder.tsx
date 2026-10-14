import s from "./styles.module.scss";
import { clsx } from "clsx";
import type { CSSProperties } from "react";
import type { LadderSet, SetsLadderProps } from "./types.ts";

interface Run {
  weight: number;
  start: number;
  sets: LadderSet[];
}

// The sets of the last time on a grid: a row for each weight, heavier above,
// a column for each set. Sets in a row with one weight join into a bar, so a
// held weight reads as a line and a search as scattered squares. The last
// column is today, on the row of its weight.
export function SetsLadder({
  sets,
  range,
  today,
  formatWeight,
}: SetsLadderProps) {
  const weights = [...new Set([...sets.map((set) => set.weight), today])].sort(
    (a, b) => b - a,
  );
  const row = (weight: number) => weights.indexOf(weight) + 1;

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
    <div
      className={s.ladder}
      style={{ "--sets": sets.length } as CSSProperties}
    >
      {weights.map((weight) => (
        <div
          key={weight}
          className={clsx(s.weight, weight === today && s.current)}
          style={{ gridRow: row(weight) }}
        >
          {formatWeight(weight)}
        </div>
      ))}
      {weights.map((weight) => (
        <div
          key={`guide-${weight}`}
          className={s.guide}
          style={{ gridRow: row(weight) }}
        />
      ))}
      {runs.map((run) => (
        <div
          key={run.start}
          className={s.run}
          style={{
            gridRow: row(run.weight),
            gridColumn: `${run.start + 2} / span ${run.sets.length}`,
          }}
        >
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
      ))}
      <div className={s.today} style={{ gridRow: row(today) }}>
        {range.min}–{range.max}
      </div>
    </div>
  );
}
