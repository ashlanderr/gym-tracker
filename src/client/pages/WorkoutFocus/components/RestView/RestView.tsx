import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useStore } from "../../../../components";
import {
  type CompletedSet,
  type Effort,
  type Performance,
  updateSet,
  useQueryPerformanceById,
} from "../../../../db";
import { useActiveTimer } from "../../../Workout/components";
import { usePerformanceRecommendations } from "../../../Workout/hooks.ts";
import {
  EFFORTS,
  FINDING_EFFORTS,
  REST_ADJUST_SECONDS,
} from "../../constants.ts";
import { NextUp } from "../NextUp";
import type { RestViewProps } from "./types.ts";

// Without a next step the rest follows the last set: the person can still
// rate it, and the action finishes the workout instead of skipping rest.
export function RestView({ next, seconds, lastSet, onFinish }: RestViewProps) {
  const { startTimer } = useActiveTimer();

  const finishHandler = () => {
    startTimer(undefined);
    onFinish();
  };

  const minutes = Math.floor(seconds / 60);

  return (
    <>
      <div className={s.stage}>
        <div className={s.label}>Отдых</div>
        <div className={s.time}>
          <span className={s.minutes}>{pad(minutes)}</span>
          <span>:</span>
          <span className={s.seconds}>{pad(seconds % 60)}</span>
        </div>
        <div className={s.adjust}>
          <button
            className={s.key}
            onClick={() => startTimer(seconds - REST_ADJUST_SECONDS)}
          >
            −{REST_ADJUST_SECONDS} сек
          </button>
          <button
            className={s.key}
            onClick={() => startTimer(seconds + REST_ADJUST_SECONDS)}
          >
            +{REST_ADJUST_SECONDS} сек
          </button>
        </div>
        {lastSet?.completed && <EffortQuestion set={lastSet} />}
        {next && <NextUp next={next} lastSet={lastSet} />}
      </div>
      <div className={s.action}>
        {next ? (
          <button className={s.skip} onClick={() => startTimer(undefined)}>
            Пропустить отдых
          </button>
        ) : (
          <button className={clsx(s.skip, s.finish)} onClick={finishHandler}>
            Завершить тренировку
          </button>
        )}
      </div>
    </>
  );
}

function EffortQuestion({ set }: { set: CompletedSet }) {
  const store = useStore();
  const performance = useQueryPerformanceById(store, set.performance);
  return performance && <EffortKeys performance={performance} set={set} />;
}

// While the weight is being found the ratings move it, so they are the ones
// weight finding reads.
function EffortKeys({
  performance,
  set,
}: {
  performance: Performance;
  set: CompletedSet;
}) {
  const store = useStore();
  const plan = usePerformanceRecommendations(performance);
  const index = plan?.sets.findIndex((s) => s.id === set.id) ?? -1;
  const isFinding = plan?.recommendations[index]?.isFinding ?? false;

  const effortHandler = (effort: Effort) =>
    updateSet(store, { ...set, effort });

  return (
    <>
      <div className={s.question}>Как прошёл подход?</div>
      <div className={s.keys}>
        {(isFinding ? FINDING_EFFORTS : EFFORTS).map(({ key, label }) => (
          <button
            key={key}
            className={clsx(s.key, set.effort === key && s.selected)}
            onClick={() => effortHandler(key)}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  );
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}
