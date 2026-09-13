import { type PropsWithChildren, useRef, useState } from "react";
import { useAccountId } from "../../account";
import { type ConnectionStatus, initStore, type Store } from "../../db";
import { ConnectionContext, StoreContext } from "./constants.ts";

export function StoreProvider({ children }: PropsWithChildren) {
  const accountId = useAccountId();
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  // A ref, not a lazy useState: StrictMode calls the state initializer on both
  // render passes and the second document would open its own socket.
  const store = useRef<Store | null>(null);
  store.current ??= initStore(accountId, setStatus);

  return (
    <StoreContext.Provider value={store.current}>
      <ConnectionContext.Provider value={status}>
        {children}
      </ConnectionContext.Provider>
    </StoreContext.Provider>
  );
}
