import s from "./styles.module.scss";
import { motion } from "motion/react";
import { MdCheck } from "react-icons/md";
import { useStore } from "../../../../components";
import { queryExerciseById } from "../../../../db";
import {
  ANCHORS,
  DEFAULT_HEIGHT_CM,
  DEFAULT_WEIGHT_KG,
  EXPERIENCE_OPTIONS,
  SEX_SUMMARY,
} from "../../constants.ts";
import { QUESTIONS } from "../../questions.ts";
import { formatAnchorEntry, formatNumber } from "../../utils.ts";
import { StepLayout } from "../StepLayout";
import type { DoneStepProps } from "./types.ts";

// Reading the answers back is the receipt for a minute of somebody's time,
// and the last chance to notice a wrong number before it sets a weight.
export function DoneStep({ draft, onFinish }: DoneStepProps) {
  const store = useStore();
  const sex = draft.sex ?? "male";
  const height = draft.heightCm ?? DEFAULT_HEIGHT_CM[sex];
  const weight = draft.weightKg ?? DEFAULT_WEIGHT_KG[sex];
  const experience = EXPERIENCE_OPTIONS[sex].find(
    (option) => option.value === draft.experience,
  );

  // Exercise names are long enough to wrap on a narrow screen, so the value
  // keeps a column of its own instead of following the words.
  const rows = ANCHORS.flatMap((anchor) => {
    const entry = draft.anchors[anchor.id];
    if (!entry) return [];
    const name = queryExerciseById(store, anchor.exercise)?.name ?? anchor.id;
    return [{ name, value: formatAnchorEntry(anchor.id, entry) }];
  });

  const lines = [
    `${SEX_SUMMARY[sex]} · ${height} см · ${formatNumber(weight, 1)} кг`,
    ...(experience ? [experience.label] : []),
  ];

  return (
    <StepLayout
      icon={<MdCheck />}
      {...QUESTIONS.done}
      action={{ label: "К тренировкам", onClick: onFinish }}
    >
      <div className={s.summary}>
        {lines.map((line, index) => (
          <motion.div
            key={line}
            className={s.line}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.06 * index }}
          >
            {line}
          </motion.div>
        ))}
        {rows.map((row, index) => (
          <motion.div
            key={row.name}
            className={s.row}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.24,
              delay: 0.06 * (lines.length + index),
            }}
          >
            <span className={s.name}>{row.name}</span>
            <span className={s.value}>{row.value}</span>
          </motion.div>
        ))}
      </div>
    </StepLayout>
  );
}
