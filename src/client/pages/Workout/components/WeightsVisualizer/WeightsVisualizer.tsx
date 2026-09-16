import type { Exercise, Gym } from "../../../../db";
import s from "./styles.module.scss";
import { clsx } from "clsx";
import { computeWeights, type WeightsConstructor } from "../../../../domain";
import { UNITS_SHORT } from "../../../constants.ts";

export interface WeightsVisualizerProps {
  exercise: Exercise;
  gym: Gym;
  weightKg: number;
}

const STACK_LIFTED_LIMIT = 6;
const STACK_REST = 4;

export function WeightsVisualizer({
  exercise,
  gym,
  weightKg,
}: WeightsVisualizerProps) {
  const ctor = computeWeights(exercise, gym, weightKg);
  if (!ctor) return null;

  switch (ctor.type) {
    case "barbell":
      return barbellWeights(ctor);

    case "dumbbell":
      return dumbbellWeights(ctor);

    case "stack":
      return stackWeights(ctor, gym.stacks[exercise.id]?.step ?? 1);

    case "plates":
      return platesWeights(ctor);
  }
}

type Ctor<T extends WeightsConstructor["type"]> = Extract<
  WeightsConstructor,
  { type: T }
>;

function barbellWeights(ctor: Ctor<"barbell">) {
  return (
    <div className={s.barbell}>
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

function stackWeights(ctor: Ctor<"stack">, step: number) {
  const lifted = Math.min(
    STACK_LIFTED_LIMIT,
    Math.max(0, Math.round(ctor.stack / step) - 1),
  );

  return (
    <div className={s.stack}>
      {ctor.additional !== 0 && (
        <div className={s.addChip}>
          <span className={s.num}>+{ctor.additional}</span>
        </div>
      )}
      <div className={s.stackRod} />
      {Array.from({ length: lifted }, (_, i) => (
        <div className={clsx(s.brick, s.lifted)} key={`lifted-${i}`} />
      ))}
      <div className={clsx(s.brick, s.pick)}>
        <span className={s.num}>
          {ctor.stack} {UNITS_SHORT[ctor.units]}
        </span>
      </div>
      {Array.from({ length: STACK_REST }, (_, i) => (
        <div className={s.brick} key={`rest-${i}`} />
      ))}
    </div>
  );
}

function platesWeights(ctor: Ctor<"plates">) {
  const plates = [...ctor.plates].reverse();

  return (
    <div className={s.platesMachine}>
      {Array.from({ length: ctor.sides }, (_, i) => (
        <div className={s.barbell} key={i}>
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
