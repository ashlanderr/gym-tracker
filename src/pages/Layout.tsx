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
import { Profile } from "./Profile";
import { Settings } from "./Settings";
import { Tabs } from "./Tabs";
import { ExerciseHistory } from "./Exercise";

export function Layout() {
  return (
    <HashRouter>
      <StoreProvider>
        <ModalStack>
          <Routes>
            <Route
              element={
                <ProtectedRoute>
                  <Tabs />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
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
            <Route path="/auth/sign-in" element={<SignIn />} />
          </Routes>
          <Toasts />
        </ModalStack>
      </StoreProvider>
    </HashRouter>
  );
}
