import type { OrderItem, PerformanceOrderProps } from "./types.ts";
import { useState } from "react";
import { useStore } from "../../../../components";
import { queryExerciseById } from "../../../../db";
import s from "./styles.module.scss";
import { MdArrowBack, MdCheck } from "react-icons/md";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
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
import { CSS } from "@dnd-kit/utilities";

export function PerformanceOrder({
  performances,
  onCancel,
  onSubmit,
}: PerformanceOrderProps) {
  const store = useStore();

  const [items, setItems] = useState<OrderItem[]>(() => {
    const items: OrderItem[] = performances.map((p) => ({
      performance: p,
      exercise: queryExerciseById(store, p.exercise),
    }));
    return items;
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((i) => i.performance.id === active.id);
      const newIndex = items.findIndex((i) => i.performance.id === over?.id);
      setItems((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const submitHandler = () => {
    const newItems = items.map((item, order) => ({
      ...item.performance,
      order,
    }));
    onSubmit(newItems);
  };

  return (
    <div className={s.root}>
      <div className={s.toolbar}>
        <button className={s.toolbarButton} onClick={onCancel}>
          <MdArrowBack />
        </button>
        <div className={s.pageTitle}>Изменить порядок</div>
        <button className={s.toolbarButton} onClick={submitHandler}>
          <MdCheck />
        </button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.performance.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={s.items}>
            {items.map((item) => (
              <SortableItem
                key={item.performance.id}
                id={item.performance.id}
                item={item}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableItem({ item, id }: { item: OrderItem; id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={s.item}
    >
      <div>{item.exercise?.name}</div>
    </div>
  );
}
