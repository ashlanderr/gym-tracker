import s from "./styles.module.scss";
import { useState } from "react";
import { MdArrowBack, MdCheck } from "react-icons/md";
import { applyDraft, initialDraft, InventoryFields } from "../InventoryFields";
import type { WeightsSelectorProps } from "./types.ts";

export function WeightsSelector({
  exercise,
  gym,
  onCancel,
  onSubmit,
}: WeightsSelectorProps) {
  const [draft, setDraft] = useState(() => initialDraft(exercise, gym));
  const newGym = applyDraft(exercise, gym, draft);

  const submitHandler = () => {
    if (newGym) onSubmit(newGym);
  };

  return (
    <div className={s.root}>
      <div className={s.toolbar}>
        <button className={s.toolbarButton} onClick={onCancel}>
          <MdArrowBack />
        </button>
        <div className={s.pageTitle}>Мой инвентарь</div>
        <button
          className={s.toolbarButton}
          onClick={submitHandler}
          disabled={!newGym}
        >
          <MdCheck />
        </button>
      </div>
      <div className={s.body}>
        <InventoryFields
          exercise={exercise}
          draft={draft}
          onChange={setDraft}
        />
      </div>
    </div>
  );
}
