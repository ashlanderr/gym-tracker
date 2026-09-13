import { type PropsWithChildren, useEffect, useRef, useState } from "react";
import { useAccountId } from "../../account";
import {
  type ConnectionStatus,
  connectStore,
  initStore,
  type Store,
} from "../../db";
import { ensureSession, getSyncUrl } from "../../api";
import { ConnectionContext, StoreContext } from "./constants.ts";

export function StoreProvider({ children }: PropsWithChildren) {
  const accountId = useAccountId();
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  // A ref, not a lazy useState: StrictMode calls the state initializer on both
  // render passes and the second document would open its own socket.
  const store = useRef<Store | null>(null);
  store.current ??= initStore(accountId);

  const current = store.current;
  useEffect(() => {
    let disconnect: (() => void) | undefined;
    let cancelled = false;

    void ensureSession().then((token) => {
      if (cancelled || !token) return;
      disconnect = connectStore(current, getSyncUrl(), token, setStatus);
    });

    return () => {
      cancelled = true;
      disconnect?.();
    };
  }, [current]);

  return (
    <StoreContext.Provider value={current}>
      <ConnectionContext.Provider value={status}>
        {children}
      </ConnectionContext.Provider>
    </StoreContext.Provider>
  );
}
