import { HashRouter, Route, Routes } from "react-router";
import { Workout, WorkoutLayout } from "./Workout";
import { Home } from "./Home";
import {
  ModalStack,
  ProtectedRoute,
  StoreProvider,
  Toasts,
} from "../components";
import { Performance } from "./Performance";
import { Notice } from "./Notice";
import { SignIn } from "./SignIn";
import { User } from "./User";
import { ExerciseHistory } from "./Exercise";
import { NoticeMockup } from "./NoticeMockup";

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
              <Route
                path="performances/:performanceId"
                element={<Performance />}
              />
              <Route
                path="performances/:performanceId/notice"
                element={<Notice />}
              />
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
            <Route path="/mockups/notice" element={<NoticeMockup />} />
          </Routes>
          <Toasts />
        </ModalStack>
      </StoreProvider>
    </HashRouter>
  );
}
