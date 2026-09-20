import s from "./styles.module.scss";
import { useState } from "react";
import { useNavigate } from "react-router";
import { MdArrowBack, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useQueryCatalogExercises } from "../../../../db";
import { useStore } from "../../../../components";
import { ExerciseDetails } from "../../components";

// The whole catalog, one exercise per screen. Built for reading it through
// rather than searching: variations of one movement follow each other, so
// flipping forward compares them side by side.
export function ExerciseCatalogPage() {
  const store = useStore();
  const navigate = useNavigate();
  const exercises = useQueryCatalogExercises(store);
  const [index, setIndex] = useState(0);

  const exercise = exercises[index];
  const hasPrevious = index > 0;
  const hasNext = index < exercises.length - 1;

  if (!exercise) return null;

  return (
    <div className={s.root}>
      <div className={s.top}>
        <button className={s.back} onClick={() => navigate(-1)}>
          <MdArrowBack />
        </button>
        <div className={s.title}>Каталог</div>
        <div className={s.counter}>
          {index + 1} / {exercises.length}
        </div>
      </div>
      <ExerciseDetails exercise={exercise} onReplace={undefined} />
      <div className={s.nav}>
        <button
          className={s.navButton}
          disabled={!hasPrevious}
          onClick={() => setIndex(index - 1)}
        >
          <MdChevronLeft />
          Назад
        </button>
        <button
          className={s.navButton}
          disabled={!hasNext}
          onClick={() => setIndex(index + 1)}
        >
          Вперёд
          <MdChevronRight />
        </button>
      </div>
    </div>
  );
}
