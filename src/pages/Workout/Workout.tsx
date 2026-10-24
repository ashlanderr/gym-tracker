import s from "./styles.module.scss";
import { MdAdd } from "react-icons/md";
import {
  useQueryWorkoutById,
  useQueryPerformancesByWorkout,
  useQuerySetsByWorkout,
  useQueryProgramById,
} from "../../db";
import type { WorkoutParams } from "./types.ts";
import { usePageParams, useClock } from "../hooks.ts";
import { useNavigate } from "react-router";
import {
  ChooseExerciseModal,
  CompleteWorkoutModal,
  ChooseProgramBottomSheet,
  Performance,
  useActiveTimer,
} from "./components";
import {
  HeaderButton,
  Marquee,
  PageHeader,
  useStore,
  useModalStack,
  useScrollRestoration,
} from "../../components";
import {
  completeWorkout,
  addPerformance,
  setWorkoutProgram,
  findNextSet,
  groupSets,
} from "../../domain";
import { formatNumber } from "../../utils";

export function Workout() {
  const { workoutId } = usePageParams<WorkoutParams>();
  const store = useStore();
  const navigate = useNavigate();
  const { pushModal } = useModalStack();
  const workout = useQueryWorkoutById(store, workoutId);
  const program = useQueryProgramById(store, workout?.program ?? "");
  const clock = useClock(
    workout?.startedAt ?? null,
    workout?.completedAt ?? null,
  );
  const performances = useQueryPerformancesByWorkout(store, workoutId);
  const sets = useQuerySetsByWorkout(store, workoutId);
  const setsByPerformance = groupSets(sets);
  const nextSet = findNextSet(performances, setsByPerformance);
  const completedSets = sets.filter((s) => s.completed);
  const volume = completedSets.reduce((v, s) => v + s.weight * s.reps, 0);
  const { scrollRef } = useScrollRestoration();
  const { startTimer } = useActiveTimer();

  const addPerformanceHandler = async () => {
    const exercise = await pushModal(ChooseExerciseModal, null);
    if (exercise && workout) addPerformance(store, workout, exercise.id);
  };

  const completeHandler = async () => {
    if (!workout) return;
    const partial = sets.some((s) => !s.completed);
    const result = await pushModal(CompleteWorkoutModal, { workout, partial });
    if (result) {
      completeWorkout(store, workout, result.name);
      startTimer(undefined);
      navigate("/", { replace: true });
    }
  };

  const handleSelectProgram = async () => {
    if (!workout) return;
    const result = await pushModal(ChooseProgramBottomSheet, {
      current: program ?? null,
    });
    if (result !== undefined) {
      setWorkoutProgram(store, workout, result ?? undefined);
    }
  };

  return (
    <div className={s.root} ref={scrollRef}>
      <PageHeader
        kicker={`Тренировка · ${program?.name ?? "Базовая"}`}
        title={<Marquee>{workout?.name ?? "Тренировка"}</Marquee>}
        onBack={() => navigate(-1)}
        onTitleClick={handleSelectProgram}
        right={
          <HeaderButton primary onClick={completeHandler}>
            {workout?.completedAt ? "Обновить" : "Закончить"}
          </HeaderButton>
        }
      >
        <div className={s.stats}>
          <div className={s.stat}>
            <div className={s.statName}>Время</div>
            <div className={s.statValue}>{clock}</div>
          </div>
          <div className={s.stat}>
            <div className={s.statName}>Объём</div>
            <div className={s.statValue}>
              {formatNumber(Math.round(volume))} кг
            </div>
          </div>
          <div className={s.stat}>
            <div className={s.statName}>Подходы</div>
            <div className={s.statValue}>
              {completedSets.length} / {sets.length}
            </div>
          </div>
        </div>
      </PageHeader>
      <div className={s.exercises}>
        {performances.map((performance) => (
          <Performance
            key={performance.id}
            performance={performance}
            nextSetId={nextSet?.id}
          />
        ))}
        <button className={s.addExerciseButton} onClick={addPerformanceHandler}>
          <MdAdd />
          Добавить упражнение
        </button>
      </div>
    </div>
  );
}
