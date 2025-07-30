import { BrowserRouter, Route, Routes } from "react-router";
import { Workout } from "./Workout";
import { Home } from "./Home";

export function Layout() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/workouts/:workoutId" Component={Workout} />
      </Routes>
    </BrowserRouter>
  );
}
