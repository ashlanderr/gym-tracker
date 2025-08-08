import { HashRouter, Route, Routes } from "react-router";
import { Workout } from "./Workout";
import { Home } from "./Home";
import { ProtectedRoute } from "../components";
import { SignIn } from "./SignIn";
import { User } from "./User";

export function Layout() {
  return (
    <HashRouter>
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
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <User />
            </ProtectedRoute>
          }
        />
        <Route path="/auth/sign-in" element={<SignIn />} />
      </Routes>
    </HashRouter>
  );
}
