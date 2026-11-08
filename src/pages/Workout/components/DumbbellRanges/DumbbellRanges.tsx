import { useState } from "react";
import { InventorySection } from "../InventorySection";
import { RangeFields } from "../RangeFields";
import type { RangeDraft } from "../RangeFields/types.ts";
import { WeightGrid } from "../WeightGrid";
import type { DumbbellRangesProps } from "./types.ts";
import { groupWeights, isRangeFilled, parseRange } from "./utils.ts";
import s from "./styles.module.scss";

let nextId = 1;

// The fields are kept as typed and the exclusions as tapped, so a range being
// edited neither disappears nor loses the dumbbells excluded in it.
export function DumbbellRanges({ weights, onChange }: DumbbellRangesProps) {
  const [drafts, setDrafts] = useState<RangeDraft[]>(() =>
    weights.ranges.map((range) => ({
      id: nextId++,
      from: String(range.from),
      to: String(range.to),
      step: String(range.step),
    })),
  );
  const [excluded, setExcluded] = useState(weights.excluded);

  const ranges = drafts.flatMap((draft) => parseRange(draft) ?? []);
  const groups = groupWeights(ranges);

  const update = (drafts: RangeDraft[], excluded: number[]) => {
    setDrafts(drafts);
    setExcluded(excluded);
    const ranges = drafts.flatMap((draft) => parseRange(draft) ?? []);
    const all = groupWeights(ranges).flat();
    onChange({
      ...weights,
      ranges,
      excluded: excluded.filter((weight) => all.includes(weight)),
    });
  };

  const changeHandler = (draft: RangeDraft) =>
    update(
      drafts.map((d) => (d.id === draft.id ? draft : d)),
      excluded,
    );

  const addHandler = () =>
    update([...drafts, { id: nextId++, from: "", to: "", step: "" }], excluded);

  const removeHandler = (id: number) =>
    update(
      drafts.filter((d) => d.id !== id),
      excluded,
    );

  const toggleHandler = (weight: number) =>
    update(
      drafts,
      excluded.includes(weight)
        ? excluded.filter((w) => w !== weight)
        : [...excluded, weight],
    );

  return (
    <>
      <InventorySection
        label="Ряды"
        hint="Самая лёгкая, самая тяжёлая, разница между соседними."
      >
        <div className={s.ranges}>
          {drafts.map((draft) => (
            <RangeFields
              key={draft.id}
              range={draft}
              invalid={isRangeFilled(draft) && !parseRange(draft)}
              onChange={changeHandler}
              onRemove={
                drafts.length > 1 ? () => removeHandler(draft.id) : undefined
              }
            />
          ))}
        </div>
        <button className={s.add} onClick={addHandler}>
          Добавить ряд
        </button>
      </InventorySection>
      <InventorySection
        label="Доступные гантели"
        hint={[
          "Здесь вы можете убрать гантели, которых нет в зале.",
          "Нажмите на вес, который хотите исключить.",
          "Приложение не будет их предлагать.",
        ]}
      >
        <WeightGrid
          groups={groups}
          excluded={excluded}
          onToggle={toggleHandler}
        />
      </InventorySection>
    </>
  );
}
