import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useState } from "react";
import { TABS } from "../../constants.ts";
import type { ExerciseTab } from "../../types.ts";
import { HistoryTab } from "../HistoryTab";
import { ProgressTab } from "../ProgressTab";
import { TechniqueTab } from "../TechniqueTab";
import type { ExerciseDetailsProps } from "./types.ts";

// Everything a page shows about one exercise: technique, progress, history.
// The page around it only decides how the exercise is chosen — opened from a
// workout or flipped to in the catalog.
export function ExerciseDetails({ exercise, onReplace }: ExerciseDetailsProps) {
  const [tab, setTab] = useState<ExerciseTab>("technique");

  const renderTab = () => {
    switch (tab) {
      case "technique":
        return <TechniqueTab exercise={exercise} onReplace={onReplace} />;

      case "progress":
        return <ProgressTab exercise={exercise} />;

      case "history":
        return <HistoryTab exercise={exercise} />;
    }
  };

  return (
    <>
      <div className={s.tabs}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            className={clsx(s.tab, key === tab && s.active)}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Remounted per exercise and tab so the scroll starts from the top. */}
      <div className={s.content} key={`${exercise.id}:${tab}`}>
        {renderTab()}
      </div>
    </>
  );
}
