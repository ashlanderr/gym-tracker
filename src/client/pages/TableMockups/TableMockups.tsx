import s from "./styles.module.scss";
import type { ReactNode } from "react";
import { MdAdd } from "react-icons/md";
import { MuscleFigure } from "../../components";
import { EXERCISES } from "../../db/exercises/constants.ts";
import { ExerciseCard, type MockSet, RestPill, WorkoutBar } from "./components";

const ROW_SETS: MockSet[] = [
  { type: "warm-up", state: "done", weight: "30", reps: "12" },
  { type: "warm-up", state: "done", weight: "50", reps: "6" },
  { type: "working", state: "done", prev: "—", weight: "60", reps: "8" },
  {
    type: "working",
    state: "current",
    weight: "75",
    reps: "6–8",
    isSuggested: true,
    reason: "Прошлый подход был лёгким — вес выше",
  },
  {
    type: "working",
    state: "next",
    weight: "75",
    reps: "6–8",
    isSuggested: true,
  },
];

const PEC_DECK_SETS: MockSet[] = [1, 2, 3].map(() => ({
  type: "working",
  state: "next",
  reps: "10–15",
  isSuggested: true,
}));

const CURL_SETS: MockSet[] = [1, 2, 3].map(() => ({
  type: "working",
  state: "next",
  prev: "12 × 10",
  weight: "12",
  reps: "8–12",
  isSuggested: true,
}));

const BENCH_START: MockSet[] = [
  {
    type: "warm-up",
    state: "current",
    weight: "30",
    reps: "12",
    isSuggested: true,
  },
  {
    type: "warm-up",
    state: "next",
    weight: "50",
    reps: "6",
    isSuggested: true,
  },
  ...[1, 2, 3].map(
    (): MockSet => ({
      type: "working",
      state: "next",
      prev: "60 × 8",
      weight: "62.5",
      reps: "6–8",
      isSuggested: true,
    }),
  ),
];

const THUMB_EXERCISES = [
  "bench_press",
  "back_squat",
  "barbell_curl",
  "preacher_dumbbell_curl",
  "chest_supported_row_plates",
];

// Variants of the workout screen to compare side by side. Reachable only by
// typing the address while developing.
export function TableMockups() {
  return (
    <div className={s.root}>
      <h1 className={s.heading}>Экран тренировки</h1>
      <p className={s.lead}>
        Середина тренировки и её начало. Сделанное упражнение свёрнуто в итог,
        текущий подход подсвечен, отдых плавает над подходами.
      </p>
      <div className={s.phones}>
        <Phone title="Середина, идёт отдых">
          <WorkoutBar time="38:12" done={7} total={16} />
          <div className={s.cards}>
            <ExerciseCard
              id="bench_press"
              plan=""
              sets={[]}
              isCollapsed
              summary="62.5 кг · 8, 8, 7"
            />
            <ExerciseCard
              id="barbell_row"
              plan="3 × 6–8 · отдых 2:00"
              sets={ROW_SETS}
              isFinding
            />
            <ExerciseCard
              id="pec_deck"
              plan="3 × 10–15 · отдых 1:30"
              sets={PEC_DECK_SETS}
              inventory="Укажи веса на стеке"
            />
            <ExerciseCard
              id="preacher_dumbbell_curl"
              plan="3 × 8–12 · отдых 1:30"
              sets={CURL_SETS}
            />
            <AddExercise />
          </div>
          <RestPill time="1:24" progress={0.3} />
        </Phone>

        <Phone title="Начало">
          <WorkoutBar time="0:42" done={0} total={14} />
          <div className={s.cards}>
            <ExerciseCard
              id="bench_press"
              plan="3 × 6–8 · отдых 2:00"
              sets={BENCH_START}
            />
            <ExerciseCard
              id="barbell_row"
              plan="3 × 6–8 · отдых 2:00"
              sets={[1, 2, 3].map(() => ({
                type: "working",
                state: "next",
                weight: "60",
                reps: "6–8",
                isSuggested: true,
              }))}
              isFinding
            />
            <AddExercise />
          </div>
        </Phone>
      </div>

      <h1 className={s.heading}>Картинка упражнения</h1>
      <p className={s.lead}>
        Кадры из линий мельчат на 44 px. Без кадра — фигура с мышцами со стороны
        главной мышцы.
      </p>
      <div className={s.phones}>
        <Thumbs title="Как есть" />
        <Thumbs title="Крупнее, поля обрезаны" className={s.zoom} />
        <Thumbs title="Только мышцы" isMuscles />
      </div>
    </div>
  );
}

function Phone({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={s.phoneBlock}>
      <div className={s.phoneTitle}>{title}</div>
      <div className={s.phone}>{children}</div>
    </section>
  );
}

function AddExercise() {
  return (
    <div className={s.addExercise}>
      <MdAdd />
      Добавить упражнение
    </div>
  );
}

function Thumbs({
  title,
  className,
  isMuscles,
}: {
  title: string;
  className?: string;
  isMuscles?: boolean;
}) {
  return (
    <section className={s.phoneBlock}>
      <div className={s.phoneTitle}>{title}</div>
      <div className={s.thumbs}>
        {THUMB_EXERCISES.map((id) => (
          <ExerciseCard
            key={id}
            id={id}
            plan="3 × 6–8 · отдых 2:00"
            sets={[]}
            isHeaderOnly
            thumbClassName={className}
            thumb={
              isMuscles ? (
                <div className={s.muscleTile}>
                  <MuscleFigure muscles={EXERCISES[id].primaryMuscles} />
                </div>
              ) : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}
