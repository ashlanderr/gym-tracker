// Empty in the web build: Vite proxies /api and /trpc to the server in dev and
// they share an origin once deployed. The Android build is served from its own
// local origin, so it needs the absolute URL baked in.
export const API_URL = import.meta.env.VITE_API_URL ?? "";

export const AUTH_TOKEN_STORAGE_KEY = "AUTH_TOKEN";
