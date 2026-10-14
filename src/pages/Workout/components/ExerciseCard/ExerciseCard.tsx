import s from "./styles.module.scss";
import { clsx } from "clsx";
import { MdCheck, MdLock } from "react-icons/md";
import { MuscleFigure, useStore } from "../../../../components";
import { DEFAULT_EXERCISE_REPS } from "../../../../db";
import { queryMissingInventory, queryPendingWeight } from "../../../../domain";
import { UNITS_SHORT } from "../../../constants.ts";
import {
  formatPlannedReps,
  formatWeightUnits,
  usePerformanceSets,
} from "../../hooks.ts";
import { ExerciseMark } from "../ExerciseMark";
import type { ExerciseCardProps } from "./types.ts";

export function ExerciseCard({
  performance,
  sets,
  status,
  highlight,
  onClick,
}: ExerciseCardProps) {
  const store = useStore();
  const { exercise, rows, units } = usePerformanceSets(performance);
  const isInventoryMissing = queryMissingInventory(store, performance);
  const pendingWeight = queryPendingWeight(store, performance)?.type;
  const weightMark = pendingWeight === "lightest" ? "decrease" : pendingWeight;

  const working = sets.filter((s) => s.type !== "warm-up");
  const done = working.filter((s) => s.completed).length;

  // What the exercise is about: the weight of the first working set, entered
  // or carried from the last time, with the reps range for that weight.
  const first = rows.find((r) => r.set.type !== "warm-up");
  const firstWeight = first && (first.set.weight ?? first.recSet?.weight);
  const reps = formatPlannedReps(
    first?.recSet?.reps ?? exercise?.reps ?? DEFAULT_EXERCISE_REPS,
  );
  const weight =
    firstWeight !== undefined ? formatWeightUnits(firstWeight, units) : "?";

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
        <span>
          <b>{working.length}</b> × <b>{reps}</b> @ <b>{weight}</b>{" "}
          {UNITS_SHORT[units]}
        </span>
        {isInventoryMissing && <ExerciseMark type="inventory" />}
        {weightMark && <ExerciseMark type={weightMark} />}
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
