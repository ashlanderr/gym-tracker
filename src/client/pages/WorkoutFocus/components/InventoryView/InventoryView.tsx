import s from "./styles.module.scss";
import { useState } from "react";
import { useStore } from "../../../../components";
import { type ExerciseLoad, updateGym } from "../../../../db";
import {
  applyDraft,
  initialDraft,
  InventoryFields,
} from "../../../Workout/components";
import { SetupLayout } from "../SetupLayout";
import type { InventoryViewProps } from "./types.ts";

const COPY: Record<
  Exclude<ExerciseLoad["type"], "none">,
  { title: string; text: string }
> = {
  barbell: {
    title: "Что есть в зале?",
    text: "Блины и грифы общие на весь зал, поэтому их нужно указать всего один раз.",
  },
  plates: {
    title: "Какие блины в зале?",
    text: "Блины общие на весь зал, поэтому их нужно указать всего один раз.",
  },
  dumbbell: {
    title: "Какие гантели в зале?",
    text: "Гантели общие на весь зал, поэтому их нужно указать всего один раз.",
  },
  stack: {
    title: "Какой стек в тренажёре?",
    text: "Стек у каждого тренажёра свой, поэтому его нужно указать для этого тренажёра один раз.",
  },
};

// Asked once, before the first set that needs the inventory. Saving it is
// what lets the set screen open.
export function InventoryView({ exercise, gym }: InventoryViewProps) {
  const store = useStore();
  const [draft, setDraft] = useState(() => initialDraft(exercise, gym));
  const newGym = applyDraft(exercise, gym, draft);

  if (exercise.load.type === "none") return null;
  const copy = COPY[exercise.load.type];

  return (
    <SetupLayout
      name={exercise.name}
      title={copy.title}
      actions={[
        {
          label: "Дальше",
          isPrimary: true,
          disabled: !newGym,
          onClick: () => newGym && updateGym(store, newGym),
        },
      ]}
    >
      <div className={s.text}>{copy.text}</div>
      <InventoryFields exercise={exercise} draft={draft} onChange={setDraft} />
    </SetupLayout>
  );
}
