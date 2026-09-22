import {
  HashRouter,
  NavigationType,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  type Transition,
  type Variants,
} from "motion/react";
import { Workout } from "./Workout";
import { WorkoutFocus } from "./WorkoutFocus";
import { WorkoutFinish } from "./WorkoutFinish";
import { Home } from "./Home";
import { ModalStack, StoreProvider } from "../components";
import { User } from "./User";
import { Onboarding } from "./Onboarding";
import { ExerciseCatalogPage, ExercisePage } from "./Exercise";
import s from "./layout.module.scss";

const PAGE_OFFSET = 64;

const PAGE_VARIANTS: Variants = {
  enter: (direction: number) => ({ x: direction * PAGE_OFFSET, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: -direction * PAGE_OFFSET, opacity: 0 }),
};

const PAGE_TRANSITION: Transition = {
  type: "tween",
  ease: [0.32, 0.72, 0, 1],
  duration: 0.26,
};

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
// Pages move along one axis: forward slides in from the right, back returns.
function AnimatedRoutes() {
  const location = useLocation();
  const direction = useNavigationType() === NavigationType.Pop ? -1 : 1;

  return (
    <AnimatePresence initial={false} custom={direction}>
      <motion.div
        key={location.pathname}
        className={s.page}
        custom={direction}
        variants={PAGE_VARIANTS}
        initial="enter"
        animate="center"
        exit="exit"
        transition={PAGE_TRANSITION}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/workouts/:workoutId" element={<WorkoutFocus />} />
          <Route path="/workouts/:workoutId/all" element={<Workout />} />
          <Route
            path="/workouts/:workoutId/finish"
            element={<WorkoutFinish />}
          />
          {/* Reachable only by typing the address, and only while developing:
              it is a tool for reading the catalog through, not a feature. */}
          {import.meta.env.DEV && (
            <Route path="/exercises" element={<ExerciseCatalogPage />} />
          )}
          {/* Reachable but not yet reached: `Profile` does not exist in the
              store, so nothing sends anybody here and the answers go
              nowhere. The screens themselves are finished. */}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/exercises/:exerciseId" element={<ExercisePage />} />
          <Route path="/user" element={<User />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
