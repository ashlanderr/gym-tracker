import { pluralize } from "../../utils";
import { formatAgo } from "../Profile/utils.ts";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.now();

const WORKOUT_FORMS: [string, string, string] = [
  "тренировка",
  "тренировки",
  "тренировок",
];
const RECORD_FORMS: [string, string, string] = [
  "рекорд",
  "рекорда",
  "рекордов",
];
const EXERCISE_FORMS: [string, string, string] = [
  "упражнении",
  "упражнениях",
  "упражнениях",
];

function count(n: number, forms: [string, string, string]) {
  return pluralize(n, forms).replace(String(n), n.toLocaleString("ru"));
}

interface Last {
  count: number;
  last: number;
}

export interface RestoreData {
  name: string;
  workouts: Last;
  records: number;
  recordExercises: number;
}

export interface MergeData {
  name: string;
  account: Last;
  phone: Last;
}

export const RESTORE_DATA: RestoreData[] = [
  {
    name: "Обычно",
    workouts: { count: 48, last: NOW - DAY },
    records: 12,
    recordExercises: 9,
  },
  {
    name: "Давно не заходил",
    workouts: { count: 312, last: new Date(2024, 2, 4).getTime() },
    records: 87,
    recordExercises: 23,
  },
  {
    name: "Одна тренировка, рекордов нет",
    workouts: { count: 1, last: NOW - 3 * DAY },
    records: 0,
    recordExercises: 0,
  },
  {
    name: "Много всего",
    workouts: { count: 1234, last: NOW - 12 * DAY },
    records: 143,
    recordExercises: 58,
  },
];

export const MERGE_DATA: MergeData[] = [
  {
    name: "Обычно",
    account: { count: 48, last: NOW - DAY },
    phone: { count: 2, last: NOW },
  },
  {
    name: "Аккаунт давно не открывали",
    account: { count: 312, last: new Date(2024, 2, 4).getTime() },
    phone: { count: 1, last: NOW },
  },
  {
    name: "На телефоне больше",
    account: { count: 1, last: new Date(2025, 10, 28).getTime() },
    phone: { count: 15, last: NOW - 2 * DAY },
  },
  {
    name: "Много всего",
    account: { count: 1234, last: NOW - 12 * DAY },
    phone: { count: 21, last: NOW },
  },
];

const ago = (date: number) => formatAgo(date, NOW);

export interface Row {
  label: string;
  value: string;
  meta: string;
}

export function restoreRows(d: RestoreData): Row[] {
  const rows = [
    {
      label: "Тренировки",
      value: d.workouts.count.toLocaleString("ru"),
      meta: `последняя ${ago(d.workouts.last)}`,
    },
  ];
  if (d.records > 0) {
    rows.push({
      label: "Рекорды",
      value: d.records.toLocaleString("ru"),
      meta: `в ${count(d.recordExercises, EXERCISE_FORMS)}`,
    });
  }
  return rows;
}

export function mergeRows(d: MergeData): Row[] {
  return [
    {
      label: "В аккаунте",
      value: d.account.count.toLocaleString("ru"),
      meta: `последняя ${ago(d.account.last)}`,
    },
    {
      label: "С телефона",
      value: `+${d.phone.count.toLocaleString("ru")}`,
      meta: `последняя ${ago(d.phone.last)}`,
    },
  ];
}

export function restoreSentences(d: RestoreData) {
  return {
    head: count(d.workouts.count, WORKOUT_FORMS),
    lines: [
      `Последняя ${ago(d.workouts.last)}`,
      ...(d.records > 0
        ? [
            `${count(d.records, RECORD_FORMS)} в ${count(d.recordExercises, EXERCISE_FORMS)}`,
          ]
        : []),
    ],
  };
}

export function mergeSentences(d: MergeData) {
  return {
    head: count(d.account.count + d.phone.count, WORKOUT_FORMS),
    lines: [
      `${d.account.count.toLocaleString("ru")} из аккаунта, последняя ${ago(d.account.last)}`,
      `${d.phone.count.toLocaleString("ru")} с телефона, последняя ${ago(d.phone.last)}`,
    ],
  };
}
