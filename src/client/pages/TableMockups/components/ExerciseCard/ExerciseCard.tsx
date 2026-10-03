import s from "./styles.module.scss";
import { clsx } from "clsx";
import { MdAdd, MdCheck, MdChevronRight, MdMoreHoriz } from "react-icons/md";
import { ExerciseThumb } from "../../../../components";
import { EXERCISES } from "../../../../db/exercises/constants.ts";
import { SetLine } from "../SetLine";
import type { ExerciseCardProps } from "./types.ts";

export function ExerciseCard({
  id,
  plan,
  sets,
  isFinding,
  inventory,
  isCollapsed,
  summary,
  thumbClassName,
  thumb,
  isHeaderOnly,
}: ExerciseCardProps) {
  const exercise = EXERCISES[id];
  let working = 0;

  return (
    <div className={clsx(s.root, isCollapsed && s.collapsed)}>
      <div className={s.header}>
        <div className={clsx(s.thumb, thumbClassName)}>
          {thumb ?? <ExerciseThumb exercise={exercise} />}
        </div>
        <div className={s.title}>
          <div className={s.name}>{exercise.name}</div>
          <div className={s.plan}>
            {isCollapsed ? summary : plan}
            {isFinding && !isCollapsed && (
              <span className={s.finding}>Подбор веса</span>
            )}
          </div>
        </div>
        {isCollapsed ? (
          <span className={s.done}>
            <MdCheck />
          </span>
        ) : (
          <span className={s.more}>
            <MdMoreHoriz />
          </span>
        )}
      </div>

      {!isCollapsed && !isHeaderOnly && (
        <>
          {inventory && (
            <div className={s.inventory}>
              <span className={s.inventoryText}>{inventory}</span>
              <MdChevronRight />
            </div>
          )}
          <div className={s.columns}>
            <span />
            <span>прошлый</span>
            <span>кг</span>
            <span />
            <span>повт.</span>
            <span />
          </div>
          <div className={s.sets}>
            {sets.map((set, index) => {
              if (set.type === "working") working += 1;
              return <SetLine key={index} set={set} number={working} />;
            })}
          </div>
          <span className={s.addSet}>
            <MdAdd />
            подход
          </span>
        </>
      )}
    </div>
  );
}
