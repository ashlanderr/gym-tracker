import { BrowserRouter, Route, Routes } from "react-router";
import { Workout } from "./Workout";
import { Home } from "./Home";
import { ProtectedRoute } from "../components";
import { SignIn } from "./SignIn";

export function Layout() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workouts/:workoutId"
          element={
            <ProtectedRoute>
              <Workout />
            </ProtectedRoute>
          }
        />
        <Route path="/auth/sign-in" element={<SignIn />} />
      </Routes>
    </BrowserRouter>
  );
}
