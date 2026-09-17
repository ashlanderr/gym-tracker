import s from "./styles.module.scss";
import { useNavigate } from "react-router";
import { useStore } from "../../../../../../components";
import { useQueryExerciseById } from "../../../../../../db";
import type { AlternativeRowProps } from "./types.ts";

export function AlternativeRow({
  alternative,
  onReplace,
}: AlternativeRowProps) {
  const store = useStore();
  const navigate = useNavigate();
  const exercise = useQueryExerciseById(store, alternative.id);

  if (!exercise) return null;

  return (
    <div className={s.root}>
      <button
        className={s.open}
        onClick={() => navigate(`/exercises/${exercise.id}`)}
      >
        {exercise.asset?.type === "video" ? (
          <video
            className={s.thumb}
            src={exercise.asset.url}
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <span className={s.thumb} />
        )}
        <span className={s.text}>
          <span className={s.name}>{exercise.name}</span>
          <span className={s.benefits}>{alternative.benefits}</span>
        </span>
      </button>
      {onReplace && (
        <button className={s.replace} onClick={() => onReplace(exercise.id)}>
          Заменить
        </button>
      )}
    </div>
  );
}
