import { useSyncExternalStore } from "react";
import { createAuthClient } from "better-auth/react";
import {
  anonymousClient,
  oneTimeTokenClient,
} from "better-auth/client/plugins";
import {
  ACCOUNT_STORAGE_KEY,
  API_URL,
  AUTH_TOKEN_STORAGE_KEY,
} from "./constants.ts";

const tokenListeners = new Set<() => void>();

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

function setAuthToken(token: string | null) {
  if (token === getAuthToken()) return;
  if (token) {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
  tokenListeners.forEach((listener) => listener());
}

function subscribeAuthToken(listener: () => void) {
  tokenListeners.add(listener);
  return () => tokenListeners.delete(listener);
}

// Signing in with VK replaces the session, and whatever talks to the server
// with the old token has to reconnect as the new user.
export function useAuthToken() {
  return useSyncExternalStore(subscribeAuthToken, getAuthToken);
}

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [anonymousClient(), oneTimeTokenClient()],
  fetchOptions: {
    auth: { type: "Bearer", token: () => getAuthToken() ?? "" },
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get("set-auth-token");
      if (token) setAuthToken(token);
    },
  },
});

async function signInAnonymously(): Promise<string | null> {
  const { error } = await authClient.signIn.anonymous();
  if (error) {
    console.warn("anonymous sign-in failed", error);
    return null;
  }
  return getAuthToken();
}

let signingIn: Promise<string | null> | null = null;

// The app is local-first and opens with no network at all, so a failure here
// only means the device keeps working locally and gets a session later.
// Callers are not coordinated - StrictMode alone calls this twice - and every
// concurrent call has to end up on the same account, not one account each.
export function ensureSession(): Promise<string | null> {
  const stored = getAuthToken();
  if (stored) return Promise.resolve(stored);

  signingIn ??= signInAnonymously().finally(() => {
    signingIn = null;
  });

  return signingIn;
}

// Who is signed in, as last heard from the server. Kept on the device because
// the app starts without a network as often as with one, and the profile and
// the settings must look the same either way.
export interface Account {
  name: string;
  email: string;
  image: string | null;
}

export type SessionState =
  | { kind: "anonymous" }
  // Rejected: the server no longer knows the token, and nothing is saved to
  // the account until the person signs in again.
  | { kind: "account"; account: Account; rejected: boolean };

const ANONYMOUS: SessionState = { kind: "anonymous" };

const stateListeners = new Set<() => void>();
let cachedState: { raw: string | null; state: SessionState } | null = null;

export function getSessionState(): SessionState {
  const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
  if (cachedState?.raw !== raw) {
    cachedState = { raw, state: raw ? JSON.parse(raw) : ANONYMOUS };
  }
  return cachedState.state;
}

function setSessionState(state: SessionState) {
  if (state.kind === "anonymous") {
    localStorage.removeItem(ACCOUNT_STORAGE_KEY);
  } else {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(state));
  }
  stateListeners.forEach((listener) => listener());
}

function subscribeSessionState(listener: () => void) {
  stateListeners.add(listener);
  return () => stateListeners.delete(listener);
}

export function useSessionState() {
  return useSyncExternalStore(subscribeSessionState, getSessionState);
}

export type SessionCheck = "valid" | "rejected" | "offline";

// Asks the server whether the stored token still stands and refreshes what
// the device knows about the account.
export async function checkSession(): Promise<SessionCheck> {
  if (!getAuthToken()) return "rejected";

  const { data, error } = await authClient.getSession();
  if (error && error.status !== 401) return "offline";

  if (!data) {
    const state = getSessionState();
    if (state.kind === "account") setSessionState({ ...state, rejected: true });
    return "rejected";
  }

  setSessionState(
    data.user.isAnonymous
      ? ANONYMOUS
      : {
          kind: "account",
          account: {
            name: data.user.name,
            email: data.user.email,
            image: data.user.image ?? null,
          },
          rejected: false,
        },
  );
  return "valid";
}

// Forgets the session on the device. The server side is the caller's: a
// sign-out ends it there, a deleted account takes it along.
export function forgetSession() {
  setSessionState(ANONYMOUS);
  setAuthToken(null);
}

export async function signOut() {
  await authClient.signOut().catch((error: unknown) => {
    console.warn("sign-out did not reach the server", error);
  });
  forgetSession();
}
