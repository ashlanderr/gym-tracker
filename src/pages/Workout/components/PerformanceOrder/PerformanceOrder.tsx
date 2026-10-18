import s from "./styles.module.scss";
import { useState } from "react";
import { clsx } from "clsx";
import { MdCheck, MdDragIndicator } from "react-icons/md";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import {
  HeaderButton,
  type ModalProps,
  PageHeader,
  PageModal,
  useStore,
} from "../../../../components";
import { type Performance, queryExerciseById } from "../../../../db";
import { MUSCLES_TRANSLATION } from "../../../constants.ts";
import type { OrderItem } from "./types.ts";
import { MOUSE_DISTANCE, TOUCH_DELAY, TOUCH_TOLERANCE } from "./constants.ts";

export function PerformanceOrder({
  data,
  onCancel,
  onSubmit,
}: ModalProps<Performance[], Performance[]>) {
  const store = useStore();
  const [items, setItems] = useState<OrderItem[]>(() =>
    data.map((performance) => ({
      performance,
      exercise: queryExerciseById(store, performance.exercise),
    })),
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: MOUSE_DISTANCE },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: TOUCH_DELAY, tolerance: TOUCH_TOLERANCE },
    }),
  );

  const dragEndHandler = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setItems((items) =>
      arrayMove(
        items,
        items.findIndex((i) => i.performance.id === active.id),
        items.findIndex((i) => i.performance.id === over.id),
      ),
    );
  };

  const submitHandler = () => {
    onSubmit(items.map((item, order) => ({ ...item.performance, order })));
  };

  return (
    <PageModal>
      <div className={s.root}>
        <PageHeader
          title="Порядок выполнения"
          onBack={onCancel}
          right={
            <HeaderButton onClick={submitHandler}>
              <MdCheck />
            </HeaderButton>
          }
        />
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragStart={() => navigator.vibrate?.(15)}
          onDragEnd={dragEndHandler}
        >
          <SortableContext
            items={items.map((i) => i.performance.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className={s.items}>
              {items.map((item, index) => (
                <SortableItem
                  key={item.performance.id}
                  item={item}
                  number={index + 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </PageModal>
  );
}

function SortableItem({ item, number }: { item: OrderItem; number: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.performance.id });
  const muscle = item.exercise?.muscles[0];

  return (
    <div
      ref={setNodeRef}
      className={clsx(s.item, isDragging && s.lifted)}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <span className={s.number}>{number}</span>
      <div className={s.titles}>
        <div className={s.name}>{item.exercise?.name ?? "–"}</div>
        {muscle && (
          <div className={s.muscle}>{MUSCLES_TRANSLATION[muscle]}</div>
        )}
      </div>
      <MdDragIndicator className={s.handle} />
    </div>
  );
}
