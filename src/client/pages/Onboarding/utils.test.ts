import { isStepId } from "./utils.ts";

test("only a step of the flow is read back out of history", () => {
  // The step is kept in `location.state`, which a sheet takes over for as long
  // as it is open. Anything that is not a step means "stay where you are".
  expect(isStepId("welcome")).toBe(true);
  expect(isStepId("experience")).toBe(true);
  expect(isStepId("jWZ4k1rQ")).toBe(false);
  expect(isStepId(null)).toBe(false);
});
