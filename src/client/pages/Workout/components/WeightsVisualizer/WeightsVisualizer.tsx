import type { Exercise, Gym, StackWeights } from "../../../../db";
import s from "./styles.module.scss";
import { clsx } from "clsx";
import { computeWeights, type WeightsConstructor } from "../../../../domain";
import { UNITS_SHORT } from "../../../constants.ts";

export interface WeightsVisualizerProps {
  exercise: Exercise;
  gym: Gym;
  weightKg: number;
}

const STACK_BRICKS = 11;
const STACK_BELOW_PIN = 3;

export function WeightsVisualizer({
  exercise,
  gym,
  weightKg,
}: WeightsVisualizerProps) {
  const ctor = computeWeights(exercise, gym, weightKg);
  if (!ctor) return null;

  const rackHeight = plateHeight(Math.max(0, ...gym.plates.items));

  switch (ctor.type) {
    case "barbell":
      return barbellWeights(ctor, rackHeight);

    case "dumbbell":
      return dumbbellWeights(ctor);

    case "stack":
      return stackWeights(ctor, gym.stacks[exercise.id]);

    case "plates":
      return platesWeights(ctor, rackHeight);
  }
}

type Ctor<T extends WeightsConstructor["type"]> = Extract<
  WeightsConstructor,
  { type: T }
>;

// The rack keeps the height of the largest plate in the gym, so changing the
// weight never moves the bar.
function barbellWeights(ctor: Ctor<"barbell">, height: number) {
  return (
    <div className={s.barbell} style={{ height }}>
      <div className={s.barSpacer} />
      {renderPlates([...ctor.plates].reverse(), "left")}
      <div className={clsx(s.plate, s.innerPlate)} />
      <div className={s.barCenter} />
      <div className={clsx(s.plate, s.innerPlate)} />
      {renderPlates(ctor.plates, "right")}
      <div className={s.barSpacer} />
      <div className={s.bar}>
        <span className={clsx(s.barLabel, s.num)}>
          {ctor.bar} {UNITS_SHORT[ctor.units]}
        </span>
      </div>
    </div>
  );
}

function dumbbellWeights(ctor: Ctor<"dumbbell">) {
  return (
    <div className={s.dumbbells}>
      {Array.from({ length: ctor.count }, (_, i) => (
        <div className={s.dumbbell} key={i}>
          <div className={s.barbell}>
            <div className={s.barSpacer} />
            <div className={clsx(s.plate, s.dumbbellOuter)} />
            <div className={clsx(s.plate, s.dumbbellInner)} />
            <div className={clsx(s.plate, s.innerPlate)} />
            <div className={s.barCenter} />
            <div className={clsx(s.plate, s.innerPlate)} />
            <div className={clsx(s.plate, s.dumbbellInner)} />
            <div className={clsx(s.plate, s.dumbbellOuter)} />
            <div className={s.barSpacer} />
            <div className={s.bar}>
              <span className={clsx(s.barLabel, s.num)}>
                {ctor.dumbbell} {UNITS_SHORT[ctor.units]}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// The stack always shows the same bricks and only the pin moves, like on a
// machine. Heavy weights scroll the bricks so a few stay below the pin.
function stackWeights(ctor: Ctor<"stack">, stack: StackWeights | undefined) {
  const base = stack?.base ?? 0;
  const step = stack?.step || 1;
  const pin = Math.max(0, Math.round((ctor.stack - base) / step));
  const offset = Math.max(0, pin - (STACK_BRICKS - STACK_BELOW_PIN - 1));

  return (
    <div className={s.stack}>
      <div className={s.stackTop}>
        <div className={s.stackRod} />
        {ctor.additional !== 0 && (
          <div className={s.addChip}>
            <span className={s.num}>+{ctor.additional}</span>
          </div>
        )}
      </div>
      {Array.from({ length: STACK_BRICKS }, (_, i) => {
        const brick = i + offset;
        return (
          <div
            key={i}
            className={clsx(
              s.brick,
              brick < pin && s.lifted,
              brick === pin && s.pick,
            )}
          >
            {brick === pin && (
              <span className={s.num}>
                {ctor.stack} {UNITS_SHORT[ctor.units]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function platesWeights(ctor: Ctor<"plates">, height: number) {
  const plates = [...ctor.plates].reverse();

  return (
    <div className={s.platesMachine}>
      {Array.from({ length: ctor.sides }, (_, i) => (
        <div className={s.barbell} key={i} style={{ height }}>
          <div className={s.barSpacer} />
          {renderPlates(plates, `side-${i}`)}
          <div className={clsx(s.plate, s.innerPlate)} />
          <div className={s.platesSpacer} />
          <div className={s.platesHolder} />
          <div className={s.bar} />
        </div>
      ))}
    </div>
  );
}

function renderPlates(plates: number[], side: string) {
  return plates.map((weight, i) => (
    <div
      className={s.plate}
      key={`${side}-${i}`}
      style={{ height: plateHeight(weight) }}
    >
      <span className={clsx(s.plateLabel, s.num)}>{weight}</span>
    </div>
  ));
}

function plateHeight(weight: number): number {
  return Math.pow(Math.max(1.25, Math.min(45, weight)), 1 / 3) * 35;
}
