import s from "./styles.module.scss";
import { MdAdd } from "react-icons/md";
import {
  useQueryWorkoutById,
  useQueryPerformancesByWorkout,
  useQuerySetsByWorkout,
  type Exercise,
  type MuscleType,
  type Performance,
  type Set,
  useQueryProgramById,
  queryExerciseById,
  updatePerformance,
} from "../../db";
import type { WorkoutParams } from "./types.ts";
import { usePageParams, useClock } from "../hooks.ts";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAtom } from "jotai";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";
import {
  ChooseExercise,
  CompleteWorkoutModal,
  ActiveTimer,
  ChooseProgramBottomSheet,
  ExerciseCard,
  type ExerciseCardStatus,
  LockedExerciseModal,
} from "./components";
import {
  HeaderButton,
  Marquee,
  PageHeader,
  PageModal,
  useStore,
  useModalStack,
  useScrollRestoration,
} from "../../components";
import {
  completeWorkout,
  addPerformance,
  setWorkoutProgram,
  computePerformanceStatus,
} from "../../domain";
import {
  DRAG_DELAY,
  DRAG_TOLERANCE,
  HIGHLIGHT_DURATION,
  JUST_FINISHED_ATOM,
} from "./constants.ts";

interface Highlight {
  done: string | null;
  open: string[];
}

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
  const completedSets = sets.filter((s) => s.completed);
  const volume = completedSets.reduce((v, s) => v + s.weight * s.reps, 0);
  const [isAddPerformanceOpen, setAddPerformanceOpen] = useState(false);
  const [justFinished, setJustFinished] = useAtom(JUST_FINISHED_ATOM);
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const justDragged = useRef(false);
  const { scrollRef } = useScrollRestoration();

  const setsByPerformance = groupSets(sets);
  const muscles = new Map(
    performances.map((p) => [
      p.id,
      queryExerciseById(store, p.exercise)?.muscles ?? [],
    ]),
  );
  const { statuses, blockers } = computeStatuses(
    performances,
    setsByPerformance,
    muscles,
  );
  const doneCount = performances.filter(
    (p) => statuses.get(p.id) === "done",
  ).length;

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { delay: DRAG_DELAY, tolerance: DRAG_TOLERANCE },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: DRAG_DELAY, tolerance: DRAG_TOLERANCE },
    }),
  );

  // Back from a finished exercise: it flashes green and what it unlocked
  // flashes blue, then the list calms down.
  useEffect(() => {
    if (!justFinished) return;
    // Unlocked by this exercise: locked while it was still pending.
    const before = computeStatuses(
      performances,
      setsByPerformance,
      muscles,
      justFinished,
    ).statuses;
    const open = performances
      .filter(
        (p) =>
          before.get(p.id) === "locked" && statuses.get(p.id) === "new",
      )
      .map((p) => p.id);
    setHighlight({ done: justFinished, open });
    setJustFinished(null);

    document
      .querySelector(`[data-performance="${justFinished}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });

    const timeout = setTimeout(() => setHighlight(null), HIGHLIGHT_DURATION);
    return () => clearTimeout(timeout);
  }, [justFinished]); // eslint-disable-line react-hooks/exhaustive-deps

  const addPerformanceHandler = (exercise: Exercise) => {
    if (!workout) return;
    addPerformance(store, workout, exercise.id);
    setAddPerformanceOpen(false);
  };

  const completeHandler = async () => {
    if (!workout) return;
    const partial = sets.some((s) => !s.completed);
    const result = await pushModal(CompleteWorkoutModal, { workout, partial });
    if (result) {
      completeWorkout(store, workout, result.name);
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

  const openHandler = async (performance: Performance) => {
    if (justDragged.current) return;

    if (statuses.get(performance.id) === "locked") {
      const current = (blockers.get(performance.id) ?? [])
        .map((id) => performances.find((p) => p.id === id))
        .map((p) => (p && queryExerciseById(store, p.exercise)?.name) ?? "–")
        .map((name) => name.toLowerCase());
      const confirmed = await pushModal(LockedExerciseModal, { current });
      if (!confirmed) return;
    }

    navigate(`/workouts/${workoutId}/performances/${performance.id}`);
  };

  const dragEndHandler = ({ active, over }: DragEndEvent) => {
    justDragged.current = true;
    setTimeout(() => (justDragged.current = false), 350);

    if (!over || active.id === over.id) return;
    const from = performances.findIndex((p) => p.id === active.id);
    const to = performances.findIndex((p) => p.id === over.id);
    arrayMove(performances, from, to).forEach((performance, order) => {
      if (performance.order !== order) {
        updatePerformance(store, { ...performance, order });
      }
    });
  };

  return (
    <div className={s.root} ref={scrollRef}>
      <ActiveTimer />
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
              {Math.round(volume).toLocaleString("ru-RU")} кг
            </div>
          </div>
          <div className={s.stat}>
            <div className={s.statName}>Упражнения</div>
            <div className={s.statValue}>
              {doneCount} / {performances.length}
            </div>
          </div>
        </div>
      </PageHeader>
      <div className={s.exercises}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={() => navigator.vibrate?.(15)}
          onDragEnd={dragEndHandler}
        >
          <SortableContext
            items={performances.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {performances.map((performance) => (
              <SortableCard key={performance.id} id={performance.id}>
                <ExerciseCard
                  performance={performance}
                  sets={setsByPerformance.get(performance.id) ?? []}
                  status={statuses.get(performance.id) ?? "new"}
                  highlight={
                    highlight?.done === performance.id
                      ? "done"
                      : highlight?.open.includes(performance.id)
                        ? "open"
                        : undefined
                  }
                  onClick={() => openHandler(performance)}
                />
              </SortableCard>
            ))}
          </SortableContext>
        </DndContext>
        <button
          className={s.addExerciseButton}
          onClick={() => setAddPerformanceOpen(true)}
        >
          <MdAdd />
          Добавить упражнение
        </button>
        {performances.length > 1 && (
          <p className={s.hint}>
            Зажми карточку и перетащи, чтобы поменять порядок
          </p>
        )}
      </div>
      <PageModal isOpen={isAddPerformanceOpen}>
        <ChooseExercise
          onCancel={() => setAddPerformanceOpen(false)}
          onSubmit={addPerformanceHandler}
        />
      </PageModal>
    </div>
  );
}

function SortableCard({ id, children }: { id: string; children: ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      data-performance={id}
      className={clsx(s.sortable, isDragging && s.lifted)}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

function groupSets(sets: Set[]): Map<string, Set[]> {
  const result = new Map<string, Set[]>();
  for (const set of [...sets].sort((a, b) => a.order - b.order)) {
    result.set(set.performance, [...(result.get(set.performance) ?? []), set]);
  }
  return result;
}

interface WorkoutStatuses {
  statuses: Map<string, ExerciseCardStatus>;
  // The earlier exercises an exercise waits for.
  blockers: Map<string, string[]>;
}

// An exercise not started waits for the exercises above it that work any of
// its muscles and are not done yet: tired muscles would not match the last
// time. Exercises for other muscles stay open in parallel. The pending one
// counts as not done, to see what finishing it unlocked.
function computeStatuses(
  performances: Performance[],
  setsByPerformance: Map<string, Set[]>,
  muscles: Map<string, MuscleType[]>,
  pending?: string,
): WorkoutStatuses {
  const statuses = new Map<string, ExerciseCardStatus>();
  const blockers = new Map<string, string[]>();
  const unfinished: Performance[] = [];

  for (const performance of performances) {
    const own = muscles.get(performance.id) ?? [];
    const status =
      performance.id === pending
        ? "progress"
        : computePerformanceStatus(setsByPerformance.get(performance.id) ?? []);
    const waitsFor = unfinished
      .filter((p) => muscles.get(p.id)?.some((m) => own.includes(m)))
      .map((p) => p.id);

    blockers.set(performance.id, waitsFor);
    statuses.set(
      performance.id,
      status === "new" && waitsFor.length !== 0 ? "locked" : status,
    );
    if (status !== "done") unfinished.push(performance);
  }

  return { statuses, blockers };
}
