import type { Selector, WeightsSelectorProps } from "./types.ts";
import { MdArrowBack, MdCheck } from "react-icons/md";
import s from "./styles.module.scss";
import {
  DEFAULT_WEIGHT_UNITS,
  type DumbbellSet,
  type Gym,
  type StackWeights,
  type WeightUnits,
} from "../../../../db";
import { UNITS_TRANSLATION } from "../../../constants.ts";
import { useState } from "react";
import { clsx } from "clsx";
import {
  BARBELL_BASES,
  DEFAULT_PLATES,
  DUMBBELL_MAX,
  DUMBBELL_MIN,
  DUMBBELL_STEPS,
  STACK_ADDITIONAL,
  STACK_BASES,
  STACK_STEPS,
} from "../constants.ts";

type Draft<T> = { [K in keyof T]?: T[K] };

export function WeightsSelector({
  exercise,
  gym,
  onCancel,
  onSubmit,
}: WeightsSelectorProps) {
  const [plates, setPlates] = useState(gym.plates);
  const [bars, setBars] = useState(gym.bars);
  // Only the first dumbbell set is editable here, the model supports several.
  const [dumbbells, setDumbbells] = useState<Draft<DumbbellSet>>(
    () => gym.dumbbells.at(0) ?? { units: DEFAULT_WEIGHT_UNITS },
  );
  const [stack, setStack] = useState<Draft<StackWeights>>(
    () => gym.stacks[exercise.id] ?? { units: DEFAULT_WEIGHT_UNITS },
  );

  const buildGym = (): Gym | null => {
    switch (exercise.load.type) {
      case "none":
        return gym;

      case "barbell":
        return plates.items.length !== 0 && bars.items.length !== 0
          ? { ...gym, plates, bars }
          : null;

      case "plates":
        return plates.items.length !== 0 ? { ...gym, plates } : null;

      case "dumbbell": {
        const { units, min, max, step } = dumbbells;
        if (!units || min === undefined || max === undefined) return null;
        if (step === undefined || min > max) return null;
        const set = { units, min, max, step };
        return { ...gym, dumbbells: [set, ...gym.dumbbells.slice(1)] };
      }

      case "stack": {
        const { units, base, step, additional } = stack;
        if (!units || base === undefined || step === undefined) return null;
        const weights = { units, base, step, additional };
        return { ...gym, stacks: { ...gym.stacks, [exercise.id]: weights } };
      }
    }
  };

  const newGym = buildGym();

  const submitHandler = () => {
    if (newGym) onSubmit(newGym);
  };

  const renderBody = () => {
    switch (exercise.load.type) {
      case "none":
        return null;

      case "barbell":
        return (
          <>
            {unitsSelector(plates.units, (units) => {
              setPlates({ units, items: [] });
              setBars({ units, items: [] });
            })}
            {selector({
              label: "Грифы",
              hint: "Все грифы в зале. Для веса берётся самый тяжёлый, который подходит.",
              options: BARBELL_BASES[bars.units],
              render: (value) => value.toString(),
              isSelected: (value) => bars.items.includes(value),
              toggle: (value) =>
                setBars({ ...bars, items: toggle(bars.items, value) }),
            })}
            {platesSelector(plates, setPlates)}
          </>
        );

      case "plates":
        return (
          <>
            {unitsSelector(plates.units, (units) =>
              setPlates({ units, items: [] }),
            )}
            {platesSelector(plates, setPlates)}
          </>
        );

      case "dumbbell":
        return (
          <>
            {unitsSelector(dumbbells.units, (units) => setDumbbells({ units }))}
            {selector({
              label: "Самая лёгкая гантель",
              options: DUMBBELL_MIN,
              render: (value) => value.toString(),
              isSelected: (value) => dumbbells.min === value,
              toggle: (min) => setDumbbells({ ...dumbbells, min }),
            })}
            {selector({
              label: "Самая тяжёлая гантель",
              options: DUMBBELL_MAX,
              render: (value) => value.toString(),
              isSelected: (value) => dumbbells.max === value,
              toggle: (max) => setDumbbells({ ...dumbbells, max }),
            })}
            {selector({
              label: "Шаг веса гантелей",
              hint: "Разница между соседними весами.",
              options: DUMBBELL_STEPS,
              render: (value) => value.toString(),
              isSelected: (value) => dumbbells.step === value,
              toggle: (step) => setDumbbells({ ...dumbbells, step }),
            })}
          </>
        );

      case "stack":
        return (
          <>
            {unitsSelector(stack.units, (units) => setStack({ units }))}
            {selector({
              label: "Начальный вес",
              hint: "Вес, который поднимается без плиток.",
              options: STACK_BASES,
              render: (value) => value.toString(),
              isSelected: (value) => stack.base === value,
              toggle: (base) => setStack({ ...stack, base }),
            })}
            {selector({
              label: "Шаг веса плиток",
              hint: "Разница между соседними плитками.",
              options: STACK_STEPS,
              render: (value) => value.toString(),
              isSelected: (value) => stack.step === value,
              toggle: (step) => setStack({ ...stack, step }),
            })}
            {selector({
              label: "Добавочный вес",
              hint: "Мелкая плитка или грузик для точной настройки.",
              options: STACK_ADDITIONAL,
              render: (value) => value.toString(),
              isSelected: (value) => stack.additional === value,
              toggle: (additional) =>
                setStack({
                  ...stack,
                  additional:
                    additional !== stack.additional ? additional : undefined,
                }),
            })}
          </>
        );
    }
  };

  return (
    <div className={s.root}>
      <div className={s.toolbar}>
        <button className={s.toolbarButton} onClick={onCancel}>
          <MdArrowBack />
        </button>
        <div className={s.pageTitle}>Мой инвентарь</div>
        <button
          className={s.toolbarButton}
          onClick={submitHandler}
          disabled={!newGym}
        >
          <MdCheck />
        </button>
      </div>
      <div className={s.body}>{renderBody()}</div>
    </div>
  );
}

function platesSelector(
  plates: Gym["plates"],
  onChange: (plates: Gym["plates"]) => void,
) {
  return selector({
    label: "Блины",
    hint: "Все блины в зале. Они общие для всех упражнений.",
    options: DEFAULT_PLATES[plates.units],
    render: (value) => value.toString(),
    isSelected: (value) => plates.items.includes(value),
    toggle: (value) =>
      onChange({ ...plates, items: toggle(plates.items, value) }),
  });
}

function unitsSelector(
  selected: WeightUnits | undefined,
  onChange: (units: WeightUnits) => void,
) {
  return selector<WeightUnits>({
    label: "Единицы измерения",
    hint: "Система, в которой подписаны веса в зале.",
    options: ["kg", "lbs"],
    render: (value) => UNITS_TRANSLATION[value],
    isSelected: (value) => selected === value,
    toggle: (value) => value !== selected && onChange(value),
  });
}

function selector<T extends string | number>(props: Selector<T>) {
  return (
    <>
      <div className={s.label}>{props.label}</div>
      {props.hint && <div className={s.hint}>{props.hint}</div>}
      <div className={s.chips}>
        {props.options.map((option) => (
          <button
            className={clsx(s.chip, props.isSelected(option) && s.selected)}
            key={option}
            onClick={() => props.toggle(option)}
          >
            {props.render(option)}
          </button>
        ))}
      </div>
    </>
  );
}

function toggle<T>(array: T[], value: T): T[] {
  return array.includes(value)
    ? array.filter((v) => v !== value)
    : [...array, value];
}
