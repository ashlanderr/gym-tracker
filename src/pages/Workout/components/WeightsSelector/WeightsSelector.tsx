import type { WeightsSelectorProps } from "./types.ts";
import s from "./styles.module.scss";
import type { Weights, WeightUnits } from "../../../../db/performances.ts";
import { clsx } from "clsx";
import React from "react";

export function WeightsSelector({
  equipment,
  value,
  onChange,
}: WeightsSelectorProps) {
  const normalizedValue = value ?? { units: "kg" };

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

function barbellWeights(
  value: Weights,
  onChange: (value: Weights | undefined) => void,
) {
  const toggle = (steps: number[] | number | undefined, value: number) => {
    if (!Array.isArray(steps)) steps = [];
    const index = steps.indexOf(value);
    return index >= 0 ? steps.filter((s) => s !== value) : [...steps, value];
  };

  const weights = [
    {
      label: "Штанга",
      options: value.units === "kg" ? [10, 15, 20] : [25, 35, 45],
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
      options:
        value.units === "kg"
          ? [1.25, 2.5, 5, 10, 20]
          : [2.5, 5, 10, 25, 35, 45],
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
      <div className={s.title}>Штанга</div>
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
  value: Weights,
  onChange: (value: Weights | undefined) => void,
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
      <div className={s.title}>Гантели</div>
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
  value: Weights,
  onChange: (value: Weights | undefined) => void,
) {
  const weights = [
    {
      label: "Глав. шаг",
      options: [2.5, 5, 10],
      selected: value.steps,
      onChange: (step: number) =>
        onChange({ ...value, steps: step !== value.steps ? step : undefined }),
    },
    {
      label: "Доп. шаг",
      options: [1, 2.5, 5],
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
      <div className={s.title}>Тренажёр</div>
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
  value: Weights,
  onChange: (value: Weights | undefined) => void,
) {
  const toggle = (steps: number[] | number | undefined, value: number) => {
    if (!Array.isArray(steps)) steps = [];
    const index = steps.indexOf(value);
    return index >= 0 ? steps.filter((s) => s !== value) : [...steps, value];
  };

  const weights = [
    {
      label: "Блины",
      options:
        value.units === "kg"
          ? [1.25, 2.5, 5, 10, 20]
          : [2.5, 5, 10, 25, 35, 45],
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
      <div className={s.title}>Блины</div>
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
  value: Weights,
  onChange: (value: Weights | undefined) => void,
) {
  const unitsHandler = (units: WeightUnits) => {
    onChange({ units });
  };

  return (
    <>
      <div className={s.title}>Единицы</div>
      <div className={s.items}>
        <button
          className={clsx(s.item, value.units === "lbs" && s.selected)}
          onClick={() => unitsHandler("lbs")}
        >
          LBS
        </button>
        <button
          className={clsx(s.item, value.units === "kg" && s.selected)}
          onClick={() => unitsHandler("kg")}
        >
          KG
        </button>
      </div>
    </>
  );
}
