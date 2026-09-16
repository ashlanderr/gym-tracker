import s from "./styles.module.scss";
import { useRef, useState } from "react";
import { MdPause, MdPlayArrow } from "react-icons/md";
import type { ExerciseVideoProps } from "./types.ts";

export function ExerciseVideo({ url }: ExerciseVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPaused, setPaused] = useState(false);

  const toggleHandler = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  };

  return (
    <button className={s.root} onClick={toggleHandler}>
      <video
        ref={videoRef}
        className={s.video}
        src={url}
        autoPlay
        loop
        muted
        playsInline
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
      />
      <span className={s.state}>
        {isPaused ? <MdPlayArrow /> : <MdPause />}
      </span>
    </button>
  );
}
