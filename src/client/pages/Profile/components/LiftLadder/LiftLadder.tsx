import s from "./styles.module.scss";
import { clsx } from "clsx";
import { LEVEL_LABELS } from "../../constants.ts";
import { formatKg } from "../../utils.ts";
import type { LiftSource } from "../../../../domain";
import type { LiftLadderProps } from "./types.ts";

// A tag says where a number came from when it is not the person's own lifting.
const SOURCE_TAGS = {
  history: null,
  survey: "по анкете",
  default: "оценка",
  stale: null,
};

// A number that came from an answer can be answered again; the dashed tag
// says so. A lift with sets of its own opens its page instead.
const EDITABLE: LiftSource[] = ["survey", "default"];

export function LiftLadder({ rows, onSelect }: LiftLadderProps) {
  return (
    <div className={s.root}>
      {rows.map((row) => {
        const { anchor, name, source, oneRepMax, level } = row;
        return (
          <button key={anchor} className={s.row} onClick={() => onSelect(row)}>
            <div className={s.head}>
              <div className={s.name}>{name}</div>
              <div className={clsx(s.level, !level && s.none)}>
                {level ? LEVEL_LABELS[level.level] : "Нет данных"}
              </div>
            </div>
            <div className={s.bar}>
              {LEVEL_LABELS.map((label, index) => (
                <div className={s.segment} key={label}>
                  <div
                    className={s.fill}
                    style={{
                      transform: `scaleX(${segmentFill(level, index)})`,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className={s.foot}>
              {oneRepMax === null || !level ? (
                <span>Не было подходов 90 дней</span>
              ) : (
                <>
                  <span className={s.value}>1ПМ {formatKg(oneRepMax)}</span>
                  {SOURCE_TAGS[source] && (
                    <span
                      className={clsx(
                        s.tag,
                        EDITABLE.includes(source) && s.editable,
                      )}
                    >
                      {SOURCE_TAGS[source]}
                    </span>
                  )}
                  {level.toNext !== null && (
                    <span className={s.next}>
                      до «{LEVEL_LABELS[level.level + 1]}»{" "}
                      {formatKg(level.toNext, "up")}
                    </span>
                  )}
                </>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Passed levels are full, the current one shows how far along it is, and a
// sliver stays visible at its very start.
function segmentFill(
  level: LiftLadderProps["rows"][number]["level"],
  index: number,
): number {
  if (!level || index > level.level) return 0;
  if (index < level.level) return 1;
  return Math.max(level.progress, 0.04);
}
