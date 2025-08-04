import { useContext } from "react";
import { StoreContext } from "./constants.ts";
import type { Store } from "../../db/doc.ts";

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error("Store not provided");
  return store;
}
