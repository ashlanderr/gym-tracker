import { useSyncExternalStore } from "react";
import { createAuthClient } from "better-auth/react";
import {
  anonymousClient,
  oneTimeTokenClient,
} from "better-auth/client/plugins";
import { API_URL, AUTH_TOKEN_STORAGE_KEY } from "./constants.ts";

const tokenListeners = new Set<() => void>();

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

function setAuthToken(token: string) {
  if (token === getAuthToken()) return;
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
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
