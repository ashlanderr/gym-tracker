import { Outlet } from "react-router";
import { ActiveTimer } from "./components";

export function WorkoutLayout() {
  return (
    <>
      <Outlet />
      <ActiveTimer />
    </>
  );
}
