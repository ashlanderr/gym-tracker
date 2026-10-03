import s from "./styles.module.scss";
import { BottomSheet, type ModalProps, useStore } from "../../../../components";
import { type Effort, updateSet } from "../../../../db";
import { EFFORTS, FINDING_EFFORTS } from "../constants.ts";
import type { EffortSheetData } from "./types.ts";

export function EffortSheet({
  data,
  onCancel,
}: ModalProps<EffortSheetData, null>) {
  const store = useStore();
  const { set, isFinding } = data;

  const effortHandler = (effort: Effort) => {
    updateSet(store, { ...set, effort });
    onCancel();
  };

  return (
    <BottomSheet onClose={onCancel}>
      <div className={s.root}>
        <div className={s.grip} />
        <div className={s.title}>
          {isFinding ? "Подбор веса" : "Последний подход"}
        </div>
        <div className={s.question}>
          {isFinding ? "Что делаем с весом?" : "Как прошёл подход?"}
        </div>
        <div className={s.keys}>
          {(isFinding ? FINDING_EFFORTS : EFFORTS).map(({ key, label }) => (
            <button
              key={key}
              className={s.key}
              onClick={() => effortHandler(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}
