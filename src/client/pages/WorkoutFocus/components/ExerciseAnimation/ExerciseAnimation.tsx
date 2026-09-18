import s from "./styles.module.scss";
import { useState } from "react";
import { MdPause, MdPlayArrow } from "react-icons/md";
import { ExerciseCrossFade } from "../../../../components";
import type { ExerciseAnimationProps } from "./types.ts";

export function ExerciseAnimation({ startUrl, endUrl }: ExerciseAnimationProps) {
  const [isPaused, setPaused] = useState(false);

  return (
    <button className={s.root} onClick={() => setPaused((paused) => !paused)}>
      <ExerciseCrossFade
        className={s.animation}
        startUrl={startUrl}
        endUrl={endUrl}
        paused={isPaused}
      />
      <span className={s.state}>
        {isPaused ? <MdPlayArrow /> : <MdPause />}
      </span>
    </button>
  );
}
