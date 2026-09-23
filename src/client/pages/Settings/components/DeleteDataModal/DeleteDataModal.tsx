import s from "./styles.module.scss";
import { useState } from "react";
import {
  ConfirmDialog,
  type ModalProps,
  useStore,
} from "../../../../components";
import { queryDataSummary } from "../../../../db";
import { DANGER_ROWS, DANGER_TEXTS } from "../../constants.ts";
import type { DangerAction } from "../../types.ts";

// Counted once, when the question is asked: the numbers are what the person
// agrees to, and they must not change under the thumb.
export function DeleteDataModal({
  data: action,
  onCancel,
  onSubmit,
}: ModalProps<DangerAction, boolean>) {
  const store = useStore();
  const [summary] = useState(() => queryDataSummary(store));
  const { title, keep, submit, waitSeconds } = DANGER_TEXTS[action];
  const rows = DANGER_ROWS[action]
    .map(({ label, count }) => ({ label, value: count(summary) }))
    .filter(({ value }) => value > 0);

  return (
    <ConfirmDialog
      title={title}
      submitLabel={submit}
      waitSeconds={waitSeconds}
      onClose={onCancel}
      onSubmit={() => onSubmit(true)}
    >
      {rows.length > 0 && (
        <div className={s.list}>
          {rows.map(({ label, value }) => (
            <div key={label} className={s.row}>
              {label}
              <b>{value.toLocaleString("ru")}</b>
            </div>
          ))}
        </div>
      )}
      <div className={s.keep}>{keep}</div>
    </ConfirmDialog>
  );
}
