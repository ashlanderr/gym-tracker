import s from "./styles.module.scss";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { MdArrowBack } from "react-icons/md";
import { useModalStack, useStore } from "../../../../components";
import {
  deleteMeasurement,
  type Measurement,
  useQueryMeasurements,
  useQueryProfile,
} from "../../../../db";
import { usePageParams } from "../../../hooks.ts";
import {
  DeleteMeasurementModal,
  LineChart,
  MeasureSheet,
} from "../../components";
import { MEASURES } from "../../constants.ts";
import type { MeasurementParams } from "../../types.ts";
import { formatChange, formatDay, formatMeasure } from "../../utils.ts";

export function MeasurementPage() {
  const { type } = usePageParams<MeasurementParams>();
  const store = useStore();
  const navigate = useNavigate();
  const { pushModal } = useModalStack();
  const profile = useQueryProfile(store);
  const measurements = useQueryMeasurements(store, type);
  const [now] = useState(() => Date.now());

  const points = useMemo(
    () => measurements.map((m) => ({ x: m.createdAt, y: m.value })).reverse(),
    [measurements],
  );

  if (!profile || !(type in MEASURES)) return null;

  const spec = MEASURES[type];
  const [latest] = measurements;

  const addHandler = () =>
    pushModal(MeasureSheet, {
      type,
      value: latest?.value ?? spec.fallback[profile.sex],
    });

  // The last record stays: without it the level of every lift would fall
  // back on a guess nobody made.
  const deleteHandler = async (measurement: Measurement) => {
    if (measurements.length < 2) return;
    const confirmed = await pushModal(DeleteMeasurementModal, {
      text: `${formatMeasure(measurement.value, type)}, ${formatDay(measurement.createdAt, now)}`,
    });
    if (confirmed) deleteMeasurement(store, measurement);
  };

  return (
    <div className={s.root}>
      <div className={s.top}>
        <button className={s.back} onClick={() => navigate(-1)}>
          <MdArrowBack />
        </button>
      </div>
      <div className={s.content}>
        <div className={s.title}>{spec.title}</div>
        {latest && (
          <div className={s.summary}>{formatMeasure(latest.value, type)}</div>
        )}
        {points.length > 1 && <LineChart className={s.chart} points={points} />}
        <div className={s.list}>
          {measurements.map((measurement, index) => {
            const previous = measurements[index + 1];
            return (
              <button
                key={measurement.id}
                className={s.row}
                disabled={measurements.length < 2}
                onClick={() => deleteHandler(measurement)}
              >
                <span className={s.date}>
                  {formatDay(measurement.createdAt, now)}
                  {measurement.createdAt === profile.createdAt &&
                    " · из анкеты"}
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
          {spec.addLabel}
        </button>
      </div>
    </div>
  );
}
