import s from "./styles.module.scss";
import { clsx } from "clsx";
import type { WeightList, WeightUnits } from "../../../../db";
import { UNITS_TRANSLATION } from "../../../constants.ts";
import {
  BARBELL_BASES,
  DEFAULT_PLATES,
  DUMBBELL_MAX,
  DUMBBELL_MIN,
  DUMBBELL_STEPS,
  STACK_ADDITIONAL,
  STACK_BASES,
  STACK_MAX,
  STACK_STEPS,
  TYPICAL_BARS,
  TYPICAL_PLATES,
} from "../constants.ts";
import type { ChipRow, InventoryFieldsProps } from "./types.ts";

export function InventoryFields({
  exercise,
  draft,
  onChange,
}: InventoryFieldsProps) {
  const { plates, bars, dumbbells, stack } = draft;

  switch (exercise.load.type) {
    case "none":
      return null;

    case "barbell":
      return (
        <>
          {unitsRow(plates.units, (units) =>
            onChange({
              ...draft,
              plates: TYPICAL_PLATES[units],
              bars: TYPICAL_BARS[units],
            }),
          )}
          {chipRow({
            label: "Грифы",
            hint: "Отметь и лёгкие, если есть: с них проще начать.",
            options: BARBELL_BASES[bars.units],
            render: formatNumber,
            isSelected: (value) => bars.items.includes(value),
            toggle: (value) =>
              onChange({
                ...draft,
                bars: { ...bars, items: toggle(bars.items, value) },
              }),
          })}
          {platesRow(plates, (plates) => onChange({ ...draft, plates }))}
        </>
      );

    case "plates":
      return (
        <>
          {unitsRow(plates.units, (units) =>
            onChange({ ...draft, plates: TYPICAL_PLATES[units] }),
          )}
          {platesRow(plates, (plates) => onChange({ ...draft, plates }))}
        </>
      );

    case "dumbbell":
      return (
        <>
          {unitsRow(dumbbells.units, (units) =>
            onChange({ ...draft, dumbbells: { units } }),
          )}
          {chipRow({
            label: "Самая лёгкая",
            options: DUMBBELL_MIN[dumbbells.units],
            render: formatNumber,
            isSelected: (value) => dumbbells.min === value,
            toggle: (min) =>
              onChange({ ...draft, dumbbells: { ...dumbbells, min } }),
          })}
          {chipRow({
            label: "Самая тяжёлая",
            options: DUMBBELL_MAX[dumbbells.units],
            render: formatNumber,
            isSelected: (value) => dumbbells.max === value,
            toggle: (max) =>
              onChange({ ...draft, dumbbells: { ...dumbbells, max } }),
          })}
          {chipRow({
            label: "Шаг",
            hint: "Разница между соседними весами.",
            options: DUMBBELL_STEPS[dumbbells.units],
            render: formatNumber,
            isSelected: (value) => dumbbells.step === value,
            toggle: (step) =>
              onChange({ ...draft, dumbbells: { ...dumbbells, step } }),
          })}
        </>
      );

    case "stack":
      return (
        <>
          {unitsRow(stack.units, (units) =>
            onChange({ ...draft, stack: { units } }),
          )}
          {chipRow({
            label: "Начальный вес",
            hint: "Вес, который поднимается без плиток.",
            options: STACK_BASES[stack.units],
            render: formatNumber,
            isSelected: (value) => stack.base === value,
            toggle: (base) => onChange({ ...draft, stack: { ...stack, base } }),
          })}
          {chipRow({
            label: "Шаг веса плиток",
            hint: "Разница между соседними плитками.",
            options: STACK_STEPS[stack.units],
            render: formatNumber,
            isSelected: (value) => stack.step === value,
            toggle: (step) => onChange({ ...draft, stack: { ...stack, step } }),
          })}
          {chipRow({
            label: "Самый большой вес",
            hint: "Вес, когда выбраны все плитки.",
            options: STACK_MAX[stack.units],
            render: formatNumber,
            isSelected: (value) => stack.max === value,
            toggle: (max) => onChange({ ...draft, stack: { ...stack, max } }),
          })}
          {chipRow({
            label: "Добавочный вес",
            hint: "Шаг точной настройки: гирька или крутилка. Доступны все кратные ему веса меньше шага плиток.",
            options: STACK_ADDITIONAL[stack.units],
            render: formatNumber,
            isSelected: (value) => stack.additional === value,
            toggle: (additional) =>
              onChange({
                ...draft,
                stack: {
                  ...stack,
                  additional:
                    additional !== stack.additional ? additional : undefined,
                },
              }),
          })}
        </>
      );
  }
}

function platesRow(plates: WeightList, onChange: (plates: WeightList) => void) {
  return chipRow({
    label: "Блины",
    hint: "Все блины в зале. Они общие для всех упражнений.",
    options: DEFAULT_PLATES[plates.units],
    render: formatNumber,
    isSelected: (value) => plates.items.includes(value),
    toggle: (value) =>
      onChange({ ...plates, items: toggle(plates.items, value) }),
  });
}

function unitsRow(
  selected: WeightUnits,
  onChange: (units: WeightUnits) => void,
) {
  return chipRow<WeightUnits>({
    label: "Единицы измерения",
    hint: "Система, в которой подписаны веса в зале.",
    options: ["kg", "lb"],
    render: (value) => UNITS_TRANSLATION[value],
    isSelected: (value) => selected === value,
    toggle: (value) => value !== selected && onChange(value),
  });
}

function chipRow<T extends string | number>(row: ChipRow<T>) {
  return (
    <div className={s.row}>
      <div className={s.label}>{row.label}</div>
      {row.hint && <div className={s.hint}>{row.hint}</div>}
      <div className={s.chips}>
        {row.options.map((option) => (
          <button
            className={clsx(s.chip, row.isSelected(option) && s.selected)}
            key={option}
            onClick={() => row.toggle(option)}
          >
            {row.render(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

function formatNumber(value: number): string {
  return value.toString().replace(".", ",");
}

function toggle<T>(array: T[], value: T): T[] {
  return array.includes(value)
    ? array.filter((v) => v !== value)
    : [...array, value];
}
