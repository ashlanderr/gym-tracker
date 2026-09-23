import { type PropsWithChildren, useEffect, useRef, useState } from "react";
import { useAccountId } from "../../account";
import {
  type ConnectionStatus,
  connectStore,
  initStore,
  type LocalStore,
} from "../../db";
import { ensureSession, getSyncUrl } from "../../api";
import { ConnectionContext, StoreContext } from "./constants.ts";

// Pages wait for the document on the device: reading it takes a moment, and
// a page that decides on an empty document, like sending a person with a
// profile to the onboarding, decides wrong.
export function StoreProvider({ children }: PropsWithChildren) {
  const accountId = useAccountId();
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [isLoaded, setLoaded] = useState(false);

  // A ref, not a lazy useState: StrictMode calls the state initializer on both
  // render passes and the second document would open its own socket.
  const local = useRef<LocalStore | null>(null);
  local.current ??= initStore(accountId);

  const { store, loaded } = local.current;
  useEffect(() => {
    let cancelled = false;
    void loaded.then(() => {
      if (!cancelled) setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [loaded]);

  useEffect(() => {
    let disconnect: (() => void) | undefined;
    let cancelled = false;

    void ensureSession().then((token) => {
      if (cancelled || !token) return;
      disconnect = connectStore(store, getSyncUrl(), token, setStatus);
    });

    return () => {
      cancelled = true;
      disconnect?.();
    };
  }, [store]);

  return (
    <StoreContext.Provider value={store}>
      <ConnectionContext.Provider value={status}>
        {isLoaded && children}
      </ConnectionContext.Provider>
    </StoreContext.Provider>
  );
}
