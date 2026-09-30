import { Fragment, type PropsWithChildren, useEffect, useState } from "react";
import { type ConnectionStatus, connectStore } from "../../db";
import {
  ensureSession,
  getSyncUrl,
  useAuthToken,
  useSessionState,
} from "../../api";
import { useCurrentStore, useSignInState } from "../../session";
import { ConnectionContext, StoreContext } from "./constants.ts";

// Pages wait for the document on the device: reading it takes a moment, and
// a page that decides on an empty document, like sending a person with a
// profile to the onboarding, decides wrong.
export function StoreProvider({ children }: PropsWithChildren) {
  const { store, loaded } = useCurrentStore();
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [loadedStore, setLoadedStore] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loaded.then(() => {
      if (!cancelled) setLoadedStore(store.documentId);
    });
    return () => {
      cancelled = true;
    };
  }, [store, loaded]);

  // A token the server rejected would only knock on the door forever; the
  // settings ask the person to sign in again instead. So would the device's
  // own document while a sign-in replaces it: the account refuses a second
  // one.
  const token = useAuthToken();
  const session = useSessionState();
  const signIn = useSignInState();
  const paused =
    (session.kind === "account" && session.rejected) ||
    signIn.step === "checking" ||
    signIn.step === "loading" ||
    signIn.step === "failed";
  useEffect(() => {
    if (!token) {
      void ensureSession();
      return;
    }
    if (paused) return;
    const disconnect = connectStore(store, getSyncUrl(), token, setStatus);
    return () => {
      disconnect();
      setStatus("disconnected");
    };
  }, [store, token, paused]);

  // Keyed by the document, so pages that read it once start over when the
  // device switches to another.
  return (
    <StoreContext.Provider value={store}>
      <ConnectionContext.Provider value={status}>
        {loadedStore === store.documentId && (
          <Fragment key={store.documentId}>{children}</Fragment>
        )}
      </ConnectionContext.Provider>
    </StoreContext.Provider>
  );
}
