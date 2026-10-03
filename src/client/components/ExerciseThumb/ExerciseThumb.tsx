import s from "./styles.module.scss";
import type { ExerciseAsset } from "../../db";
import { MuscleFigure } from "../MuscleFigure";
import type { ExerciseThumbProps } from "./types.ts";

// A still that tells exercises apart at a glance. The movement itself is on
// the exercise page; here it would only make a list of them restless.
export function ExerciseThumb({ exercise, onClick }: ExerciseThumbProps) {
  const url = stillUrl(exercise.asset);

  return (
    <button className={s.root} onClick={onClick}>
      {url ? (
        <img className={s.image} src={url} alt="" />
      ) : (
        <div className={s.figure}>
          <MuscleFigure muscles={exercise.primaryMuscles} />
        </div>
      )}
    </button>
  );
}

function stillUrl(asset: ExerciseAsset | undefined): string | undefined {
  switch (asset?.type) {
    case "cross-fade":
      return asset.startUrl;
    case "image":
      return asset.url;
    case "video":
    case undefined:
      return undefined;
  }
}
