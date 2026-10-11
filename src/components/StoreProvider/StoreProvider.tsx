import { type PropsWithChildren, useRef, useState } from "react";
import { useAuth } from "../../firebase/auth.ts";
import {
  type ConnectionStatus,
  destroyStore,
  initStore,
  type Store,
} from "../../db";
import { ConnectionContext, StoreContext } from "./constants.ts";
import { SchemaGate } from "../SchemaGate";

export function StoreProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const uid = useRef<string | undefined>(undefined);
  const store = useRef<Store | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [loaded, setLoaded] = useState<string | null>(null);

  if (uid.current !== user?.uid) {
    uid.current = user?.uid;
    if (store.current) {
      destroyStore(store.current);
      store.current = null;
    }
    setStatus("disconnected");
    if (uid.current) {
      const current = uid.current;
      store.current = initStore(current, setStatus, () => setLoaded(current));
    }
  }

  return (
    <StoreContext.Provider value={store.current}>
      <ConnectionContext.Provider value={status}>
        {store.current ? (
          <SchemaGate
            store={store.current}
            loaded={loaded === uid.current}
            status={status}
          >
            {children}
          </SchemaGate>
        ) : (
          children
        )}
      </ConnectionContext.Provider>
    </StoreContext.Provider>
  );
}
