import s from "./styles.module.scss";
import { clsx } from "clsx";
import { MdCheck } from "react-icons/md";
import { PiMedalFill } from "react-icons/pi";
import type { SetLineProps } from "./types.ts";

export function SetLine({ set, number }: SetLineProps) {
  const isDone = set.state === "done";
  const isWarmUp = set.type === "warm-up";

  return (
    <div className={clsx(s.root, s[set.state])}>
      <div className={s.line}>
        <span className={clsx(s.badge, isWarmUp && s.warmUp)}>
          {set.isRecord ? (
            <PiMedalFill className={s.medal} />
          ) : isWarmUp ? (
            "Р"
          ) : (
            number
          )}
        </span>
        <span className={s.prev}>{set.prev ?? "—"}</span>
        <span
          className={clsx(
            s.value,
            set.isSuggested && !isDone && s.suggested,
            set.weight === undefined && s.unknown,
          )}
        >
          {set.weight ?? "?"}
        </span>
        <span className={s.times}>×</span>
        <span
          className={clsx(s.value, set.isSuggested && !isDone && s.suggested)}
        >
          {set.reps}
        </span>
        <span className={clsx(s.check, isDone && s.checked)}>
          <MdCheck />
        </span>
      </div>
      {set.reason && <div className={s.reason}>{set.reason}</div>}
    </div>
  );
}
