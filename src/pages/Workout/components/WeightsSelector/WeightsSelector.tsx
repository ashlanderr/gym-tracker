import type { Selector, WeightsSelectorProps } from "./types.ts";
import { MdCheck } from "react-icons/md";
import s from "./styles.module.scss";
import {
  HeaderButton,
  PageHeader,
  useModalStack,
} from "../../../../components";
import { WhySheet } from "../WhySheet";
import { INVENTORY_NOTE, INVENTORY_WHY } from "./constants.ts";
import {
  availableDumbbells,
  formatWeightUnits,
  snapWeightKg,
} from "../../../../domain";
import { WeightsVisualizer } from "../WeightsVisualizer";
import { InventorySection } from "../InventorySection";
import { DumbbellRanges } from "../DumbbellRanges";
import {
  type DumbbellWeights,
  type EquipmentType,
  isDumbbellWeights,
  type PerformanceWeights,
  type StepWeights,
  type WeightUnits,
} from "../../../../db";
import { EQUIPMENT_TRANSLATION, UNITS_SHORT } from "../../../constants.ts";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import {
  BARBELL_BASES,
  BARBELL_DEFAULT_BASE,
  DEFAULT_DUMBBELLS,
  DEFAULT_PLATES,
} from "../constants.ts";
import { assertNever, formatNumber } from "../../../../utils";

export function WeightsSelector({
  equipment,
  weights,
  previewKg,
  onCancel,
  onSubmit,
}: WeightsSelectorProps) {
  const { pushModal } = useModalStack();
  const [state, setState] = useState(() => initialWeights(equipment, weights));

  useEffect(() => {
    setState(initialWeights(equipment, weights));
  }, [equipment, weights]);

  const submitHandler = () => {
    onSubmit(state);
  };

  const isValid = validateWeights(equipment, state);
  const hasPreview =
    previewKg !== undefined && isValid && equipment !== "dumbbell";

  return (
    <div className={s.root}>
      <PageHeader
        kicker="Инвентарь"
        title={EQUIPMENT_TRANSLATION[equipment]}
        onBack={onCancel}
        right={
          <HeaderButton onClick={submitHandler} disabled={!isValid}>
            <MdCheck />
          </HeaderButton>
        }
      />
      <div className={s.body}>
        <InventorySection
          label="Зачем это"
          hint={[
            INVENTORY_NOTE,
            <button
              className={s.more}
              onClick={() => pushModal(WhySheet, INVENTORY_WHY)}
            >
              Подробнее
            </button>,
          ]}
        />
        {hasPreview && (
          <div className={s.preview}>
            <div className={s.previewLabel}>
              <span>Как собрать</span>
              <span className={s.previewWeight}>
                {formatWeightUnits(snapWeightKg(state, previewKg), state.units)}{" "}
                {UNITS_SHORT[state.units]}
              </span>
            </div>
            <WeightsVisualizer
              equipment={equipment}
              weights={state}
              weightKg={snapWeightKg(state, previewKg)}
            />
          </div>
        )}
        {unitsSelector(state.units, (units) =>
          setState(initialWeights(equipment, { units })),
        )}
        {buildBody(equipment, state, setState)}
      </div>
    </div>
  );
}

// A dumbbell inventory starts from the defaults, the others from the units
// alone, with every field to pick.
function initialWeights(
  equipment: EquipmentType,
  weights: PerformanceWeights | undefined,
): PerformanceWeights {
  const units = weights?.units ?? "kg";
  if (equipment === "dumbbell") {
    return isDumbbellWeights(weights) ? weights : DEFAULT_DUMBBELLS[units];
  }
  return weights && !isDumbbellWeights(weights) ? weights : { units };
}

function buildBody(
  equipment: EquipmentType,
  weights: PerformanceWeights,
  onChange: (weights: PerformanceWeights) => void,
) {
  if (isDumbbellWeights(weights)) {
    return dumbbellWeights(weights, onChange);
  }

  switch (equipment) {
    case "none":
    case "dumbbell":
      return null;

    case "barbell":
      return barbellWeights(weights, onChange);

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
  weights: StepWeights,
  onChange: (weights: StepWeights) => void,
) {
  const units = weights.units;
  const steps = Array.isArray(weights.steps) ? weights.steps : [];
  const defaultBase = BARBELL_DEFAULT_BASE[units];
  const base = weights.base;

  return (
    <>
      {selector({
        label: "Вес пустого грифа",
        hint: `Сколько весит гриф без блинов (стандартный ${formatNumber(defaultBase)} ${UNITS_SHORT[units]}).`,
        options: BARBELL_BASES[units],
        render: (value) => formatNumber(value),
        isSelected: (value) => value === base,
        toggle: (value) => onChange({ ...weights, base: value, count: 2 }),
      })}
      {selector({
        label: "Доступные блины",
        hint: "Укажите блины, которыми вы реально пользуетесь.",
        options: DEFAULT_PLATES[units],
        render: (value) => formatNumber(value),
        isSelected: (value) => steps.includes(value),
        toggle: (value) =>
          onChange({ ...weights, steps: toggleArray(steps, value) }),
      })}
    </>
  );
}

function dumbbellWeights(
  weights: DumbbellWeights,
  onChange: (weights: DumbbellWeights) => void,
) {
  return (
    <>
      {selector<1 | 2>({
        label: "Гантели",
        hint: "Для пары в подходах указывается суммарный вес.",
        options: [1, 2],
        render: (value) => (value === 1 ? "Одна" : "Пара"),
        isSelected: (value) => weights.count === value,
        toggle: (value) => onChange({ ...weights, count: value }),
        className: s.wide,
      })}
      <DumbbellRanges
        key={weights.units}
        weights={weights}
        onChange={onChange}
      />
    </>
  );
}

function machineWeights(
  weights: StepWeights,
  onChange: (weights: StepWeights) => void,
) {
  const stepOptions = [2.5, 5, 10, 15, 20];
  const base = weights.base;
  const steps = typeof weights.steps === "number" ? weights.steps : undefined;
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
        render: (value) => formatNumber(value),
        isSelected: (value) => count === value,
        toggle: (value) => onChange({ ...weights, count: value }),
      })}
      {selector({
        label: "Начальный вес",
        hint: "Вес первой плитки в стеке.",
        options: stepOptions,
        render: (value) => formatNumber(value),
        isSelected: (value) => base === value,
        toggle: (value) => onChange({ ...weights, base: value }),
      })}
      {selector({
        label: "Шаг веса плиток",
        hint: "Разница между соседними плитками.",
        options: stepOptions,
        render: (value) => formatNumber(value),
        isSelected: (value) => steps === value,
        toggle: (value) =>
          onChange({ ...weights, steps: value, additional: undefined }),
      })}
      {additionalOptions.length !== 0 &&
        selector({
          label: "Дополнительный шаг",
          hint: "Вес мелких гирек или ручек для точной настройки.",
          options: additionalOptions,
          render: (value) => formatNumber(value),
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
  weights: StepWeights,
  onChange: (weights: StepWeights) => void,
) {
  const units = weights.units;
  const steps = Array.isArray(weights.steps) ? weights.steps : [];
  const count = weights.count;

  return (
    <>
      {selector({
        label: "Количество держателей",
        hint: "Сколько мест для установки блинов на тренажёре.",
        options: [1, 2],
        render: (value) => formatNumber(value),
        isSelected: (value) => count === value,
        toggle: (value) => onChange({ ...weights, count: value }),
      })}
      {selector({
        label: "Доступные блины",
        hint: "Укажите блины, которыми вы реально пользуетесь.",
        options: DEFAULT_PLATES[units],
        render: (value) => formatNumber(value),
        isSelected: (value) => steps.includes(value),
        toggle: (value) =>
          onChange({ ...weights, steps: toggleArray(steps, value) }),
      })}
    </>
  );
}

function unitsSelector(
  selected: WeightUnits,
  onChange: (units: WeightUnits) => void,
) {
  return selector<WeightUnits>({
    label: "Единицы",
    hint: "Как подписаны веса в зале.",
    options: ["kg", "lbs"],
    render: (value) => UNITS_SHORT[value],
    isSelected: (value) => selected === value,
    toggle: (value) => {
      if (value !== selected) onChange(value);
    },
    className: clsx(s.wide, s.units),
  });
}

function selector<T extends string | number>(props: Selector<T>) {
  return (
    <InventorySection label={props.label} hint={props.hint}>
      <div className={s.chips}>
        {props.options.map((option) => (
          <button
            className={clsx(
              s.chip,
              props.className,
              props.isSelected(option) && s.selected,
            )}
            key={option}
            onClick={() => props.toggle(option)}
          >
            {props.render(option)}
          </button>
        ))}
      </div>
    </InventorySection>
  );
}

function validateWeights(
  equipment: EquipmentType,
  weights: PerformanceWeights,
): boolean {
  if (isDumbbellWeights(weights)) {
    return equipment === "dumbbell" && availableDumbbells(weights).length !== 0;
  }

  switch (equipment) {
    case "none":
      return true;

    case "dumbbell":
      return false;

    case "barbell":
      return (
        weights.base !== undefined &&
        Array.isArray(weights.steps) &&
        weights.steps.length !== 0 &&
        weights.additional === undefined &&
        weights.count === 2
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
