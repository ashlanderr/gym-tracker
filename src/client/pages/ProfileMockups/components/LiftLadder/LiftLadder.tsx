import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useStore } from "../../../../components";
import { queryExerciseById } from "../../../../db";
import { LEVEL_LABELS } from "../../constants.ts";
import { formatKg, liftLevel } from "../../utils.ts";
import type { LiftLadderProps } from "./types.ts";

export function LiftLadder({ lifts, bodyWeight }: LiftLadderProps) {
  const store = useStore();

  return (
    <div className={s.root}>
      {lifts.map((lift) => {
        const name = queryExerciseById(store, lift.exercise)?.name;
        const level = liftLevel(lift, bodyWeight);
        return (
          <div className={s.lift} key={lift.anchor}>
            <div className={s.head}>
              <div className={s.name}>{name}</div>
              <div className={clsx(s.level, !level && s.none)}>
                {level ? LEVEL_LABELS[level.index] : "Нет данных"}
              </div>
            </div>
            <div className={s.bar}>
              {LEVEL_LABELS.map((label, index) => {
                const fill = !level
                  ? 0
                  : index < level.index
                    ? 1
                    : index === level.index
                      ? Math.max(level.progress, 0.04)
                      : 0;
                return (
                  <div className={s.segment} key={label}>
                    <div
                      className={s.fill}
                      style={{ transform: `scaleX(${fill})` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className={s.foot}>
              {!level ? (
                <span>Не делал 90 дней</span>
              ) : (
                <>
                  <span className={s.value}>
                    1ПМ {formatKg(level.oneRepMax)}
                  </span>
                  {lift.source === "survey" && (
                    <span className={s.tag}>по анкете</span>
                  )}
                  {level.toNext !== null && (
                    <span className={s.next}>
                      до «{LEVEL_LABELS[level.index + 1]}»{" "}
                      {formatKg(level.toNext, "up")}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
