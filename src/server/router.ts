import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { RUSTORE_KEY_ID, RUSTORE_PRIVATE_KEY } from "./env.ts";
import {
  createRuStoreClient,
  parsePrivateKey,
  RuStoreError,
} from "./rustore.ts";
import {
  PurchaseOwnedElsewhere,
  subscriptionStatus,
  verifySubscription,
} from "./subscriptions.ts";
import { protectedProcedure, router } from "./trpc.ts";
import { accountDocument, deleteAccount, documentAccess } from "./accounts.ts";

const rustore =
  RUSTORE_KEY_ID && RUSTORE_PRIVATE_KEY
    ? createRuStoreClient({
        keyId: RUSTORE_KEY_ID,
        privateKey: parsePrivateKey(RUSTORE_PRIVATE_KEY),
      })
    : null;

export const appRouter = router({
  me: protectedProcedure.query(({ ctx }) => ({
    id: ctx.user.id,
    isAnonymous: ctx.user.isAnonymous ?? false,
  })),

  account: router({
    // The account's document, null until the first sync of any device claims
    // one, and what the server makes of the one the device holds.
    document: protectedProcedure
      .input(z.object({ local: z.string().min(1) }))
      .query(async ({ ctx, input }) => ({
        primary: await accountDocument(ctx.user.id),
        local: await documentAccess(ctx.user.id, input.local),
      })),

    delete: protectedProcedure.mutation(({ ctx }) =>
      deleteAccount(ctx.user.id),
    ),
  }),

  subscription: router({
    status: protectedProcedure.query(({ ctx }) =>
      subscriptionStatus(ctx.user.id),
    ),

    verify: protectedProcedure
      .input(
        z.object({
          productId: z.string().min(1),
          purchaseId: z.string().min(1),
          sandbox: z.boolean(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        if (!rustore) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "RuStore API key is not configured",
          });
        }
        try {
          return await verifySubscription(rustore, ctx.user.id, input);
        } catch (error) {
          if (error instanceof PurchaseOwnedElsewhere) {
            throw new TRPCError({ code: "FORBIDDEN", cause: error });
          }
          if (error instanceof RuStoreError) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: error.message,
              cause: error,
            });
          }
          throw error;
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
