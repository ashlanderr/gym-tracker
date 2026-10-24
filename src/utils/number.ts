export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat("ru", options)
    .formatToParts(value)
    .map((part) => (part.type === "decimal" ? "." : part.value))
    .join("");
}
