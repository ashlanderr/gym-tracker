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

// Called once at startup and deliberately not awaited: the app is local-first
// and has to open with no network at all. A device that fails here keeps its
// data locally and gets a session on a later launch.
export async function ensureSession() {
  if (getAuthToken()) return;

  const { error } = await authClient.signIn.anonymous();
  if (error) console.warn("anonymous sign-in failed", error);
}

export function useSession() {
  return authClient.useSession();
}
