import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { authClient, ensureSession } from "./auth.ts";
import { API_URL } from "./constants.ts";

const NATIVE_RETURN_URL = "ru.ashlanderr.gymtracker://sign-in";

function returnUrl() {
  if (Capacitor.isNativePlatform()) return NATIVE_RETURN_URL;
  const url = new URL(window.location.href);
  url.search = "";
  return url.href;
}

// The server takes over in the browser. On Android that is a Custom Tab: it
// shares Chrome's cookies, so VK ID finds its own session, and it opens inside
// the app's task, so the deep link back, arriving at the singleTask activity,
// closes it instead of leaving a browser tab behind.
export async function startVkSignIn() {
  await ensureSession();
  const { data, error } = await authClient.oneTimeToken.generate();
  if (error) throw new Error(`could not start VK sign-in: ${error.message}`);

  const url = new URL("/api/sign-in/vk", API_URL || window.location.href);
  url.searchParams.set("ott", data.token);
  url.searchParams.set("returnTo", returnUrl());
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url: url.href });
  } else {
    window.location.href = url.href;
  }
}

async function completeVkSignIn(returned: URL, onSignedIn: () => void) {
  const error = returned.searchParams.get("error");
  const ott = returned.searchParams.get("ott");
  if (error) console.warn("VK sign-in failed", error);
  if (!ott) return;

  const result = await authClient.oneTimeToken.verify({ token: ott });
  if (result.error) {
    console.warn("VK sign-in token was rejected", result.error);
    return;
  }
  onSignedIn();
}

// Returns whether this start is the web build coming back from VK, so the
// caller leaves the session alone until the new one is in place.
export function initVkSignIn(onSignedIn: () => void): boolean {
  if (Capacitor.isNativePlatform()) {
    // Retained by Capacitor until a listener comes, so a cold start through
    // the deep link is delivered here too.
    void App.addListener("appUrlOpen", ({ url }) => {
      if (url.startsWith(NATIVE_RETURN_URL))
        void completeVkSignIn(new URL(url), onSignedIn);
    });
    return false;
  }

  const returned = new URL(window.location.href);
  if (!returned.searchParams.has("ott") && !returned.searchParams.has("error"))
    return false;

  const clean = new URL(returned);
  clean.search = "";
  window.history.replaceState(null, "", clean.href);
  void completeVkSignIn(returned, onSignedIn);
  return true;
}
