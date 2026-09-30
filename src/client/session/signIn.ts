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
import { getDocumentOwner, setDocumentOwner } from "../account";
import { initStore, queryProfile, syncStoreOnce } from "../db";
import { type HistorySummary, mergeInto, summarizeHistory } from "../domain";
import {
  currentStore,
  moveToNewDocument,
  resetDevice,
  switchStore,
} from "./store.ts";

const SYNC_TIMEOUT = 20_000;
export const SIGN_IN_PATH = "/sign-in";

// Restore: the device had no workouts and simply takes the account's document.
// Merge: both had some, and the device's are added to the account's.
export type SignInState =
  | { step: "idle" }
  // Asking the server whether the account already has a document.
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

// After a sign-in and on every start with a network: an interrupted sign-in
// picks up where it stopped, and a document the server gave to somebody else
// is moved out of the way.
export function finishSignIn(): Promise<void> {
  running ??= bringAccountDocument().finally(() => {
    running = null;
  });
  return running;
}

async function bringAccountDocument() {
  setState({ step: "checking" });
  let local = currentStore();
  await local.loaded;

  let answer: { primary: string | null; local: string };
  try {
    if ((await checkSession()) !== "valid") throw new Error("no session");
    answer = await trpcClient.account.document.query({
      local: local.store.documentId,
    });
  } catch (error) {
    console.warn("sign-in could not reach the account", error);
    // Nothing to report to an anonymous person: the next start asks again.
    if (getSessionState().kind === "anonymous") {
      setState({ step: "idle" });
      return;
    }
    setState({ step: "failed" });
    showSignIn();
    return;
  }

  // The data on the device is somebody else's: another account was signed in
  // here, and whoever signs in now must not get it merged into their own.
  // It goes, and the device starts from the new account's document.
  const now = getSessionState();
  const accountId = now.kind === "account" ? (now.account.id ?? null) : null;
  const owner = getDocumentOwner();
  const foreign = owner !== null && accountId !== null && owner !== accountId;
  if (foreign) {
    await resetDevice();
    local = currentStore();
  } else if (answer.local === "taken") {
    // Another user owns the id this device holds, and the server would
    // refuse it forever. The data stays, under an id nobody has.
    await moveToNewDocument();
    local = currentStore();
  }

  // The account has no document yet, or it is this one: the next sync claims
  // or continues it. An anonymous user has nothing to merge into.
  const { primary } = answer;
  if (!accountId || !primary || primary === local.store.documentId) {
    if (accountId) setDocumentOwner(accountId);
    setState({ step: "idle" });
    return;
  }

  const phone = summarizeHistory(local.store);
  const kind = phone.workouts > 0 ? "merge" : "restore";
  setState({ step: "loading", kind });
  showSignIn();

  const target = initStore(primary);
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
  if (kind === "merge" || !accountProfile) {
    mergeInto(target.store, local.store);
  }
  await switchStore(target, accountId);

  setState(
    kind === "merge"
      ? { step: "merged", account, phone, accountProfile }
      : { step: "restored", history: summarizeHistory(target.store) },
  );
}

export function closeSignIn() {
  setState({ step: "idle" });
}

// Gives up on the account from the failure screen. The device keeps its own
// data: nothing was merged, and its workouts may exist nowhere else.
export async function abandonSignIn() {
  await signOut();
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
// anonymous one is replaced quietly, and the data moves to a new document,
// because the old id belongs to a user this device cannot act as any more. An
// account's is kept on screen as "sign in again", nothing can replace it.
export async function startSession() {
  if (!getAuthToken()) return;

  const check = await checkSession();
  if (check === "offline") return;

  const session = getSessionState();
  if (check === "rejected") {
    if (session.kind === "account") return;
    forgetSession();
    await ensureSession();
    await moveToNewDocument();
    return;
  }

  await finishSignIn();
}
