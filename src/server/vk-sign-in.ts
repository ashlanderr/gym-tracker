import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth.ts";
import { BETTER_AUTH_URL } from "./env.ts";
import { APP_ORIGINS, APP_PACKAGE } from "./constants.ts";

export const VK_SIGN_IN_PATH = "/api/sign-in/vk";

// Where the flow may hand the session back: the app's deep link or the web
// build. Anything else would leak a sign-in token to a foreign page.
export function isAppReturnUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return url.protocol === `${APP_PACKAGE}:` || APP_ORIGINS.includes(url.origin);
}

function withParam(base: string, name: string, value: string) {
  const url = new URL(base);
  url.searchParams.set(name, value);
  return url.href;
}

// The Android WebView cannot keep VK ID inside itself, so the flow runs in the
// system browser. It starts here, in that browser, rather than with a fetch
// from the WebView: the OAuth state cookie then lands where the callback
// arrives, and the state check stays on.
export const vkSignIn = Router();

vkSignIn.get(VK_SIGN_IN_PATH, async (req, res) => {
  const { ott, returnTo } = req.query;
  if (typeof ott !== "string" || typeof returnTo !== "string") {
    res.status(400).send("ott and returnTo are required");
    return;
  }
  if (!isAppReturnUrl(returnTo)) {
    res.status(400).send("returnTo is not the app");
    return;
  }

  try {
    const { session } = await auth.api.verifyOneTimeToken({
      body: { token: ott },
    });
    const finishUrl = withParam(
      `${BETTER_AUTH_URL}${VK_SIGN_IN_PATH}/finish`,
      "returnTo",
      returnTo,
    );
    const { headers, response } = await auth.api.signInSocial({
      body: {
        provider: "vk",
        callbackURL: finishUrl,
        errorCallbackURL: finishUrl,
      },
      headers: new Headers({ authorization: `Bearer ${session.token}` }),
      returnHeaders: true,
    });
    res.setHeader("set-cookie", headers.getSetCookie());
    res.redirect(response.url!);
  } catch (error) {
    console.warn("VK sign-in could not start", error);
    res.redirect(withParam(returnTo, "error", "start_failed"));
  }
});

vkSignIn.get(`${VK_SIGN_IN_PATH}/finish`, async (req, res) => {
  const { returnTo, error } = req.query;
  if (typeof returnTo !== "string" || !isAppReturnUrl(returnTo)) {
    res.status(400).send("returnTo is not the app");
    return;
  }
  if (typeof error === "string") {
    res.redirect(withParam(returnTo, "error", error));
    return;
  }

  try {
    const { token } = await auth.api.generateOneTimeToken({
      headers: fromNodeHeaders(req.headers),
    });
    res.redirect(withParam(returnTo, "ott", token));
  } catch (error) {
    // Names only: the values are session tokens.
    const cookies = (req.headers.cookie ?? "")
      .split(";")
      .map((cookie) => cookie.split("=")[0].trim())
      .filter(Boolean);
    console.warn("VK sign-in could not finish", error, { cookies });
    res.redirect(withParam(returnTo, "error", "finish_failed"));
  }
});
