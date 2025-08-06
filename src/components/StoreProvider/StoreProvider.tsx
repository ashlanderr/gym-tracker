import { type PropsWithChildren, useRef, useState } from "react";
import { useUser } from "../../firebase/auth.ts";
import {
  type ConnectionStatus,
  destroyStore,
  initStore,
  type Store,
} from "../../db/doc.ts";
import { ConnectionContext, StoreContext } from "./constants.ts";

export function StoreProvider({ children }: PropsWithChildren) {
  const user = useUser();
  const uid = useRef<string | null>(null);
  const store = useRef<Store | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  if (uid.current !== user.uid) {
    uid.current = user.uid;
    if (store.current) destroyStore(store.current);
    setStatus("disconnected");
    store.current = initStore(uid.current, setStatus);
  }

  if (!store.current) return null;

  return (
    <StoreContext.Provider value={store.current}>
      <ConnectionContext.Provider value={status}>
        {children}
      </ConnectionContext.Provider>
    </StoreContext.Provider>
  );
}
