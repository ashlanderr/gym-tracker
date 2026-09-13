// Empty in the web build: Vite proxies /api and /trpc to the server in dev and
// they share an origin once deployed. The Android build is served from its own
// local origin, so it needs the absolute URL baked in.
export const API_URL = import.meta.env.VITE_API_URL ?? "";

export const AUTH_TOKEN_STORAGE_KEY = "AUTH_TOKEN";

// Resolved on use, not on import: the module is pulled in by tests that have
// no window.
export function getSyncUrl() {
  return new URL("/sync", API_URL || window.location.href).href.replace(
    /^http/,
    "ws",
  );
}
