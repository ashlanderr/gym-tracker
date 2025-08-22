export function assertNever(value: never): never {
  console.error("This is impossible value: ", value);
  throw new Error("Unreachable");
}
