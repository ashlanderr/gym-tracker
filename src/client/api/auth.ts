import { createAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins";
import { API_URL, AUTH_TOKEN_STORAGE_KEY } from "./constants.ts";

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [anonymousClient()],
  fetchOptions: {
    auth: { type: "Bearer", token: () => getAuthToken() ?? "" },
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get("set-auth-token");
      if (token) localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
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
