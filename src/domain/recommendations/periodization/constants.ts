export const WARM_UP_SETS = [
  [
    //
    { weight: 0.6, reps: 12 },
  ],
  [
    //
    { weight: 0.5, reps: 12 },
    { weight: 0.75, reps: 6 },
  ],
  [
    //
    { weight: 0.4, reps: 15 },
    { weight: 0.6, reps: 8 },
    { weight: 0.8, reps: 4 },
  ],
  [
    //
    { weight: 0.3, reps: 15 },
    { weight: 0.5, reps: 10 },
    { weight: 0.7, reps: 6 },
    { weight: 0.85, reps: 2 },
  ],
];

export const MODE_PARAMS = {
  light: {
    minReps: 10,
    maxReps: 12,
    defaultPercent: 0.652,
    maxPercent: 0.659,
  },
  medium: {
    minReps: 6,
    maxReps: 8,
    defaultPercent: 0.75,
    maxPercent: 0.759,
  },
  heavy: {
    minReps: 4,
    maxReps: 6,
    defaultPercent: 0.857,
    maxPercent: 0.895,
  },
};
