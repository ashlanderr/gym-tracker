import s from "./styles.module.scss";
import type { ExerciseCrossFadeProps } from "./types.ts";

export function ExerciseCrossFade({
  startUrl,
  endUrl,
  paused = false,
  className,
}: ExerciseCrossFadeProps) {
  return (
    <div className={className ? `${s.root} ${className}` : s.root}>
      <img className={s.frame} src={startUrl} alt="" draggable={false} />
      <img
        className={`${s.frame} ${s.end} ${paused ? s.paused : ""}`}
        src={endUrl}
        alt=""
        draggable={false}
      />
    </div>
  );
}
