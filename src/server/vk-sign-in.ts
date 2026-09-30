import { type Response, Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth.ts";
import { BETTER_AUTH_URL } from "./env.ts";
import { APP_ORIGINS, APP_PACKAGE } from "./constants.ts";
import { logVk } from "./vk-log.ts";

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

// The browser may still hold a session cookie from an earlier sign-in, for a
// session the app has signed out of since. Brought to the callback, it makes
// the anonymous plugin look it up, and Better Auth answers a dead session by
// expiring the session cookie - in the same response that has just set the
// new one. The browser is left with none and the finish step fails. The app
// never uses the browser's session, so the flow starts without one.
async function clearSessionCookies(res: Response) {
  const { authCookies } = await auth.$context;
  const cookies = [
    authCookies.sessionToken,
    authCookies.sessionData,
    authCookies.dontRememberToken,
  ];
  for (const { name, attributes } of cookies) {
    res.clearCookie(name, {
      path: attributes.path ?? "/",
      secure: attributes.secure,
      httpOnly: attributes.httpOnly,
      sameSite: attributes.sameSite?.toLowerCase() as "lax" | "strict" | "none",
    });
  }
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
    await clearSessionCookies(res);
    logVk("start", {
      userId: session.userId,
      returnTo: new URL(returnTo).protocol,
    });
    res.redirect(response.url!);
  } catch (error) {
    logVk("start failed", { error: String(error) });
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
    logVk("callback returned an error", { error });
    res.redirect(withParam(returnTo, "error", error));
    return;
  }

  try {
    const headers = fromNodeHeaders(req.headers);
    const session = await auth.api.getSession({ headers });
    const { token } = await auth.api.generateOneTimeToken({ headers });
    logVk("finish", {
      userId: session?.user.id,
      anonymous: session?.user.isAnonymous ?? null,
    });
    res.redirect(withParam(returnTo, "ott", token));
  } catch (error) {
    // Names only: the values are session tokens.
    const cookies = (req.headers.cookie ?? "")
      .split(";")
      .map((cookie) => cookie.split("=")[0].trim())
      .filter(Boolean);
    logVk("finish failed", { error: String(error), cookies });
    res.redirect(withParam(returnTo, "error", "finish_failed"));
  }
});
