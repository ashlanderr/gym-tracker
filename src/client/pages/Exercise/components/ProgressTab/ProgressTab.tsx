import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { PiMedalFill } from "react-icons/pi";
import {
  compareRecordsByDate,
  maxBy,
  type RecordType,
  useQueryLatestMeasurement,
  useQueryPerformancesByExercise,
  useQueryRecordsByExercise,
  useQuerySetsByExercise,
} from "../../../../db";
import { useStore } from "../../../../components";
import { addSelfWeight } from "../../../../domain";
import { UNITS_SHORT, WEIGHT_SIGNS } from "../../../constants.ts";
import {
  AXIS_DATE_FORMATTER,
  CHART_METRICS,
  CHART_PERIODS,
} from "../../constants.ts";
import type { ChartMetric, ChartPeriod } from "../../types.ts";
import { buildHistory, buildSessions } from "../../utils.ts";
import type { ProgressTabProps } from "./types.ts";

const CHART_HEIGHT = 180;

export function ProgressTab({ exercise }: ProgressTabProps) {
  const store = useStore();
  const performances = useQueryPerformancesByExercise(store, exercise.id);
  const sets = useQuerySetsByExercise(store, exercise.id);
  const records = useQueryRecordsByExercise(store, exercise.id);
  const bodyWeight = useQueryLatestMeasurement(store, "weight", null);
  const [metric, setMetric] = useState<ChartMetric>("averageRepMax");
  const [period, setPeriod] = useState<ChartPeriod>("three_months");
  const [now] = useState(() => Date.now());

  const selfWeight = bodyWeight?.value;
  const points = useMemo(
    () =>
      buildHistory(
        buildSessions(performances, sets),
        period,
        (weight) => addSelfWeight(exercise.weight, selfWeight, weight),
        now,
      ),
    [performances, sets, period, exercise.weight, selfWeight, now],
  );

  const latest = (type: RecordType) =>
    maxBy(
      records.filter((r) => r.type === type),
      compareRecordsByDate,
    );
  const bestSet = sets.find((set) => set.id === latest("one_rep_max")?.set);
  const oneRepMax = latest("one_rep_max")?.current;
  const maxWeight = latest("weight")?.current;
  const kg = UNITS_SHORT.kg;
  const sign = WEIGHT_SIGNS[exercise.weight.type];

  const recordRows = [
    {
      name: "Лучший подход",
      value: bestSet?.completed && `${sign}${bestSet.weight} × ${bestSet.reps}`,
    },
    {
      name: "Оценка максимума",
      value: oneRepMax !== undefined && `${round(oneRepMax)} ${kg}`,
    },
    {
      name: "Максимальный вес",
      value: maxWeight !== undefined && `${round(maxWeight)} ${kg}`,
    },
  ].filter((row) => row.value);

  const lastIndex = points.length - 1;

  return (
    <>
      <div className={s.metrics}>
        {CHART_METRICS.map(({ key, label }) => (
          <button
            key={key}
            className={clsx(s.metric, key === metric && s.active)}
            onClick={() => setMetric(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={s.periods}>
        {CHART_PERIODS.map(({ key, label }) => (
          <button
            key={key}
            className={clsx(s.period, key === period && s.active)}
            onClick={() => setPeriod(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={s.chart}>
        {points.length === 0 ? (
          <div className={s.empty} style={{ height: CHART_HEIGHT }}>
            Нет выполненных подходов за этот период
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <LineChart
              data={points}
              margin={{ top: 12, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid stroke="#1c1c1c" vertical={false} />
              <XAxis
                type="number"
                scale="time"
                dataKey="date"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(tick) => AXIS_DATE_FORMATTER.format(tick)}
                tick={{ fill: "#5a5a5a", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
              />
              <YAxis
                domain={[
                  (min: number) => Math.floor(min * 0.95),
                  (max: number) => Math.ceil(max * 1.05),
                ]}
                tick={{ fill: "#5a5a5a", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Line
                type="linear"
                dataKey={metric}
                stroke="#08f"
                strokeWidth={2}
                isAnimationActive={false}
                dot={({ cx, cy, index }) => (
                  <circle
                    key={index}
                    cx={cx}
                    cy={cy}
                    r={index === lastIndex ? 4 : 2.5}
                    fill={index === lastIndex ? "#fff" : "#08f"}
                  />
                )}
                activeDot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      {recordRows.length !== 0 && (
        <>
          <div className={s.section}>Личные рекорды</div>
          <div className={s.records}>
            {recordRows.map((row) => (
              <div className={s.record} key={row.name}>
                <PiMedalFill className={s.medal} />
                <span className={s.recordName}>{row.name}</span>
                <span className={s.recordValue}>{row.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
