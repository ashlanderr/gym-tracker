import type { WeightsSelectorProps } from "./types.ts";
import s from "./styles.module.scss";
import {
  DEFAULT_AUTO_WEIGHTS,
  DEFAULT_WEIGHT_UNITS,
  type PerformanceWeights,
} from "../../../../db";
import { clsx } from "clsx";
import React from "react";
import { convertToAutoWeights } from "../utils.ts";
import { BARBELL_BASES, DEFAULT_PLATES } from "../constants.ts";
import { EQUIPMENT_TRANSLATION } from "../../../constants.ts";

export function WeightsSelector({
  equipment,
  value,
  onChange,
}: WeightsSelectorProps) {
  const normalizedValue = value ?? { units: DEFAULT_WEIGHT_UNITS };

  if (value?.auto) {
    return autoWeights(normalizedValue, onChange);
  }

  switch (equipment) {
    case "barbell":
      return barbellWeights(normalizedValue, onChange);
    case "dumbbell":
      return dumbbellWeights(normalizedValue, onChange);
    case "machine":
      return machineWeights(normalizedValue, onChange);
    case "plates":
      return platesWeights(normalizedValue, onChange);
    default:
      return null;
  }
}

function autoWeights(
  value: PerformanceWeights,
  onChange: (value: PerformanceWeights | undefined) => void,
) {
  const base = value.base ?? DEFAULT_AUTO_WEIGHTS.base;
  const steps = value.steps ?? DEFAULT_AUTO_WEIGHTS.steps;

  return (
    <div className={s.root}>
      {unitsSelector(value, onChange)}
      <div className={s.title}>Нач. вес</div>
      <div className={s.items}>
        <button className={s.item} disabled={true}>
          {base}
        </button>
      </div>
      <div className={s.title}>Глав. шаг</div>
      <div className={s.items}>
        <button className={s.item} disabled={true}>
          {steps}
        </button>
      </div>
    </div>
  );
}

function barbellWeights(
  value: PerformanceWeights,
  onChange: (value: PerformanceWeights | undefined) => void,
) {
  const toggle = (steps: number[] | number | undefined, value: number) => {
    if (!Array.isArray(steps)) steps = [];
    const index = steps.indexOf(value);
    return index >= 0 ? steps.filter((s) => s !== value) : [...steps, value];
  };

  const weights = [
    {
      label: "Штанга",
      options: BARBELL_BASES[value.units],
      selected: (v: number) => value.base === v,
      onChange: (base: number) =>
        onChange({
          ...value,
          base: base !== value.base ? base : undefined,
          count: 2,
        }),
    },
    {
      label: "Блины",
      options: DEFAULT_PLATES[value.units],
      selected: (v: number) =>
        Array.isArray(value.steps) && value.steps.includes(v),
      onChange: (plate: number) =>
        onChange({
          ...value,
          steps: toggle(value.steps, plate),
        }),
    },
  ];

  return (
    <div className={s.root}>
      <div className={s.title}>Тип</div>
      <div className={s.title}>{EQUIPMENT_TRANSLATION.barbell}</div>
      {unitsSelector(value, onChange)}
      {weights.map((w) => (
        <React.Fragment key={w.label}>
          <div className={s.title}>{w.label}</div>
          <div className={s.items}>
            {w.options.map((opt) => (
              <button
                key={opt}
                className={clsx(s.item, w.selected(opt) && s.selected)}
                onClick={() => w.onChange(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function dumbbellWeights(
  value: PerformanceWeights,
  onChange: (value: PerformanceWeights | undefined) => void,
) {
  const weights = [
    {
      label: "Шаг веса",
      options: [1, 2, 2.5, 5],
      selected: value.steps,
      onChange: (step: number) =>
        onChange({ ...value, steps: step !== value.steps ? step : undefined }),
    },
    {
      label: "Кол-во",
      options: [1, 2],
      selected: value.count,
      onChange: (count: number) =>
        onChange({
          ...value,
          count: count !== value.count ? count : undefined,
        }),
    },
  ];

  return (
    <div className={s.root}>
      <div className={s.title}>Тип</div>
      <div className={s.title}>{EQUIPMENT_TRANSLATION.dumbbell}</div>
      {unitsSelector(value, onChange)}
      {weights.map((w) => (
        <React.Fragment key={w.label}>
          <div className={s.title}>{w.label}</div>
          <div className={s.items}>
            {w.options.map((opt) => (
              <button
                key={opt}
                className={clsx(s.item, opt === w.selected && s.selected)}
                onClick={() => w.onChange(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function machineWeights(
  value: PerformanceWeights,
  onChange: (value: PerformanceWeights | undefined) => void,
) {
  const weights = [
    {
      label: "Нач. вес",
      options: [2.5, 5, 10, 15, 20],
      selected: value.base,
      onChange: (base: number) =>
        onChange({ ...value, base: base !== value.base ? base : undefined }),
    },
    {
      label: "Глав. шаг",
      options: [2.5, 5, 10, 15, 20],
      selected: value.steps,
      onChange: (step: number) =>
        onChange({ ...value, steps: step !== value.steps ? step : undefined }),
    },
    {
      label: "Доп. шаг",
      options: [1, 2.5, 5, 10],
      selected: value.additional,
      onChange: (step: number) =>
        onChange({
          ...value,
          additional: value.additional !== step ? step : undefined,
        }),
    },
  ];

  return (
    <div className={s.root}>
      <div className={s.title}>Тип</div>
      <div className={s.title}>{EQUIPMENT_TRANSLATION.machine}</div>
      {unitsSelector(value, onChange)}
      {weights.map((w) => (
        <React.Fragment key={w.label}>
          <div className={s.title}>{w.label}</div>
          <div className={s.items}>
            {w.options.map((opt) => (
              <button
                key={opt}
                className={clsx(s.item, opt === w.selected && s.selected)}
                onClick={() => w.onChange(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function platesWeights(
  value: PerformanceWeights,
  onChange: (value: PerformanceWeights | undefined) => void,
) {
  const toggle = (steps: number[] | number | undefined, value: number) => {
    if (!Array.isArray(steps)) steps = [];
    const index = steps.indexOf(value);
    return index >= 0 ? steps.filter((s) => s !== value) : [...steps, value];
  };

  const weights = [
    {
      label: "Блины",
      options: DEFAULT_PLATES[value.units],
      selected: (v: number) =>
        Array.isArray(value.steps) && value.steps.includes(v),
      onChange: (plate: number) =>
        onChange({
          ...value,
          steps: toggle(value.steps, plate),
        }),
    },
    {
      label: "Кол-во",
      options: [1, 2],
      selected: (v: number) => v === value.count,
      onChange: (count: number) =>
        onChange({
          ...value,
          count: count !== value.count ? count : undefined,
        }),
    },
  ];

  return (
    <div className={s.root}>
      <div className={s.title}>Тип</div>
      <div className={s.title}>{EQUIPMENT_TRANSLATION.plates}</div>
      {unitsSelector(value, onChange)}
      {weights.map((w) => (
        <React.Fragment key={w.label}>
          <div className={s.title}>{w.label}</div>
          <div className={s.items}>
            {w.options.map((opt) => (
              <button
                key={opt}
                className={clsx(s.item, w.selected(opt) && s.selected)}
                onClick={() => w.onChange(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function unitsSelector(
  value: PerformanceWeights,
  onChange: (value: PerformanceWeights | undefined) => void,
) {
  const autoToggleHandler = () => {
    if (!value.auto) {
      onChange(convertToAutoWeights(value));
    } else {
      onChange({ units: value.units, auto: false });
    }
  };

  return (
    <>
      <div className={s.title}>Единицы</div>
      <div className={s.items}>
        <button
          className={clsx(s.item, value.auto && s.selected)}
          onClick={autoToggleHandler}
        >
          AUTO
        </button>
        <button
          className={clsx(s.item, value.units === "kg" && s.selected)}
          disabled={value.auto}
          onClick={() => onChange({ units: "kg" })}
        >
          KG
        </button>
        <button
          className={clsx(s.item, value.units === "lbs" && s.selected)}
          disabled={value.auto}
          onClick={() => onChange({ units: "lbs" })}
        >
          LBS
        </button>
      </div>
    </>
  );
}
