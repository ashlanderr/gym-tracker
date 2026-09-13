import { HashRouter, Route, Routes } from "react-router";
import { Workout } from "./Workout";
import { Home } from "./Home";
import { ModalStack, StoreProvider } from "../components";
import { User } from "./User";
import { ExerciseHistory } from "./Exercise";

export function Layout() {
  return (
    <HashRouter>
      <StoreProvider>
        <ModalStack>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/workouts/:workoutId" element={<Workout />} />
            <Route
              path="/exercises/:exerciseId/history"
              element={<ExerciseHistory />}
            />
            <Route path="/user" element={<User />} />
          </Routes>
        </ModalStack>
      </StoreProvider>
    </HashRouter>
  );
}
