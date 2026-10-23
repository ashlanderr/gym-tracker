import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useState } from "react";
import { PageHeader } from "../../components";
import type { MeasurementType } from "../../db";
import { BodyCard, GirthsCard } from "../Profile/components";
import { GIRTHS, MEASURES } from "../Profile/constants.ts";
import { formatAgo, formatChange, formatMeasure } from "../Profile/utils.ts";

type Variant = "cards" | "grouped";

interface Sample {
  createdAt: number;
  value: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = Date.now();

const series = (ago: number, step: number, values: number[]): Sample[] =>
  values.map((value, i) => ({
    createdAt: NOW - ((values.length - 1 - i) * step + ago) * DAY_MS,
    value,
  }));

const SAMPLES: Record<MeasurementType, Sample[]> = {
  weight: series(
    2,
    7,
    [84.2, 83.9, 84.4, 83.6, 83.1, 83.4, 82.8, 82.5, 82.9, 82.2, 81.8, 82.0],
  ),
  height: series(200, 365, [181, 182]),
  waist: series(9, 30, [88, 86.5, 85]),
  chest: series(9, 30, [104, 104.5, 105]),
  hips: series(9, 30, [100, 99.5, 99.5]),
  biceps: series(9, 30, [37, 37.5, 38]),
};

const VARIANTS: { id: Variant; label: string }[] = [
  { id: "cards", label: "А · карточки" },
  { id: "grouped", label: "Б · объёмы вместе" },
];

const latest = (type: MeasurementType) => SAMPLES[type].at(-1);

const points = (type: MeasurementType) =>
  SAMPLES[type].map((m) => ({ x: m.createdAt, y: m.value }));

const change = (type: MeasurementType) => {
  const [previous, last] = SAMPLES[type].slice(-2);
  return last ? formatChange(last.value - previous.value, type) : null;
};

const noop = () => {};

function Card({ type }: { type: MeasurementType }) {
  const last = latest(type);
  return (
    <BodyCard
      label={MEASURES[type].title}
      value={last ? formatMeasure(last.value, type) : "—"}
      meta={last ? formatAgo(last.createdAt, NOW) : "Нет записей"}
      points={points(type)}
      onOpen={noop}
      onAdd={noop}
    />
  );
}

export function ProfileMockup() {
  const [variant, setVariant] = useState<Variant>("cards");
  const girthsAt = latest("waist")?.createdAt;

  return (
    <div className={s.root}>
      <div className={s.switch}>
        {VARIANTS.map(({ id, label }) => (
          <button
            key={id}
            className={clsx(variant === id && s.active)}
            onClick={() => setVariant(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <PageHeader start title="Профиль" />
      <div className={s.section}>
        <div className={s.sectionTitle}>Тело</div>
        {variant === "cards" ? (
          <div className={s.cards}>
            <Card type="weight" />
            {GIRTHS.map((type) => (
              <Card key={type} type={type} />
            ))}
            <Card type="height" />
          </div>
        ) : (
          <div className={s.cards}>
            <Card type="weight" />
            <GirthsCard
              label="Объёмы"
              meta={girthsAt ? formatAgo(girthsAt, NOW) : "Нет записей"}
              cells={GIRTHS.map((type) => ({
                type,
                label: MEASURES[type].title,
                value: formatMeasure(latest(type)!.value, type),
                change: change(type),
              }))}
              onOpen={noop}
              onAdd={noop}
            />
            <Card type="height" />
          </div>
        )}
      </div>
    </div>
  );
}
