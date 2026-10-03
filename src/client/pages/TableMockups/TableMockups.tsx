import s from "./styles.module.scss";
import { type ReactNode, useState } from "react";
import { StoreContext } from "../../components/StoreProvider/constants.ts";
import { MockWorkout, type MockWorkoutProps } from "./components";
import { createSandbox } from "./sandbox.ts";

type Screen = Omit<MockWorkoutProps, "workoutId"> & { title: string };

const LAYOUTS: Screen[] = [
  { title: "Как сейчас", layout: "page" },
  { title: "Таблетки и круглая галочка", layout: "page", hasPills: true },
  { title: "Карточки во всю ширину", layout: "cards", hasPills: true },
  { title: "Карточки с отступом", layout: "inset", hasPills: true },
];

const INVENTORY: Screen[] = [
  {
    title: "Перед ближайшим упражнением",
    layout: "cards",
    hasPills: true,
    inventory: "between",
  },
  {
    title: "Полосой в карточке",
    layout: "cards",
    hasPills: true,
    inventory: "strip",
  },
];

// Variants of the workout page side by side, drawn by the real table on a
// workout kept in memory. Reachable only by typing the address while
// developing. The screens only show: their sheets would open on the real
// document, so taps are off.
export function TableMockups() {
  const [sandbox] = useState(createSandbox);

  const renderScreen = ({ title, ...screen }: Screen) => (
    <Phone key={title} title={title}>
      <MockWorkout workoutId={sandbox.workout.id} {...screen} />
    </Phone>
  );

  return (
    <StoreContext.Provider value={sandbox.store}>
      <div className={s.root}>
        <h1 className={s.heading}>Таблица</h1>
        <p className={s.lead}>
          Ширина 366 px. Жим лёжа сделан, жим ногами на третьем подходе: в
          прошлый раз 212.5 × 15, сейчас 220 на 12 – 15.
        </p>
        <div className={s.phones}>{LAYOUTS.map(renderScreen)}</div>

        <h1 className={s.heading}>Инвентарь</h1>
        <p className={s.lead}>
          У «бабочки» неизвестен стек. Вопрос виден, пока инвентарь не указан:
          один раз на зал и на тренажёр.
        </p>
        <div className={s.phones}>{INVENTORY.map(renderScreen)}</div>
      </div>
    </StoreContext.Provider>
  );
}

function Phone({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={s.phoneBlock}>
      <div className={s.phoneTitle}>{title}</div>
      <div className={s.phone}>{children}</div>
    </section>
  );
}
