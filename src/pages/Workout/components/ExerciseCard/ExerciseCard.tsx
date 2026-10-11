import s from "./styles.module.scss";
import { clsx } from "clsx";
import { MdCheck, MdLock } from "react-icons/md";
import { MuscleFigure, useStore } from "../../../../components";
import {
  DEFAULT_WEIGHT_UNITS,
  useQueryExerciseById,
  useQueryPreviousPerformance,
  useQuerySetsByPerformance,
} from "../../../../db";
import { UNITS_SHORT } from "../../../constants.ts";
import { formatPlannedReps, formatWeightUnits } from "../../hooks.ts";
import type { ExerciseCardProps } from "./types.ts";

export function ExerciseCard({
  performance,
  sets,
  status,
  highlight,
  onClick,
}: ExerciseCardProps) {
  const store = useStore();
  const exercise = useQueryExerciseById(store, performance.exercise);
  const prevPerformance = useQueryPreviousPerformance(
    store,
    performance.exercise,
    performance.startedAt,
    performance.periodization,
    performance.program,
  );
  const prevSets = useQuerySetsByPerformance(store, prevPerformance?.id ?? "");

  const units = performance.weights?.units ?? DEFAULT_WEIGHT_UNITS;
  const working = sets.filter((s) => s.type !== "warm-up");
  const done = working.filter((s) => s.completed).length;

  // What the exercise is about: the weight of the first working set of the
  // last time, with the reps range of the exercise when it has one.
  const prevSet = prevSets.find((s) => s.completed && s.type !== "warm-up");
  const reps = formatPlannedReps(exercise, prevSet);
  const weight = prevSet ? formatWeightUnits(prevSet.weight, units) : "?";

  return (
    <div
      className={clsx(
        s.card,
        s[status],
        highlight === "done" && s.justDone,
        highlight === "open" && s.justOpen,
      )}
      onClick={onClick}
    >
      <div className={s.name}>{exercise?.name ?? "–"}</div>
      {renderCounter(status, done, working.length)}
      <div className={s.picture}>
        <MuscleFigure muscles={exercise?.muscles ?? []} />
      </div>
      <div className={s.spec}>
        <b>{working.length}</b> × <b>{reps}</b> @ <b>{weight}</b>{" "}
        {UNITS_SHORT[units]}
      </div>
    </div>
  );
}

function renderCounter(
  status: ExerciseCardProps["status"],
  done: number,
  total: number,
) {
  switch (status) {
    case "done":
      return (
        <span className={s.counter}>
          <MdCheck />
        </span>
      );

    case "locked":
      return (
        <span className={s.counter}>
          <MdLock />
        </span>
      );

    default:
      return (
        <span className={s.counter}>
          {done}/{total}
        </span>
      );
  }
}
