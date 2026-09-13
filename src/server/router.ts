import { protectedProcedure, router } from "./trpc.ts";

export const appRouter = router({
  me: protectedProcedure.query(({ ctx }) => ({
    id: ctx.user.id,
    isAnonymous: ctx.user.isAnonymous ?? false,
  })),
});

export type AppRouter = typeof appRouter;
