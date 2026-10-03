import Model from "react-body-highlighter";
import {
  BODY_COLOR,
  LEVEL_COLORS,
  MODEL_MUSCLES,
} from "../BodyMap/constants.ts";
import { POSTERIOR_MUSCLES } from "./constants.ts";
import type { MuscleFigureProps } from "./types.ts";

// One side of the body with the muscles of an exercise lit, for an exercise
// that has no picture of its own.
export function MuscleFigure({ muscles }: MuscleFigureProps) {
  const main = muscles.at(0);
  const type =
    main && POSTERIOR_MUSCLES.includes(main) ? "posterior" : "anterior";

  return (
    <Model
      type={type}
      data={[
        {
          name: "exercise",
          muscles: muscles.flatMap((muscle) => MODEL_MUSCLES[muscle]),
        },
      ]}
      bodyColor={BODY_COLOR}
      highlightedColors={[LEVEL_COLORS[2]]}
      svgStyle={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
