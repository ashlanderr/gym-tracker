import type { Exercise, Gym } from "../../../../db";
import s from "./styles.module.scss";
import { clsx } from "clsx";
import { RiPlayList2Fill } from "react-icons/ri";
import { LuCircleGauge } from "react-icons/lu";
import { computeWeights, type WeightsConstructor } from "../../../../domain";

export interface WeightsVisualizerProps {
  exercise: Exercise;
  gym: Gym;
  weightKg: number;
}

export function WeightsVisualizer({
  exercise,
  gym,
  weightKg,
}: WeightsVisualizerProps) {
  const ctor = computeWeights(exercise, gym, weightKg);
  if (!ctor) return null;

  const isInvalid = !isSameWeight(ctor.totalKg, weightKg);

  switch (ctor.type) {
    case "barbell":
      return barbellWeights(ctor, isInvalid);

    case "dumbbell":
      return dumbbellWeights(ctor, isInvalid);

    case "stack":
      return stackWeights(ctor);

    case "plates":
      return platesWeights(ctor, isInvalid);
  }
}

type Ctor<T extends WeightsConstructor["type"]> = Extract<
  WeightsConstructor,
  { type: T }
>;

function barbellWeights(ctor: Ctor<"barbell">, isInvalid: boolean) {
  const left = renderPlates([...ctor.plates].reverse(), "left");
  const right = renderPlates(ctor.plates, "right");

  return (
    <div className={clsx(s.barbell, isInvalid && s.invalid)}>
      <div className={s.barSpacer} />
      {left}
      <div className={clsx(s.plate, s.innerPlate)} />
      <div className={s.barCenter} />
      <div className={clsx(s.plate, s.innerPlate)} />
      {right}
      <div className={s.barSpacer} />
      <div className={s.bar}>
        <div className={s.barLabel}>{ctor.bar}</div>
      </div>
    </div>
  );
}

function dumbbellWeights(ctor: Ctor<"dumbbell">, isInvalid: boolean) {
  return (
    <div className={clsx(s.dumbbells, isInvalid && s.invalid)}>
      {Array.from({ length: ctor.count }, (_, i) => (
        <div className={s.dumbbell} key={i}>
          <div className={s.barbell}>
            <div className={s.barSpacer} />
            <div className={s.plate} style={{ height: 50 }} />
            <div className={s.plate} style={{ height: 90 }} />
            <div className={clsx(s.plate, s.innerPlate)} />
            <div className={s.barCenter} />
            <div className={clsx(s.plate, s.innerPlate)} />
            <div className={s.plate} style={{ height: 90 }} />
            <div className={s.plate} style={{ height: 50 }} />
            <div className={s.barSpacer} />
            <div className={s.bar}>
              <div className={s.dumbbellLabel}>{ctor.dumbbell}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function stackWeights(ctor: Ctor<"stack">) {
  return (
    <div className={s.machineWeights}>
      <div className={s.machineWeight}>
        <RiPlayList2Fill />
        <span>{ctor.stack}</span>
      </div>
      <div className={s.machineWeight}>
        <LuCircleGauge />
        <span>{ctor.additional}</span>
      </div>
    </div>
  );
}

function platesWeights(ctor: Ctor<"plates">, isInvalid: boolean) {
  const plates = renderPlates([...ctor.plates].reverse(), "side");

  return (
    <div className={clsx(s.platesMachine, isInvalid && s.invalid)}>
      {Array.from({ length: ctor.sides }, (_, i) => (
        <div className={s.barbell} key={i}>
          <div className={s.barSpacer} />
          {plates}
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
      <div className={s.plateLabel}>{weight}</div>
    </div>
  ));
}

function plateHeight(weight: number): number {
  return Math.pow(Math.max(1.25, Math.min(45, weight)), 1 / 3) * 35;
}

function isSameWeight(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-3;
}
