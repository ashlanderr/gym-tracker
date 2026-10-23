import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useState } from "react";
import { PageHeader } from "../../components";
import type { MeasurementType } from "../../db";
import { AddMeasureTile, BodyTile } from "../Profile/components";
import { MEASURES } from "../Profile/constants.ts";
import { formatAgo, formatMeasure } from "../Profile/utils.ts";

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

// The order somebody would start tracking in: weight, then what they care
// about. Only tracked measurements are shown, so the count varies.
const TRACKED: MeasurementType[] = [
  "weight",
  "waist",
  "biceps",
  "height",
  "chest",
  "hips",
];

const COUNTS = [1, 2, 3, 5];

const noop = () => {};

function Tile({ type }: { type: MeasurementType }) {
  const samples = SAMPLES[type];
  const last = samples.at(-1);
  return (
    <BodyTile
      label={MEASURES[type].title}
      value={last ? formatMeasure(last.value, type) : "—"}
      meta={last ? formatAgo(last.createdAt, NOW) : "Нет записей"}
      points={samples.map((m) => ({ x: m.createdAt, y: m.value }))}
      onOpen={noop}
      onAdd={noop}
    />
  );
}

export function ProfileMockup() {
  const [count, setCount] = useState(3);
  const tracked = TRACKED.slice(0, count);

  return (
    <div className={s.root}>
      <div className={s.switch}>
        {COUNTS.map((n) => (
          <button
            key={n}
            className={clsx(count === n && s.active)}
            onClick={() => setCount(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <PageHeader start title="Профиль" />
      <div className={s.section}>
        <div className={s.sectionTitle}>Тело</div>
        <div className={s.tiles}>
          {tracked.map((type) => (
            <Tile key={type} type={type} />
          ))}
          <AddMeasureTile onClick={noop} />
        </div>
      </div>
    </div>
  );
}
