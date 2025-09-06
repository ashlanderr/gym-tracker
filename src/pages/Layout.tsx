import { HashRouter, Route, Routes } from "react-router";
import { Workout } from "./Workout";
import { Home } from "./Home";
import { ModalStack, ProtectedRoute } from "../components";
import { SignIn } from "./SignIn";
import { User } from "./User";
import { ExerciseHistory } from "./Exercise";

export function Layout() {
  return (
    <HashRouter>
      <ModalStack>
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
            path="/exercises/:exerciseId/history"
            element={
              <ProtectedRoute>
                <ExerciseHistory />
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
      </ModalStack>
    </HashRouter>
  );
}
