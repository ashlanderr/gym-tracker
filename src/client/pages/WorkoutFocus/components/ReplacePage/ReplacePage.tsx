import s from "./styles.module.scss";
import { MdArrowBack, MdChevronRight } from "react-icons/md";
import { type ModalProps, PageModal } from "../../../../components";
import { SetupLayout } from "../SetupLayout";
import type { ReplacePageData } from "./types.ts";

// A page of its own over the warning, so the back button returns to the
// question instead of leaving the workout. Picking an exercise answers it.
export function ReplacePage({
  data: { exercise, alternatives },
  onCancel,
  onSubmit,
}: ModalProps<ReplacePageData, string>) {
  return (
    <PageModal>
      <div className={s.top}>
        <button className={s.back} onClick={onCancel}>
          <MdArrowBack />
        </button>
      </div>
      <SetupLayout name={exercise.name} title="Чем заменить?" actions={[]}>
        <div className={s.options}>
          {alternatives.map((alternative) => (
            <button
              key={alternative.id}
              className={s.option}
              onClick={() => onSubmit(alternative.id)}
            >
              <span className={s.optionBody}>
                <span className={s.optionTitle}>
                  {alternative.exercise.name}
                </span>
                <span className={s.optionNote}>{alternative.benefits}</span>
              </span>
              <MdChevronRight className={s.chevron} />
            </button>
          ))}
        </div>
      </SetupLayout>
    </PageModal>
  );
}
