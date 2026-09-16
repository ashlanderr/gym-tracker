import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useAtomValue } from "jotai";
import { MdArrowBack } from "react-icons/md";
import {
  useQueryPerformancesByWorkout,
  useQuerySetsByWorkout,
  useQueryWorkoutById,
} from "../../db";
import { useModalStack, useStore } from "../../components";
import {
  buildWorkoutSteps,
  completeWorkout,
  findCurrentStep,
} from "../../domain";
import { usePageParams } from "../hooks.ts";
import type { WorkoutParams } from "../Workout/types.ts";
import { CompleteWorkoutModal, useActiveTimer } from "../Workout/components";
import { FocusMessage, RestView, SetView } from "./components";
import { useClock, useRestSeconds } from "./hooks.ts";
import { LAST_COMPLETED_SET_ATOM } from "./constants.ts";

export function WorkoutFocus() {
  const { workoutId } = usePageParams<WorkoutParams>();
  const store = useStore();
  const navigate = useNavigate();
  const { pushModal } = useModalStack();
  const workout = useQueryWorkoutById(store, workoutId);
  const performances = useQueryPerformancesByWorkout(store, workoutId);
  const sets = useQuerySetsByWorkout(store, workoutId);
  const { deadline } = useActiveTimer();
  const restSeconds = useRestSeconds(deadline);
  const lastSetId = useAtomValue(LAST_COMPLETED_SET_ATOM);
  const clock = useClock(workout?.startedAt);

  const steps = useMemo(
    () => buildWorkoutSteps(performances, sets),
    [performances, sets],
  );
  const current = findCurrentStep(steps);
  const lastSet = sets.find((set) => set.id === lastSetId);

  const openTable = () => navigate(`/workouts/${workoutId}/all`);

  const completeHandler = async () => {
    if (!workout) return;
    const result = await pushModal(CompleteWorkoutModal, {
      workout,
      partial: false,
    });
    if (result) {
      completeWorkout(store, workout, result.name);
      navigate("/", { replace: true });
    }
  };

  const renderStage = () => {
    if (steps.length === 0) {
      return (
        <FocusMessage
          text="В тренировке пока нет упражнений"
          action="Добавить упражнение"
          onAction={openTable}
        />
      );
    }

    if (current && restSeconds > 0) {
      return (
        <RestView next={current} seconds={restSeconds} lastSet={lastSet} />
      );
    }

    if (current) {
      return <SetView key={current.set.id} step={current} />;
    }

    return (
      <FocusMessage
        text="Все подходы сделаны"
        action="Закончить тренировку"
        onAction={completeHandler}
      />
    );
  };

  return (
    <div className={s.root}>
      <div className={s.top}>
        <button className={s.back} onClick={() => navigate("/")}>
          <MdArrowBack />
        </button>
        <button className={s.clock} onClick={openTable}>
          {clock}
        </button>
      </div>
      <button className={s.progress} onClick={openTable}>
        {steps.map((step) => (
          <i
            key={step.set.id}
            className={clsx(
              step.set.completed && s.done,
              step === current && s.current,
            )}
          />
        ))}
      </button>
      {renderStage()}
    </div>
  );
}
