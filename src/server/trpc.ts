import { initTRPC, TRPCError } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import SuperJSON from "superjson";
import { auth } from "./auth.ts";
import { prisma } from "./prisma.ts";

export const createContext = async ({ req }: CreateExpressContextOptions) => {
  const session = await auth.api.getSession({
    headers: new Headers(req.headers as Record<string, string>),
  });
  return { prisma, session };
};

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({ transformer: SuperJSON });

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { user: ctx.session.user } });
});
