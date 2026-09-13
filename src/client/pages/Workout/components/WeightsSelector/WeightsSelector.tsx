import type { Selector, WeightsSelectorProps } from "./types.ts";
import { MdArrowBack, MdCheck } from "react-icons/md";
import s from "./styles.module.scss";
import {
  type EquipmentType,
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
import { assertNever } from "../../../../utils";

export function WeightsSelector({
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
        <button
          className={s.toolbarButton}
          onClick={submitHandler}
          disabled={!validateWeights(equipment, state)}
        >
          <MdCheck />
        </button>
      </div>
      <div className={s.body}>
        {unitsSelector(state, setState)}
        {state && buildBody(equipment, state, setState)}
      </div>
    </div>
  );
}

function buildBody(
  equipment: EquipmentType,
  weights: PerformanceWeights,
  onChange: (weights: PerformanceWeights) => void,
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

    default:
      assertNever(equipment);
  }
}

function toggleArray<T>(array: T[], value: T): T[] {
  return array.includes(value)
    ? array.filter((s) => s !== value)
    : [...array, value];
}

function barbellWeights(
  weights: PerformanceWeights,
  onChange: (weights: PerformanceWeights) => void,
) {
  const units = weights.units;
  const unitsStr = UNITS_TRANSLATION[units];
  const steps = Array.isArray(weights.steps) ? weights.steps : [];
  const defaultBase = BARBELL_DEFAULT_BASE[units];
  const base = weights.base;

  return (
    <>
      {selector({
        label: "Вес пустого грифа",
        hint: `Сколько весит гриф без блинов (стандартный ${defaultBase} ${unitsStr}).`,
        options: BARBELL_BASES[units],
        render: (value) => value.toString(),
        isSelected: (value) => value === base,
        toggle: (value) => onChange({ ...weights, base: value, count: 2 }),
      })}
      {selector({
        label: "Доступные блины",
        hint: "Укажите блины, которыми вы реально пользуетесь.",
        options: DEFAULT_PLATES[units],
        render: (value) => value.toString(),
        isSelected: (value) => steps.includes(value),
        toggle: (value) =>
          onChange({ ...weights, steps: toggleArray(steps, value) }),
      })}
    </>
  );
}

function dumbbellWeights(
  weights: PerformanceWeights,
  onChange: (weights: PerformanceWeights) => void,
) {
  const steps = typeof weights.steps === "number" ? weights.steps : undefined;
  const count = weights.count;

  return (
    <>
      {selector({
        label: "Количество гантелей",
        hint: "Сколько используется одновременно.",
        options: [1, 2],
        render: (value) => value.toString(),
        isSelected: (value) => count === value,
        toggle: (value) => onChange({ ...weights, count: value }),
      })}
      {selector({
        label: "Шаг веса гантелей",
        hint: "Разница между соседними весами.",
        options: [1, 2, 2.5, 5],
        render: (value) => value.toString(),
        isSelected: (value) => steps === value,
        toggle: (value) => onChange({ ...weights, steps: value }),
      })}
    </>
  );
}

function machineWeights(
  weights: PerformanceWeights,
  onChange: (weights: PerformanceWeights) => void,
) {
  const stepOptions = [2.5, 5, 10, 15, 20];
  const base = weights.base;
  const steps = typeof weights?.steps === "number" ? weights.steps : undefined;
  const additional = weights.additional;
  const count = weights.count;
  const additionalOptions =
    steps !== undefined ? stepOptions.filter((s) => s < steps) : [];

  return (
    <>
      {selector({
        label: "Количество блоков",
        hint: "Сколько стеков используется одновременно.",
        options: [1, 2],
        render: (value) => value.toString(),
        isSelected: (value) => count === value,
        toggle: (value) => onChange({ ...weights, count: value }),
      })}
      {selector({
        label: "Начальный вес",
        hint: "Вес первой плитки в стеке.",
        options: stepOptions,
        render: (value) => value.toString(),
        isSelected: (value) => base === value,
        toggle: (value) => onChange({ ...weights, base: value }),
      })}
      {selector({
        label: "Шаг веса плиток",
        hint: "Разница между соседними плитками.",
        options: stepOptions,
        render: (value) => value.toString(),
        isSelected: (value) => steps === value,
        toggle: (value) =>
          onChange({ ...weights, steps: value, additional: undefined }),
      })}
      {additionalOptions.length !== 0 &&
        selector({
          label: "Дополнительный шаг",
          hint: "Вес мелких гирек или ручек для точной настройки.",
          options: additionalOptions,
          render: (value) => value.toString(),
          isSelected: (value) => additional === value,
          toggle: (value) =>
            onChange({
              ...weights,
              additional: value !== additional ? value : undefined,
            }),
        })}
    </>
  );
}

function platesWeights(
  weights: PerformanceWeights,
  onChange: (weights: PerformanceWeights) => void,
) {
  const units = weights.units;
  const steps = Array.isArray(weights?.steps) ? weights.steps : [];
  const count = weights?.count;

  return (
    <>
      {selector({
        label: "Количество держателей",
        hint: "Сколько мест для установки блинов на тренажёре.",
        options: [1, 2],
        render: (value) => value.toString(),
        isSelected: (value) => count === value,
        toggle: (value) => onChange({ ...weights, count: value }),
      })}
      {selector({
        label: "Доступные блины",
        hint: "Укажите блины, которыми вы реально пользуетесь.",
        options: DEFAULT_PLATES[units],
        render: (value) => value.toString(),
        isSelected: (value) => steps.includes(value),
        toggle: (value) =>
          onChange({ ...weights, steps: toggleArray(steps, value) }),
      })}
    </>
  );
}

function unitsSelector(
  weights: PerformanceWeights | undefined,
  onChange: (weights: PerformanceWeights | undefined) => void,
) {
  const selected = weights?.units ?? "";

  return selector<WeightUnits | "">({
    label: "Единицы измерения",
    hint: "Система, в которой подписаны веса в зале.",
    options: ["", "kg", "lbs"],
    render: (value) => (value ? UNITS_TRANSLATION[value] : "ВЫКЛ"),
    isSelected: (value) => selected === value,
    toggle: (value) => onChange(value ? { units: value } : undefined),
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

function validateWeights(
  equipment: EquipmentType,
  weights: PerformanceWeights | undefined,
): boolean {
  if (!weights) return true;

  switch (equipment) {
    case "none":
      return true;

    case "barbell":
      return (
        weights.base !== undefined &&
        Array.isArray(weights.steps) &&
        weights.steps.length !== 0 &&
        weights.additional === undefined &&
        weights.count === 2
      );

    case "dumbbell":
      return (
        weights.base === undefined &&
        typeof weights.steps === "number" &&
        weights.additional === undefined &&
        weights.count !== undefined
      );

    case "machine":
      return (
        weights.base !== undefined &&
        typeof weights.steps === "number" &&
        weights.count !== undefined
      );

    case "plates":
      return (
        weights.base === undefined &&
        Array.isArray(weights.steps) &&
        weights.steps.length !== 0 &&
        weights.additional === undefined &&
        weights.count !== undefined
      );

    default:
      assertNever(equipment);
  }
}
