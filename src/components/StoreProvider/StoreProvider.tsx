import { type PropsWithChildren, useRef } from "react";
import { useUser } from "../../firebase/auth.ts";
import { destroyStore, initStore, type Store } from "../../db/doc.ts";
import { StoreContext } from "./constants.ts";

export function StoreProvider({ children }: PropsWithChildren) {
  const user = useUser();
  const uid = useRef<string | null>(null);
  const store = useRef<Store | null>(null);

  if (uid.current !== user.uid) {
    uid.current = user.uid;
    if (store.current) destroyStore(store.current);
    store.current = initStore(uid.current);
  }

  if (!store.current) return null;

  return (
    <StoreContext.Provider value={store.current}>
      {children}
    </StoreContext.Provider>
  );
}
