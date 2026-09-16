import type { WeightsConstructor } from "../../../../domain";
import { UNITS_SHORT } from "../../../constants.ts";

export function describeWeights(ctor: WeightsConstructor): string {
  const units = UNITS_SHORT[ctor.units];

  switch (ctor.type) {
    case "barbell": {
      const side = sum(ctor.plates);
      return side ? `по ${side} на сторону` : "пустой гриф";
    }

    case "plates": {
      const side = sum(ctor.plates);
      return ctor.sides === 2 ? `по ${side} на сторону` : `${side} ${units}`;
    }

    case "dumbbell":
      return ctor.count === 2 ? "две гантели" : "одна гантель";

    case "stack":
      return `итого ${ctor.stack + ctor.additional} ${units}`;
  }
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}
