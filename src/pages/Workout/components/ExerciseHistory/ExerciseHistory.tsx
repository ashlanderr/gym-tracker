import s from "./styles.module.scss";
import { MdArrowBack } from "react-icons/md";
import type { ChartParameterType, ExerciseHistoryProps } from "./types.ts";
import { MUSCLES_TRANSLATION } from "../../../constants.ts";
import { useQuerySetsByExercise } from "../../../../db/sets.ts";
import { useStore } from "../../../../components";
import { useQueryPerformancesByExercise } from "../../../../db/performances.ts";
import { useMemo, useState } from "react";
import { buildHistory } from "./utils.ts";
import { CHART_PARAMETERS, DATE_FORMATTER } from "./constants.ts";
import { clsx } from "clsx";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useQueryRecordsByExercise } from "../../../../db/records.ts";
import { RECORDS_TRANSLATION } from "../../../constants.ts";
import { maxBy } from "../../../../db/db.ts";
import { formatRecordValue } from "../utils.ts";
import { PiMedalFill } from "react-icons/pi";

export function ExerciseHistory({ exercise, onClose }: ExerciseHistoryProps) {
  const store = useStore();
  const performances = useQueryPerformancesByExercise(store, exercise.id);
  const sets = useQuerySetsByExercise(store, exercise.id);
  const records = useQueryRecordsByExercise(store, exercise.id);
  const history = useMemo(
    () => buildHistory(performances, sets),
    [performances, sets],
  );
  const latestRecords = useMemo(() => {
    return Object.entries(RECORDS_TRANSLATION)
      .map(([recordType, recordName]) => {
        const record = maxBy(
          records.filter((r) => r.type === recordType),
          (a, b) => a.current - b.current,
        );
        return { name: recordName, value: record?.current ?? 0 };
      })
      .filter((r) => r.value);
  }, [records]);
  const [parameter, setParameter] = useState<ChartParameterType>("oneRepMax");

  return (
    <div className={s.root}>
      <div className={s.toolbar}>
        <button className={s.toolbarButton} onClick={onClose}>
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
                stroke="#8884d8"
                isAnimationActive={false}
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
              <div className={s.recordValue}>
                {formatRecordValue(r.value)} кг
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
