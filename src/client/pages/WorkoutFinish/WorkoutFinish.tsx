import s from "./styles.module.scss";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { MdClose } from "react-icons/md";
import { PiMedalFill } from "react-icons/pi";
import {
  type Exercise,
  useQueryAllExercises,
  useQueryCompletedWorkouts,
  useQueryCurrentGym,
  useQueryPerformancesByWorkout,
  useQueryRecordsByWorkout,
  useQuerySetsByWorkout,
  useQueryWorkoutById,
} from "../../db";
import { BodyMap, useStore } from "../../components";
import {
  completeWorkout,
  computeMuscleLevels,
  getWeightUnits,
} from "../../domain";
import { isSingular, pluralize } from "../../utils";
import { usePageParams } from "../hooks.ts";
import { UNITS_SHORT } from "../constants.ts";
import type { WorkoutParams } from "../Workout/types.ts";
import { formatExerciseWeight, useClock } from "../WorkoutFocus/hooks.ts";
import { buildFinishSummary, formatDurationWords } from "./utils.ts";

const SKIPPED_FORMS: [string, string, string] = [
  "запланированный подход",
  "запланированных подхода",
  "запланированных подходов",
];

export function WorkoutFinish() {
  const { workoutId } = usePageParams<WorkoutParams>();
  const store = useStore();
  const navigate = useNavigate();
  const workout = useQueryWorkoutById(store, workoutId);
  const performances = useQueryPerformancesByWorkout(store, workoutId);
  const sets = useQuerySetsByWorkout(store, workoutId);
  const records = useQueryRecordsByWorkout(store, workoutId);
  const exercises = useQueryAllExercises(store);
  const completedWorkouts = useQueryCompletedWorkouts(store);
  const clock = useClock(workout?.startedAt);
  const gym = useQueryCurrentGym(store, workout?.user ?? "");

  const summary = useMemo(
    () =>
      buildFinishSummary({
        performances,
        sets,
        records,
        exercises: new Map(exercises.map((e) => [e.id, e])),
      }),
    [performances, sets, records, exercises],
  );
  const levels = useMemo(
    () => computeMuscleLevels(summary.muscleWork),
    [summary],
  );

  if (!workout) return null;

  const number =
    completedWorkouts.length + (workout.completedAt === null ? 1 : 0);
  const kg = UNITS_SHORT.kg;

  // Exercises may use different units in the same gym, so every weight
  // carries its own.
  const weightText = (exercise: Exercise, weightKg: number) => {
    const units = getWeightUnits(exercise, gym);
    const weight = formatExerciseWeight(exercise, units, weightKg);
    return `${weight.value} ${weight.units}`;
  };

  const finishHandler = () => {
    completeWorkout(store, workout, workout.name);
    navigate("/", { replace: true });
  };

  return (
    <div className={s.root}>
      <div className={s.top}>
        <button className={s.close} onClick={() => navigate(-1)}>
          <MdClose />
        </button>
        <div className={s.clock}>{clock}</div>
      </div>
      <div className={s.content}>
        <div className={s.header}>
          <div className={s.title}>Тренировка закончена</div>
          <div className={s.subtitle}>Это твоя {number}-я тренировка</div>
          <div className={s.name}>{workout.name}</div>
        </div>
        <BodyMap levels={levels} />
        <div className={s.numbers}>
          <div className={s.number}>
            <div className={s.value}>
              {formatDurationWords(Date.now() - workout.startedAt)}
            </div>
            <div className={s.label}>время</div>
          </div>
          <div className={s.number}>
            <div className={s.value}>{summary.completedSets}</div>
            <div className={s.label}>подходов</div>
          </div>
          <div className={s.number}>
            <div className={s.value}>
              {Math.round(summary.volume).toLocaleString("ru")}
            </div>
            <div className={s.label}>{kg}</div>
          </div>
        </div>
        {summary.skippedSets !== 0 && (
          <div className={s.warning}>
            {pluralize(summary.skippedSets, SKIPPED_FORMS)}{" "}
            {isSingular(summary.skippedSets)
              ? "не сделан. Он не сохранится."
              : "не сделаны. Они не сохранятся."}
          </div>
        )}
        {summary.events.length !== 0 && (
          <div className={s.section}>
            <div className={s.sectionTitle}>Сегодня впервые</div>
            {summary.events.map((event, i) => {
              const weight = weightText(event.exercise, event.weight);
              return (
                <div className={s.event} key={`${event.exercise.id}-${i}`}>
                  {event.type === "best_set" ? (
                    <PiMedalFill className={s.medal} />
                  ) : (
                    <span className={s.up}>▲</span>
                  )}
                  <div>
                    <b>{event.exercise.name}</b>{" "}
                    <span className={s.muted}>
                      {event.type === "best_set"
                        ? `— лучший подход ${weight} × ${event.reps}`
                        : `— вес вырос до ${weight}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {summary.nextTime.length !== 0 && (
          <div className={s.section}>
            <div className={s.sectionTitle}>В следующий раз</div>
            {summary.nextTime.map(({ exercise, weight }, i) => (
              <div className={s.next} key={`${exercise.id}-${i}`}>
                <b>
                  {exercise.name} {weightText(exercise, weight)}
                </b>{" "}
                — тот же вес, что сегодня
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={s.actions}>
        <button className={s.finish} onClick={finishHandler}>
          Завершить
        </button>
        <button className={s.continue} onClick={() => navigate(-1)}>
          Продолжить тренировку
        </button>
      </div>
    </div>
  );
}
