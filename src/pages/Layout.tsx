import { HashRouter, Route, Routes } from "react-router";
import { Workout, WorkoutLayout } from "./Workout";
import { Home } from "./Home";
import {
  ModalStack,
  ProtectedRoute,
  StoreProvider,
  Toasts,
} from "../components";
import { SignIn } from "./SignIn";
import { User } from "./User";
import { ExerciseHistory } from "./Exercise";

export function Layout() {
  return (
    <HashRouter>
      <StoreProvider>
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
                  <WorkoutLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Workout />} />
            </Route>
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
          <Toasts />
        </ModalStack>
      </StoreProvider>
    </HashRouter>
  );
}
