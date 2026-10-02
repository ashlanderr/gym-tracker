// Two sets before the first exercise of a movement group: one to warm the
// muscles, one to get ready for the working weight. Share of the full weight.
export const WARM_UP_SETS = [
  { weight: 0.5, reps: 12 },
  { weight: 0.85, reps: 6 },
];

// While the weight is being found, "Мало" doubles the full weight but adds
// no more than this, and "Легко" adds a quarter.
export const LIGHT_MAX_ADD_KG = 20;
export const EASY_FACTOR = 1.25;

// A set below the range with nothing lighter that went before it.
export const BELOW_FACTOR = 0.85;

// How many earlier performances weight finding looks back over.
export const HISTORY_LIMIT = 5;
