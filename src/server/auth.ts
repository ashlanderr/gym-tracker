import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { anonymous, bearer } from "better-auth/plugins";
import { prisma } from "./prisma.ts";
import { BETTER_AUTH_SECRET, BETTER_AUTH_URL } from "./env.ts";
import { APP_ORIGINS } from "./constants.ts";

export const auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  // The Android WebView serves the app from its own origin, so its requests
  // never come from baseURL and would fail the origin check.
  trustedOrigins: APP_ORIGINS,
  // The Android build is served from its own local origin and talks to another
  // host, so a session cookie would be a third-party cookie inside the
  // WebView. Sessions travel as a bearer token the client keeps itself.
  plugins: [anonymous(), bearer()],
});

export type Session = typeof auth.$Infer.Session;
