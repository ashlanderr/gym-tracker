import { type PropsWithChildren, useRef, useState } from "react";
import { useAuth } from "../../firebase/auth.ts";
import {
  type ConnectionStatus,
  destroyStore,
  initStore,
  type Store,
} from "../../db";
import { ConnectionContext, StoreContext } from "./constants.ts";

export function StoreProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const uid = useRef<string | undefined>(undefined);
  const store = useRef<Store | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  if (uid.current !== user?.uid) {
    uid.current = user?.uid;
    if (store.current) {
      destroyStore(store.current);
      store.current = null;
    }
    setStatus("disconnected");
    if (uid.current) {
      store.current = initStore(uid.current, setStatus);
    }
  }

  return (
    <StoreContext.Provider value={store.current}>
      <ConnectionContext.Provider value={status}>
        {children}
      </ConnectionContext.Provider>
    </StoreContext.Provider>
  );
}
