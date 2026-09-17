const PLURAL_RULES = new Intl.PluralRules("ru");

// Forms for one, few and many: ["подход", "подхода", "подходов"].
export function pluralize(
  count: number,
  [one, few, many]: [string, string, string],
): string {
  switch (PLURAL_RULES.select(count)) {
    case "one":
      return `${count} ${one}`;
    case "few":
      return `${count} ${few}`;
    default:
      return `${count} ${many}`;
  }
}
