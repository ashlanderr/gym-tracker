import type { MeasurementType } from "../../db";

export const APP_VERSION = "4.15.0";

export const SEED_DAYS_AGO = [
  1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 26, 29, 33, 40,
];

// Days ago and the value. Weight weekly, girths every few weeks, height
// once, the rest never: the profile shows only what has records.
export const SEED_MEASUREMENTS: Partial<
  Record<MeasurementType, [number, number][]>
> = {
  weight: [
    [49, 84.2],
    [42, 83.9],
    [35, 84.4],
    [28, 83.6],
    [21, 83.1],
    [14, 82.8],
    [7, 82.5],
    [2, 82.1],
  ],
  waist: [
    [56, 88],
    [35, 87],
    [14, 86],
    [3, 85.5],
  ],
  biceps: [
    [56, 37],
    [35, 37.5],
    [14, 37.5],
    [3, 38],
  ],
  height: [[60, 182]],
};

export const SEED_PLANS = [
  {
    name: "Грудь и плечи",
    exercises: [
      { exercise: "OvlOX8JCqg0lEuaPBU3G", weight: 60, reps: 8 },
      { exercise: "WQldUrMtFqTRt9Mt7fpT", weight: 30, reps: 10 },
      { exercise: "Vfh6Q6Lu2cabxPEtWoqW", weight: 15, reps: 12 },
    ],
  },
  {
    name: "Спина",
    exercises: [
      { exercise: "7WHNH0KA8Fved2WkuQ1s", weight: 50, reps: 10 },
      { exercise: "TKCpwpwjAtyQOCYMR4jG", weight: 45, reps: 10 },
    ],
  },
  {
    name: "Ноги",
    exercises: [
      { exercise: "Txx1kCEjSmank1XX1aCP", weight: 70, reps: 6 },
      { exercise: "vhrOc6gI5BNTrfTPamHa", weight: 120, reps: 10 },
    ],
  },
];
