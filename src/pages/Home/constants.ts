// The strip reaches back at least this far even without workouts there, and
// this far ahead for the plans to come.
export const PAST_WEEKS = 4;
export const FUTURE_WEEKS = 12;

export const MONTH_FORMATTER = new Intl.DateTimeFormat("ru", {
  month: "long",
});

export const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("ru", {
  weekday: "short",
});

export const DAY_FORMATTER = new Intl.DateTimeFormat("ru", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export const TIME_FORMATTER = new Intl.DateTimeFormat("ru", {
  hour: "numeric",
  minute: "numeric",
});
