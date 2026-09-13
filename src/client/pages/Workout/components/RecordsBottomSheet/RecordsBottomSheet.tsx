import s from "./styles.module.scss";
import { RECORDS_TRANSLATION } from "../../../constants.ts";
import { formatRecordValue } from "../../../../domain";
import { clsx } from "clsx";
import { MdArrowDownward, MdArrowUpward } from "react-icons/md";
import { BottomSheet, type ModalProps } from "../../../../components";
import type { Record } from "../../../../db";

export function RecordsBottomSheet({
  data,
  onCancel,
}: ModalProps<Record[], null>) {
  return (
    <BottomSheet isOpen={true} onClose={onCancel}>
      <div className={s.sheetHeader}>Новый рекорд</div>
      <div className={s.sheetRecords}>
        {data.map((r) => (
          <div className={s.sheetRecord} key={r.type}>
            <div className={s.recordType}>{RECORDS_TRANSLATION[r.type]}</div>
            <div className={s.recordValue}>{formatRecordValue(r.current)}</div>
            {r.previous !== undefined && (
              <div
                className={clsx({
                  [s.recordDelta]: true,
                  [s.increment]: r.current > r.previous,
                  [s.decrement]: r.current < r.previous,
                })}
              >
                {r.current > r.previous ? (
                  <MdArrowUpward />
                ) : (
                  <MdArrowDownward />
                )}
                {formatRecordValue(Math.abs(r.current - r.previous))}
              </div>
            )}
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}
