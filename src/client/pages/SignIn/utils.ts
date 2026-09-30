const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: number): number {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
}

// A date under a number in a narrow cell: words only for the two days that
// need no date, digits otherwise, which are always ten characters and never
// break away from the number they belong to.
export function formatLastDate(date: number, now: number): string {
  const days = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);
  if (days <= 0) return "сегодня";
  if (days === 1) return "вчера";
  return new Date(date).toLocaleDateString("ru");
}
