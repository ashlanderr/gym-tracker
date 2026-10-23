import s from "./styles.module.scss";
import { MdAdd } from "react-icons/md";
import type { AddMeasureTileProps } from "./types.ts";

export function AddMeasureTile({ onClick }: AddMeasureTileProps) {
  return (
    <button className={s.root} onClick={onClick}>
      <MdAdd className={s.icon} />
      Замер
    </button>
  );
}
