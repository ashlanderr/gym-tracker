import { useSyncExternalStore } from "react";
import {
  checkSession,
  ensureSession,
  forgetSession,
  getAuthToken,
  getSessionState,
  getSyncUrl,
  signOut,
  trpcClient,
} from "../api";
import { initStore, queryProfile, syncStoreOnce } from "../db";
import { type HistorySummary, mergeInto, summarizeHistory } from "../domain";
import {
  currentStore,
  LOCAL_DOCUMENT,
  resetDevice,
  switchStore,
} from "./store.ts";

const SYNC_TIMEOUT = 20_000;
export const SIGN_IN_PATH = "/sign-in";

// Restore: the device had no workouts and simply takes the account's document.
// Merge: both had some, and the device's are added to the account's.
export type SignInState =
  | { step: "idle" }
  // Asking the server whether the session still stands.
  | { step: "checking" }
  | { step: "loading"; kind: "restore" | "merge" }
  | { step: "failed" }
  | { step: "restored"; history: HistorySummary }
  | {
      step: "merged";
      account: HistorySummary;
      phone: HistorySummary;
      // Whether the answers kept are the account's rather than the phone's.
      accountProfile: boolean;
    };

let state: SignInState = { step: "idle" };
const listeners = new Set<() => void>();

function setState(next: SignInState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSignInState(): SignInState {
  return useSyncExternalStore(subscribe, () => state);
}

function showSignIn() {
  if (window.location.hash !== `#${SIGN_IN_PATH}`) {
    window.location.hash = SIGN_IN_PATH;
  }
}

let running: Promise<void> | null = null;

// After a sign-in, and on a start that finds the device not yet on the
// account's document: an interrupted sign-in picks up where it stopped.
export function finishSignIn(): Promise<void> {
  running ??= bringAccountDocument().finally(() => {
    running = null;
  });
  return running;
}

async function bringAccountDocument() {
  setState({ step: "checking" });
  const local = currentStore();
  await local.loaded;

  try {
    if ((await checkSession()) !== "valid") throw new Error("no session");
  } catch (error) {
    console.warn("sign-in could not reach the account", error);
    setState({ step: "failed" });
    showSignIn();
    return;
  }

  const session = getSessionState();
  const accountId =
    session.kind === "account" ? (session.account.id ?? null) : null;
  if (!accountId || local.store.documentId === accountId) {
    setState({ step: "idle" });
    return;
  }

  // The device holds either its own anonymous data, which joins the account,
  // or another account's, which must not: it is erased with the switch.
  const own = local.store.documentId === LOCAL_DOCUMENT;
  const phone = summarizeHistory(local.store);
  const kind = own && phone.workouts > 0 ? "merge" : "restore";
  setState({ step: "loading", kind });
  showSignIn();

  const target = initStore(accountId);
  try {
    await target.loaded;
    await syncStoreOnce(
      target.store,
      getSyncUrl(),
      getAuthToken() ?? "",
      SYNC_TIMEOUT,
    );
  } catch (error) {
    console.warn("the account's document did not arrive", error);
    await target.erase();
    setState({ step: "failed" });
    return;
  }

  const account = summarizeHistory(target.store);
  const accountProfile = queryProfile(target.store) !== null;
  if (own && (kind === "merge" || !accountProfile)) {
    mergeInto(target.store, local.store);
  }
  await switchStore(target);

  // An account without workouts has nothing to report: whatever the phone
  // had simply became the account's.
  if (account.workouts === 0) {
    setState({ step: "idle" });
  } else if (kind === "merge") {
    setState({ step: "merged", account, phone, accountProfile });
  } else {
    setState({ step: "restored", history: account });
  }
}

export function closeSignIn() {
  setState({ step: "idle" });
}

// Gives up on the account from the failure screen. The device keeps its own
// data, which may exist nowhere else; another account's goes.
export async function abandonSignIn() {
  await signOut();
  if (currentStore().store.documentId !== LOCAL_DOCUMENT) await resetDevice();
  setState({ step: "idle" });
}

export async function signOutOfAccount() {
  await signOut();
  await resetDevice();
}

// With an account the server has to delete first, or the data would come
// back with the next sign-in; an anonymous user has nothing worth keeping
// there, so the device goes on without the network too.
export async function deleteEverything() {
  const signedIn = getSessionState().kind === "account";
  try {
    await trpcClient.account.delete.mutate();
  } catch (error) {
    if (signedIn) throw error;
    console.warn("the anonymous user stays on the server", error);
  }
  forgetSession();
  await resetDevice();
}

// On every start: a token the server no longer knows is dropped. An
// anonymous one is replaced quietly, the data never left the device anyway.
// An account's is kept on screen as "sign in again", nothing can replace it.
export async function startSession() {
  if (!getAuthToken()) return;

  const check = await checkSession();
  if (check === "offline") return;

  const session = getSessionState();
  if (check === "rejected") {
    if (session.kind === "account") return;
    forgetSession();
    await ensureSession();
    return;
  }

  if (
    session.kind === "account" &&
    session.account.id !== currentStore().store.documentId
  ) {
    await finishSignIn();
  }
}
