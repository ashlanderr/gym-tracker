import { type Profile, queryExerciseById, type Store } from "../../db";
import {
  ANCHOR_EXERCISES,
  ANCHOR_IDS,
  computeStrengthLevel,
  queryLiftStrength,
} from "../../domain";
import type { LiftRow } from "./types.ts";

export function buildLiftRows(
  store: Store,
  profile: Profile,
  bodyWeight: number,
  now: number,
): LiftRow[] {
  return ANCHOR_IDS.map((anchor) => {
    const { source, oneRepMax } = queryLiftStrength(
      store,
      profile,
      anchor,
      now,
    );
    const name =
      queryExerciseById(store, ANCHOR_EXERCISES[anchor])?.name ?? anchor;
    const level =
      oneRepMax === null
        ? null
        : computeStrengthLevel({
            anchor,
            sex: profile.sex,
            bodyWeight,
            oneRepMax,
          });
    return { anchor, name, source, oneRepMax, level };
  });
}

// Half a kilogram is as fine as a plate pair goes; the gap rounds up so it
// never reads zero while a level is still ahead.
export function formatKg(value: number, round: "nearest" | "up" = "nearest") {
  const halves = round === "up" ? Math.ceil(value * 2) : Math.round(value * 2);
  return `${(halves / 2).toLocaleString("ru")} кг`;
}
