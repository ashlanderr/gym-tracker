import type { Selector, WeightsSelectorProps } from "./types.ts";
import { MdArrowBack, MdCheck } from "react-icons/md";
import s from "./styles.module.scss";
import {
  DEFAULT_WEIGHT_UNITS,
  type EquipmentType,
  minBy,
  type PerformanceWeights,
  type WeightUnits,
} from "../../../../db";
import { UNITS_TRANSLATION } from "../../../constants.ts";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import {
  BARBELL_BASES,
  BARBELL_DEFAULT_BASE,
  DEFAULT_PLATES,
} from "../constants.ts";

export function WeightSelector2({
  equipment,
  weights,
  onCancel,
  onSubmit,
}: WeightsSelectorProps) {
  const [state, setState] = useState(weights);

  useEffect(() => {
    setState(weights);
  }, [weights]);

  const submitHandler = () => {
    onSubmit(state);
  };

  return (
    <div className={s.root}>
      <div className={s.toolbar}>
        <button className={s.toolbarButton} onClick={onCancel}>
          <MdArrowBack />
        </button>
        <div className={s.pageTitle}>Настройка весов</div>
        <button className={s.toolbarButton} onClick={submitHandler}>
          <MdCheck />
        </button>
      </div>
      <div className={s.body}>{buildBody(equipment, state, setState)}</div>
    </div>
  );
}

function buildBody(
  equipment: EquipmentType,
  weights: PerformanceWeights | undefined,
  onChange: (weights: PerformanceWeights | undefined) => void,
) {
  switch (equipment) {
    case "none":
      return null;

    case "barbell":
      return barbellWeights(weights, onChange);

    case "dumbbell":
      return dumbbellWeights(weights, onChange);

    case "machine":
      return machineWeights(weights, onChange);

    case "plates":
      return platesWeights(weights, onChange);
  }

  return null;
}

function barbellWeights(
  weights: PerformanceWeights | undefined,
  onChange: (weights: PerformanceWeights | undefined) => void,
) {
  const units = weights?.units ?? DEFAULT_WEIGHT_UNITS;
  const unitsStr = UNITS_TRANSLATION[units];
  const steps = Array.isArray(weights?.steps) ? weights.steps : [];
  const defaultBase = BARBELL_DEFAULT_BASE[units];
  const base = weights?.base;
  const minStep = minBy(steps, (a, b) => a - b);

  return (
    <>
      {unitsSelector(weights, onChange)}
      {selector({
        label: "Вес пустого грифа",
        hint: `Сколько весит гриф без блинов (стандартный ${defaultBase} ${unitsStr}).`,
        example:
          base !== undefined
            ? `В записях добавляйте вес грифа (${base} ${unitsStr}) к весу блинов.`
            : undefined,
        options: BARBELL_BASES[units],
        render: (value) => value.toString(),
        isSelected: (value) => value === base,
        toggle: (value) =>
          onChange(weights && { ...weights, base: value, count: 2 }),
      })}
      {selector({
        label: "Доступные блины",
        hint: "Укажите блины, которыми вы реально пользуетесь.",
        example: minStep
          ? `Минимальный шаг = ${minStep * 2} ${unitsStr} (${minStep} ${unitsStr} x 2).`
          : undefined,
        options: DEFAULT_PLATES[units],
        render: (value) => value.toString(),
        isSelected: (value) => steps.includes(value),
        toggle: (value) =>
          onChange(
            weights && {
              ...weights,
              steps: steps.includes(value)
                ? steps.filter((s) => s !== value)
                : [...steps, value],
            },
          ),
      })}
    </>
  );
}

function dumbbellWeights(
  weights: PerformanceWeights | undefined,
  onChange: (weights: PerformanceWeights | undefined) => void,
) {
  const units = weights?.units ?? DEFAULT_WEIGHT_UNITS;
  const unitsStr = UNITS_TRANSLATION[units];
  const steps = typeof weights?.steps === "number" ? weights.steps : 1;
  const count = weights?.count ?? 1;

  return (
    <>
      {unitsSelector(weights, onChange)}
      {selector({
        label: "Количество гантелей",
        hint: "Сколько используется одновременно.",
        example: `${steps * 3} ${unitsStr} x ${count} = ${steps * 3 * count} ${unitsStr}`,
        options: [1, 2],
        render: (value) => value.toString(),
        isSelected: (value) => count === value,
        toggle: (value) => onChange(weights && { ...weights, count: value }),
      })}
      {selector({
        label: "Шаг веса гантелей",
        hint: "Разница между соседними весами.",
        example: progressionExample(units, 0, steps),
        options: [1, 2, 2.5, 5],
        render: (value) => value.toString(),
        isSelected: (value) => steps === value,
        toggle: (value) => onChange(weights && { ...weights, steps: value }),
      })}
    </>
  );
}

function machineWeights(
  weights: PerformanceWeights | undefined,
  onChange: (weights: PerformanceWeights | undefined) => void,
) {
  const stepOptions = [2.5, 5, 10, 15, 20];
  const units = weights?.units ?? DEFAULT_WEIGHT_UNITS;
  const unitsStr = UNITS_TRANSLATION[units];
  const base = weights?.base ?? 0;
  const steps = typeof weights?.steps === "number" ? weights.steps : undefined;
  const additional = weights?.additional ?? 0;
  const count = weights?.count ?? 1;
  const additionalOptions =
    steps !== undefined ? stepOptions.filter((s) => s < steps) : [];

  return (
    <>
      {unitsSelector(weights, onChange)}
      {selector({
        label: "Количество блоков",
        hint: "Сколько стеков используется одновременно.",
        example:
          steps !== undefined
            ? `${base + steps * 2} ${unitsStr} x ${count} = ${(base + steps * 2) * count} ${unitsStr}`
            : undefined,
        options: [1, 2],
        render: (value) => value.toString(),
        isSelected: (value) => count === value,
        toggle: (value) => onChange(weights && { ...weights, count: value }),
      })}
      {selector({
        label: "Начальный вес",
        hint: "Вес первой плитки в стеке.",
        example: "Отсчёт всегда начинается с этого веса.",
        options: stepOptions,
        render: (value) => value.toString(),
        isSelected: (value) => base === value,
        toggle: (value) => onChange(weights && { ...weights, base: value }),
      })}
      {selector({
        label: "Шаг веса плиток",
        hint: "Разница между соседними плитками.",
        example: progressionExample(units, base, steps),
        options: stepOptions,
        render: (value) => value.toString(),
        isSelected: (value) => steps === value,
        toggle: (value) =>
          onChange(
            weights && { ...weights, steps: value, additional: undefined },
          ),
      })}
      {additionalOptions.length !== 0 &&
        selector({
          label: "Дополнительный шаг",
          hint: "Вес мелких гирек или ручек для точной настройки.",
          example: additional
            ? progressionExample(units, base, additional)
            : undefined,
          options: additionalOptions,
          render: (value) => value.toString(),
          isSelected: (value) => additional === value,
          toggle: (value) =>
            onChange(
              weights && {
                ...weights,
                additional: value !== additional ? value : undefined,
              },
            ),
        })}
    </>
  );
}

function platesWeights(
  weights: PerformanceWeights | undefined,
  onChange: (weights: PerformanceWeights | undefined) => void,
) {
  const units = weights?.units ?? DEFAULT_WEIGHT_UNITS;
  const unitsStr = UNITS_TRANSLATION[units];
  const steps = Array.isArray(weights?.steps) ? weights.steps : [];
  const minStep = minBy(steps, (a, b) => a - b);
  const count = weights?.count ?? 1;

  return (
    <>
      {unitsSelector(weights, onChange)}
      {selector({
        label: "Количество держателей",
        hint: "Сколько мест для установки блинов на тренажёре.",
        example: "В записях указывается суммарный вес всех блинов.",
        options: [1, 2],
        render: (value) => value.toString(),
        isSelected: (value) => count === value,
        toggle: (value) => onChange(weights && { ...weights, count: value }),
      })}
      {selector({
        label: "Доступные блины",
        hint: "Укажите блины, которыми вы реально пользуетесь.",
        example: minStep
          ? `Минимальный шаг = ${minStep * count} ${unitsStr} (${minStep} ${unitsStr} x ${count}).`
          : undefined,
        options: DEFAULT_PLATES[units],
        render: (value) => value.toString(),
        isSelected: (value) => steps.includes(value),
        toggle: (value) =>
          onChange(
            weights && {
              ...weights,
              steps: steps.includes(value)
                ? steps.filter((s) => s !== value)
                : [...steps, value],
            },
          ),
      })}
    </>
  );
}

function progressionExample(
  units: WeightUnits | undefined,
  base: number | undefined,
  steps: number | number[] | undefined,
) {
  if (typeof steps !== "number") return undefined;
  base = base ?? steps;
  const unitStr = UNITS_TRANSLATION[units ?? DEFAULT_WEIGHT_UNITS];
  const a = base;
  const b = base + steps;
  const c = base + steps * 2;
  return `${a} ${unitStr} ➜ ${b} ${unitStr} ➜ ${c} ${unitStr}`;
}

function unitsSelector(
  weights: PerformanceWeights | undefined,
  onChange: (weights: PerformanceWeights | undefined) => void,
) {
  const selected = weights?.units ?? DEFAULT_WEIGHT_UNITS;

  return selector<WeightUnits>({
    label: "Единицы измерения",
    hint: "Система, в которой подписаны веса в зале.",
    options: ["kg", "lbs"],
    render: (value) => UNITS_TRANSLATION[value],
    isSelected: (value) => selected === value,
    toggle: (value) => onChange({ units: value }),
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
      {/*{props.example && <div className={s.example}>{props.example}</div>}*/}
    </>
  );
}
