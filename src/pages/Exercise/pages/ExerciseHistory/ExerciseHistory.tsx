import s from "./styles.module.scss";
import { MdArrowBack } from "react-icons/md";
import type {
  ChartParameterType,
  ChartPeriodType,
  ExerciseHistoryParams,
} from "./types.ts";
import { MUSCLES_TRANSLATION } from "../../../constants.ts";
import {
  useQuerySetsByExercise,
  useQueryPerformancesByExercise,
  useQueryRecordsByExercise,
  maxBy,
  compareRecordsByDate,
  useQueryExerciseById,
  type PeriodizationMode,
} from "../../../../db";
import { useStore } from "../../../../components";
import { useMemo, useState } from "react";
import { buildHistory } from "./utils.ts";
import {
  CHART_PARAMETERS,
  CHART_PERIODS,
  DATE_FORMATTER,
  PERIODIZATION_DOT_COLORS,
} from "./constants.ts";
import { clsx } from "clsx";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { RECORDS_TRANSLATION } from "../../../constants.ts";
import { formatRecordValue } from "../../../../domain";
import { PiMedalFill } from "react-icons/pi";
import { usePageParams } from "../../../hooks.ts";
import { useNavigate } from "react-router";

export function ExerciseHistory() {
  const store = useStore();
  const navigate = useNavigate();
  const { exerciseId } = usePageParams<ExerciseHistoryParams>();
  const exercise = useQueryExerciseById(store, exerciseId);
  const performances = useQueryPerformancesByExercise(store, exerciseId);
  const sets = useQuerySetsByExercise(store, exerciseId);
  const records = useQueryRecordsByExercise(store, exerciseId);
  const latestRecords = useMemo(() => {
    return Object.entries(RECORDS_TRANSLATION)
      .map(([recordType, recordName]) => {
        const record = maxBy(
          records.filter((r) => r.type === recordType),
          compareRecordsByDate,
        );
        return { name: recordName, value: record?.current ?? 0 };
      })
      .filter((r) => r.value);
  }, [records]);
  const [parameter, setParameter] = useState<ChartParameterType>("oneRepMax");
  const [period, setPeriod] = useState<ChartPeriodType>("three_months");
  const history = useMemo(
    () => buildHistory(performances, sets, period),
    [performances, sets, period],
  );

  if (!exercise) return null;

  return (
    <div className={s.root}>
      <div className={s.toolbar}>
        <button className={s.toolbarButton} onClick={() => navigate(-1)}>
          <MdArrowBack />
        </button>
        <div className={s.pageTitle}>История упражнения</div>
      </div>
      <div className={s.name}>{exercise.name}</div>
      <div className={s.muscles}>
        {exercise.muscles.map((m) => (
          <div className={s.muscle} key={m}>
            {MUSCLES_TRANSLATION[m]}
          </div>
        ))}
      </div>
      <div className={s.chartRoot}>
        <div className={s.parameters}>
          {CHART_PARAMETERS.map((param) => (
            <button
              className={clsx(s.parameter, param.key === parameter && s.active)}
              key={param.key}
              onClick={() => setParameter(param.key)}
            >
              {param.label}
            </button>
          ))}
        </div>
        <div className={s.periods}>
          {CHART_PERIODS.map((p) => (
            <button
              className={clsx(s.period, p.key === period && s.active)}
              key={p.key}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className={s.chart}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={history}
              margin={{ left: 0, top: 32, right: 32, bottom: 0 }}
            >
              <XAxis
                type="number"
                scale="time"
                domain={["auto", "auto"]}
                dataKey="date"
                tickFormatter={(tick) => DATE_FORMATTER.format(tick)}
                tickMargin={8}
              />
              <YAxis
                domain={[
                  (v) => Math.round(v * 0.9),
                  (v) => Math.round(v * 1.1),
                ]}
                tickCount={6}
              />
              <CartesianGrid stroke="#222" />
              <Line
                type="linear"
                dataKey={parameter}
                stroke="gray"
                isAnimationActive={false}
                dot={<CustomDot />}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {latestRecords.length !== 0 && (
        <div className={s.records}>
          <div className={s.recordTitle}>
            <PiMedalFill className={s.recordMedal} />
            Личные рекорды
          </div>
          {latestRecords.map((r) => (
            <div className={s.record} key={r.name}>
              <div className={s.recordName}>{r.name}</div>
              <div className={s.recordValue}>{formatRecordValue(r.value)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const periodization: PeriodizationMode | "" = payload.periodization ?? "";
  const color = PERIODIZATION_DOT_COLORS[periodization];
  return <circle cx={cx} cy={cy} r={3} fill={color} />;
};
