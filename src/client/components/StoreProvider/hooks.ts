import { useContext } from "react";
import { ConnectionContext, StoreContext } from "./constants.ts";
import type { ConnectionStatus, Store } from "../../db/doc.ts";

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error("Store not provided");
  return store;
}

export function useConnectionStatus(): ConnectionStatus {
  const status = useContext(ConnectionContext);
  if (!status) throw new Error("ConnectionStatus is not provided");
  return status;
}
