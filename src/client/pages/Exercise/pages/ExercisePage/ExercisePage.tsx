import s from "./styles.module.scss";
import { useNavigate, useSearchParams } from "react-router";
import { MdArrowBack } from "react-icons/md";
import {
  queryExerciseById,
  useQueryExerciseById,
  useQueryPerformanceById,
  useQuerySetsByPerformance,
  useQueryWorkoutById,
} from "../../../../db";
import { useModalStack, useStore } from "../../../../components";
import { replacePerformance } from "../../../../domain";
import { usePageParams } from "../../../hooks.ts";
import type { ExercisePageParams } from "../../types.ts";
import { ExerciseDetails } from "../../components";
import { ReplaceExerciseModal } from "./components";

// Opened from a workout, the page carries the performance and can replace
// the exercise in it. Otherwise it is read-only.
export function ExercisePage() {
  const store = useStore();
  const navigate = useNavigate();
  const { pushModal } = useModalStack();
  const { exerciseId } = usePageParams<ExercisePageParams>();
  const [searchParams] = useSearchParams();
  const exercise = useQueryExerciseById(store, exerciseId);
  const performance = useQueryPerformanceById(
    store,
    searchParams.get("performance") ?? "",
  );
  const workout = useQueryWorkoutById(store, performance?.workout ?? "");
  const performanceSets = useQuerySetsByPerformance(
    store,
    performance?.id ?? "",
  );

  if (!exercise) return null;

  const canReplace = performance !== null && workout?.completedAt === null;

  const replaceHandler = async (alternative: string) => {
    if (!performance) return;

    const confirmed = await pushModal(ReplaceExerciseModal, {
      from: exercise.name,
      to: queryExerciseById(store, alternative)?.name ?? "",
      doneSets: performanceSets.filter((set) => set.completed).length,
    });
    if (!confirmed) return;

    replacePerformance(store, performance, alternative);
    navigate(-1);
  };

  return (
    <div className={s.root}>
      <div className={s.top}>
        <button className={s.back} onClick={() => navigate(-1)}>
          <MdArrowBack />
        </button>
        <div className={s.title}>Упражнение</div>
      </div>
      <ExerciseDetails
        exercise={exercise}
        onReplace={canReplace ? replaceHandler : undefined}
      />
    </div>
  );
}
