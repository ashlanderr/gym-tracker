import s from "./styles.module.scss";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { useSetAtom } from "jotai";
import { MdMoreHoriz } from "react-icons/md";
import {
  HeaderButton,
  MuscleFigure,
  PageHeader,
  useModalStack,
  useScrollRestoration,
  useStore,
} from "../../components";
import {
  DEFAULT_WEIGHT_UNITS,
  useQueryExerciseById,
  useQueryPerformancesByWorkout,
  useQueryPreviousPerformance,
  useQuerySetsByPerformance,
} from "../../db";
import { usePageParams } from "../hooks.ts";
import { UNITS_SHORT } from "../constants.ts";
import {
  Performance as PerformanceSets,
  PerformanceActions,
  PerformanceTimer,
} from "../Workout/components";
import {
  formatPlannedReps,
  formatWeightUnits,
} from "../Workout/hooks.ts";
import { JUST_FINISHED_ATOM } from "../Workout/constants.ts";
import type { PerformanceParams } from "./types.ts";

export function Performance() {
  const { workoutId, performanceId } = usePageParams<PerformanceParams>();
  const store = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { pushModal } = useModalStack();
  const { scrollRef } = useScrollRestoration();
  const setJustFinished = useSetAtom(JUST_FINISHED_ATOM);

  const performances = useQueryPerformancesByWorkout(store, workoutId);
  const performance = performances.find((p) => p.id === performanceId);
  const exercise = useQueryExerciseById(store, performance?.exercise ?? "");
  const sets = useQuerySetsByPerformance(store, performanceId);
  const prevPerformance = useQueryPreviousPerformance(
    store,
    performance?.exercise ?? "",
    performance?.startedAt ?? 0,
    performance?.program,
  );
  const prevSets = useQuerySetsByPerformance(store, prevPerformance?.id ?? "");

  const goBack = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate(`/workouts/${workoutId}`, { replace: true });
    }
  };

  // Removed or replaced from the menu: there is nothing left to show here.
  const wasShown = useRef(false);
  useEffect(() => {
    if (performance) {
      wasShown.current = true;
    } else if (wasShown.current) {
      goBack();
    }
  }, [performance]); // eslint-disable-line react-hooks/exhaustive-deps

  const units = performance?.weights?.units ?? DEFAULT_WEIGHT_UNITS;
  const working = sets.filter((s) => s.type !== "warm-up");
  const left = sets.filter((s) => !s.completed).length;
  const prevSet = prevSets.find((s) => s.completed && s.type !== "warm-up");

  const menuHandler = async () => {
    if (!performance) return;
    await pushModal(PerformanceActions, { performance, exercise });
  };

  const finishHandler = () => {
    if (left !== 0) return;
    setJustFinished(performanceId);
    goBack();
  };

  return (
    <div className={s.root} ref={scrollRef}>
      <PageHeader
        title={performance && <PerformanceTimer performance={performance} />}
        onBack={goBack}
        right={
          <HeaderButton onClick={menuHandler}>
            <MdMoreHoriz />
          </HeaderButton>
        }
      />
      {performance && (
        <>
          <div className={s.card}>
            <div className={s.picture}>
              <MuscleFigure muscles={exercise?.muscles ?? []} />
            </div>
            <div className={s.titles}>
              <h1 className={s.name}>{exercise?.name ?? "–"}</h1>
              <div className={s.spec}>
                <b>{working.length}</b> × <b>{formatPlannedReps(exercise, prevSet)}</b> @{" "}
                <b>
                  {prevSet ? formatWeightUnits(prevSet.weight, units) : "?"}
                </b>{" "}
                {UNITS_SHORT[units]}
              </div>
            </div>
          </div>
          <div className={s.sets}>
            <PerformanceSets performance={performance} />
          </div>
          <div className={s.actions}>
            <button
              className={s.finishButton}
              disabled={left !== 0}
              onClick={finishHandler}
            >
              {left !== 0
                ? `Осталось подходов: ${left}`
                : "Завершить упражнение"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
