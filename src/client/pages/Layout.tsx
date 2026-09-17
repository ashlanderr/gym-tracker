import { HashRouter, Route, Routes, useLocation } from "react-router";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { Workout } from "./Workout";
import { WorkoutFocus } from "./WorkoutFocus";
import { Home } from "./Home";
import { ModalStack, StoreProvider } from "../components";
import { User } from "./User";
import { ExerciseHistory } from "./Exercise";
import s from "./layout.module.scss";

export function Layout() {
  return (
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <StoreProvider>
          <ModalStack>
            <AnimatedRoutes />
          </ModalStack>
        </StoreProvider>
      </HashRouter>
    </MotionConfig>
  );
}

// Keyed by path: a modal changes only the history state, so the page stays.
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={location.pathname}
        className={s.page}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/workouts/:workoutId" element={<WorkoutFocus />} />
          <Route path="/workouts/:workoutId/all" element={<Workout />} />
          <Route
            path="/exercises/:exerciseId/history"
            element={<ExerciseHistory />}
          />
          <Route path="/user" element={<User />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
