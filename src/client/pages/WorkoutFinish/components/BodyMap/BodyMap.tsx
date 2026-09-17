import s from "./styles.module.scss";
import Model, { type IExerciseData } from "react-body-highlighter";
import type { MuscleType } from "../../../../db";
import type { MuscleLevel } from "../../../../domain";
import { BODY_COLOR, LEVEL_COLORS, MODEL_MUSCLES, VIEWS } from "./constants.ts";
import type { BodyMapProps } from "./types.ts";

export function BodyMap({ levels }: BodyMapProps) {
  const data: IExerciseData[] = Object.entries(levels).map(
    ([muscle, level]) => ({
      name: muscle,
      muscles: MODEL_MUSCLES[muscle as MuscleType],
      frequency: level as MuscleLevel,
    }),
  );

  return (
    <>
      <div className={s.figures}>
        {VIEWS.map(({ type, label }) => (
          <div className={s.figure} key={type}>
            <Model
              type={type}
              data={data}
              bodyColor={BODY_COLOR}
              highlightedColors={LEVEL_COLORS}
              svgStyle={{ display: "block" }}
            />
            <div className={s.caption}>{label}</div>
          </div>
        ))}
      </div>
      <div className={s.scale}>
        мало
        {LEVEL_COLORS.map((color) => (
          <i key={color} style={{ background: color }} />
        ))}
        много
      </div>
    </>
  );
}
