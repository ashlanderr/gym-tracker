import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "./prisma.ts";
import type { RuStoreClient } from "./rustore.ts";
import {
  PurchaseOwnedElsewhere,
  subscriptionStatus,
  verifySubscription,
} from "./subscriptions.ts";

// Talks to the development database, so `npm run db:up` has to be running.

const prefix = `test-sub-${Date.now()}`;
const alice = `${prefix}-alice`;
const bob = `${prefix}-bob`;
const now = new Date("2026-09-29T11:00:00Z");

function rustoreExpiringAt(expiresAt: Date): RuStoreClient {
  return {
    getSubscription: async () => ({
      startsAt: now,
      expiresAt,
      autoRenewing: true,
      paymentState: 1,
    }),
  };
}

const purchase = {
  productId: "premium_month",
  purchaseId: `${prefix}-purchase`,
  sandbox: false,
};

beforeEach(async () => {
  for (const id of [alice, bob]) {
    await prisma.user.create({ data: { id, name: "test", email: `${id}@t` } });
  }
});

afterEach(async () => {
  await prisma.user.deleteMany({ where: { id: { in: [alice, bob] } } });
});

describe("verifySubscription", () => {
  it("unlocks the account until RuStore says it expires", async () => {
    const expiresAt = new Date("2026-10-29T11:00:00Z");

    const status = await verifySubscription(
      rustoreExpiringAt(expiresAt),
      alice,
      purchase,
      now,
    );

    expect(status).toEqual({ active: true, expiresAt });
    const later = new Date(expiresAt.getTime() + 1);
    expect((await subscriptionStatus(alice, later)).active).toBe(false);
  });

  it("does not let a second account claim the same purchase", async () => {
    const rustore = rustoreExpiringAt(new Date("2026-10-29T11:00:00Z"));
    await verifySubscription(rustore, alice, purchase, now);

    await expect(
      verifySubscription(rustore, bob, purchase, now),
    ).rejects.toBeInstanceOf(PurchaseOwnedElsewhere);
    expect((await subscriptionStatus(bob, now)).active).toBe(false);
  });
});
