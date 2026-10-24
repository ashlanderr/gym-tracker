import s from "./styles.module.scss";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { PageHeader, useModalStack, useStore } from "../../../../components";
import {
  deleteMeasurement,
  type Measurement,
  useQueryMeasurements,
} from "../../../../db";
import { usePageParams } from "../../../hooks.ts";
import {
  DeleteMeasurementModal,
  LineChart,
  MeasureSheet,
} from "../../components";
import { MEASURES } from "../../constants.ts";
import type { MeasurementParams } from "../../types.ts";
import {
  formatChange,
  formatDay,
  formatMeasure,
  groupByType,
  toPoints,
} from "../../utils.ts";

export function MeasurementPage() {
  const { type } = usePageParams<MeasurementParams>();
  const store = useStore();
  const navigate = useNavigate();
  const { pushModal } = useModalStack();
  const all = useQueryMeasurements(store);
  const [now] = useState(() => Date.now());

  const measurements = useMemo(
    () => (type in MEASURES ? groupByType(all)[type] : []),
    [all, type],
  );
  const points = useMemo(() => toPoints(measurements), [measurements]);
  // Oldest first, as the chart runs: each change reads down from the record
  // above it.
  const history = useMemo(() => [...measurements].reverse(), [measurements]);

  if (!(type in MEASURES)) return null;

  const spec = MEASURES[type];
  const [latest] = measurements;
  // The last weight stays: exercises with the body as their weight count it.
  const isLocked = type === "weight" && measurements.length < 2;

  const addHandler = () =>
    pushModal(MeasureSheet, {
      type,
      value: latest?.value ?? spec.fallback,
      isFirst: !latest,
    });

  // Deleting the last record stops tracking the measurement, and the page
  // has nothing left to show.
  const deleteHandler = async (measurement: Measurement) => {
    const confirmed = await pushModal(DeleteMeasurementModal, {
      text: `${formatMeasure(measurement.value, type)}, ${formatDay(measurement.createdAt, now)}`,
    });
    if (!confirmed) return;
    deleteMeasurement(store, measurement);
    if (measurements.length === 1) navigate(-1);
  };

  return (
    <div className={s.root}>
      <PageHeader title={spec.title} onBack={() => navigate(-1)} />
      <div className={s.content}>
        {latest && (
          <div className={s.summary}>{formatMeasure(latest.value, type)}</div>
        )}
        {points.length > 1 && <LineChart className={s.chart} points={points} />}
        <div className={s.list}>
          {history.map((measurement, index) => {
            const previous = history[index - 1];
            return (
              <button
                key={measurement.id}
                className={s.row}
                disabled={isLocked}
                onClick={() => deleteHandler(measurement)}
              >
                <span className={s.date}>
                  {formatDay(measurement.createdAt, now)}
                </span>
                <span className={s.value}>
                  {formatMeasure(measurement.value, type)}
                </span>
                <span className={s.change}>
                  {previous &&
                    formatChange(measurement.value - previous.value, type)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className={s.action}>
        <button className={s.primary} onClick={addHandler}>
          Записать
        </button>
      </div>
    </div>
  );
}
