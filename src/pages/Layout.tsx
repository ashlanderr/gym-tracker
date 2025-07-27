import { BrowserRouter, Route, Routes } from "react-router";
import { Workout } from "./Workout";

export function Layout() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={Workout} />
      </Routes>
    </BrowserRouter>
  );
}
