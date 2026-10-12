import s from "./styles.module.scss";
import { useEffect, useRef } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useSetAtom } from "jotai";
import { MdMoreHoriz } from "react-icons/md";
import {
  HeaderButton,
  PageHeader,
  useModalStack,
  useScrollRestoration,
  useStore,
} from "../../components";
import {
  useQueryExerciseById,
  useQueryPerformancesByWorkout,
  useQuerySetsByPerformance,
} from "../../db";
import { queryMissingInventory, queryPendingWeight } from "../../domain";
import { usePageParams } from "../hooks.ts";
import { MUSCLES_TRANSLATION } from "../constants.ts";
import {
  Performance as PerformanceSets,
  PerformanceActions,
  PerformanceTimer,
} from "../Workout/components";
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

  const left = sets.filter((s) => !s.completed).length;
  const [mainMuscle, ...otherMuscles] = exercise?.muscles ?? [];

  if (
    performance &&
    (queryMissingInventory(store, performance) ||
      queryPendingWeight(store, performance))
  ) {
    return <Navigate to="notice" replace />;
  }

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
        onBack={goBack}
        right={
          <div className={s.headerActions}>
            {performance && <PerformanceTimer performance={performance} />}
            <HeaderButton onClick={menuHandler}>
              <MdMoreHoriz />
            </HeaderButton>
          </div>
        }
      />
      {performance && (
        <>
          <div className={s.titles}>
            <h1 className={s.name}>{exercise?.name ?? "–"}</h1>
            {mainMuscle && (
              <div className={s.muscles}>
                <b>{MUSCLES_TRANSLATION[mainMuscle]}</b>
                {otherMuscles.map((m) => `, ${MUSCLES_TRANSLATION[m]}`)}
              </div>
            )}
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
