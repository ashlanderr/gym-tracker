import man from "./assets/man.webp";
import woman from "./assets/woman.webp";
import type { Sex } from "../../db";
import type { SexFigureProps } from "./types.ts";

// Line art drawn for this project, flattened and inverted the same way the
// exercise frames are. The two drawings are cropped with one shared box, so
// the figures keep their scale and stand at the same height in both cards —
// cropping each to its own ink would have made one of them taller.
const ART: Record<Sex, string> = { male: man, female: woman };

export function SexFigure({ sex, className }: SexFigureProps) {
  return <img className={className} src={ART[sex]} alt="" draggable={false} />;
}
