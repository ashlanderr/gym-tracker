import s from "./styles.module.scss";
import { clsx } from "clsx";
import {
  BottomSheet,
  type ModalProps,
  useModalStack,
  useStore,
} from "../../../../components";
import type { ChooseProgramData } from "./types.ts";
import {
  addProgram,
  generateId,
  type Program,
  useQueryAllPrograms,
} from "../../../../db";
import { MdAdd } from "react-icons/md";
import { AddProgramModal } from "../AddProgramModal";
import { FaCheckCircle, FaCircle } from "react-icons/fa";

export function ChooseProgramBottomSheet({
  data: { current },
  onCancel,
  onSubmit,
}: ModalProps<ChooseProgramData, Program | null>) {
  const store = useStore();
  const { pushModal } = useModalStack();
  const programs = useQueryAllPrograms(store);

  const options = [
    { label: "Базовая", program: undefined },
    ...programs.map((p) => ({ label: p.name, program: p })),
  ];

  const addHandler = async () => {
    const result = await pushModal(AddProgramModal, null);
    if (result) {
      const program = addProgram(store, {
        id: generateId(),
        name: result.name,
      });
      onSubmit(program);
    }
  };

  return (
    <BottomSheet isOpen={true} onClose={onCancel}>
      <div className={s.sheetHeader}>Выбор программы</div>
      <div className={s.options}>
        {options.map((p) => (
          <button
            key={p.program?.id}
            className={clsx(
              s.option,
              current?.id === p.program?.id && s.selected,
            )}
            onClick={() => onSubmit(p.program ?? null)}
          >
            {current?.id === p.program?.id ? <FaCheckCircle /> : <FaCircle />}
            {p.label}
          </button>
        ))}
        <button className={s.option} onClick={addHandler}>
          <MdAdd />
          Создать
        </button>
      </div>
    </BottomSheet>
  );
}
