import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useMemo } from "react";
import { PiMedalFill } from "react-icons/pi";
import {
  useQueryPerformancesByExercise,
  useQueryRecordsByExercise,
  useQuerySetsByExercise,
} from "../../../../db";
import { useStore } from "../../../../components";
import { MEDAL_RECORDS } from "../../../../domain";
import { pluralize } from "../../../../utils";
import { WEIGHT_SIGNS } from "../../../constants.ts";
import { SESSION_DATE_FORMATTER } from "../../constants.ts";
import { buildSessions } from "../../utils.ts";
import type { HistoryTabProps } from "./types.ts";

export function HistoryTab({ exercise }: HistoryTabProps) {
  const store = useStore();
  const performances = useQueryPerformancesByExercise(store, exercise.id);
  const sets = useQuerySetsByExercise(store, exercise.id);
  const records = useQueryRecordsByExercise(store, exercise.id);

  const sessions = useMemo(
    () => buildSessions(performances, sets),
    [performances, sets],
  );
  const recordSets = new Set(
    records.filter((r) => MEDAL_RECORDS.includes(r.type)).map((r) => r.set),
  );
  const sign = WEIGHT_SIGNS[exercise.weight.type];

  if (sessions.length === 0) {
    return <div className={s.empty}>Упражнение ещё не выполнялось</div>;
  }

  return sessions.map(({ performance, sets }) => (
    <div className={s.session} key={performance.id}>
      <div className={s.header}>
        <span className={s.date}>
          {SESSION_DATE_FORMATTER.format(performance.startedAt)}
        </span>
        <span className={s.summary}>
          {pluralize(sets.length, ["подход", "подхода", "подходов"])}
        </span>
      </div>
      <div className={s.sets}>
        {sets.map((set) => (
          <span
            key={set.id}
            className={clsx(s.set, set.type === "warm-up" && s.warmUp)}
          >
            {sign}
            {set.weight} × {set.reps}
            {recordSets.has(set.id) && <PiMedalFill className={s.medal} />}
          </span>
        ))}
      </div>
    </div>
  ));
}
