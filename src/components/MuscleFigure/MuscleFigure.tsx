import Model, { type IExerciseData, type Muscle } from "react-body-highlighter";
import {
  BODY_COLOR,
  MODEL_MUSCLES,
  POSTERIOR_MUSCLES,
  PRIMARY_COLOR,
  SECONDARY_COLOR,
} from "./constants.ts";
import type { MuscleFigureProps } from "./types.ts";

// One side of the body with the muscles of an exercise lit, in place of a
// picture of the exercise. The first muscle is the main one and picks the side.
export function MuscleFigure({ muscles }: MuscleFigureProps) {
  const [main, ...secondary] = muscles;
  const type =
    main && POSTERIOR_MUSCLES.includes(main) ? "posterior" : "anterior";

  // The model adds frequencies up, so each drawn muscle goes in once, at the
  // level of the most important muscle that maps to it.
  const levels = new Map<Muscle, number>();
  secondary
    .flatMap((muscle) => MODEL_MUSCLES[muscle])
    .forEach((muscle) => levels.set(muscle, 1));
  if (main) {
    MODEL_MUSCLES[main].forEach((muscle) => levels.set(muscle, 2));
  }

  const data: IExerciseData[] = [...levels].map(([muscle, frequency]) => ({
    name: muscle,
    muscles: [muscle],
    frequency,
  }));

  return (
    <Model
      type={type}
      data={data}
      bodyColor={BODY_COLOR}
      highlightedColors={[SECONDARY_COLOR, PRIMARY_COLOR]}
      style={{ width: "100%", height: "100%" }}
      svgStyle={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
