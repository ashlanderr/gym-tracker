import { collection, getEntity, insertEntity, useGetEntity } from "./db.ts";
import type { Store } from "./doc.ts";

export interface Gym {
  id: string;
  user: string;

  // Номиналы блинов, пар любого номинала считаем сколько угодно.
  plates: WeightList;

  // Все грифы зала. Берётся самый тяжёлый, который не больше нужного веса.
  bars: WeightList;

  // Несколько наборов гантелей, например 1–10 с шагом 1 и 12–48 с шагом 2.
  dumbbells: DumbbellSet[];

  // Exercise.id -> стек тренажёра. Стеки в разных тренажёрах отличаются,
  // поэтому настраиваются для каждого упражнения отдельно.
  stacks: Record<string, StackWeights>;
}

export interface WeightList {
  units: WeightUnits;
  items: number[];
}

export interface DumbbellSet {
  units: WeightUnits;
  min: number;
  max: number;
  step: number;
}

export interface StackWeights {
  units: WeightUnits;
  base: number;
  step: number;
  // Fine adjustment step: an add-on weight or a dial. Every multiple of it
  // below the main step is available.
  additional?: number;
}

export type WeightUnits = "kg" | "lb";

export const DEFAULT_WEIGHT_UNITS: WeightUnits = "kg";

// Multiple gyms are not supported yet: every user has one gym with a fixed id.
const CURRENT_GYM_ID = "current";

export function defaultGym(user: string): Gym {
  return {
    id: CURRENT_GYM_ID,
    user,
    plates: { units: "kg", items: [25, 20, 15, 10, 5, 2.5, 1.25] },
    bars: { units: "kg", items: [20] },
    dumbbells: [],
    stacks: {},
  };
}

export function queryCurrentGym(store: Store, user: string): Gym {
  return (
    getEntity<Gym>(collection(store.personal, "gyms"), CURRENT_GYM_ID) ??
    defaultGym(user)
  );
}

export function useQueryCurrentGym(store: Store, user: string): Gym {
  const gym = useGetEntity<Gym>({
    collection: collection(store.personal, "gyms"),
    id: CURRENT_GYM_ID,
    deps: [],
  });
  return gym ?? defaultGym(user);
}

export function updateGym(store: Store, entity: Gym): Gym {
  insertEntity(collection(store.personal, "gyms"), entity);
  return entity;
}
