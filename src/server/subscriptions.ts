import { prisma } from "./prisma.ts";
import type { RuStoreClient } from "./rustore.ts";
import { APP_PACKAGE } from "./constants.ts";

export class PurchaseOwnedElsewhere extends Error {}

export interface SubscriptionStatus {
  active: boolean;
  expiresAt: Date | null;
}

// Asks RuStore about a purchase the app has just made or found on the
// device, and remembers the answer. A purchase belongs to the account that
// reported it first: another account sending the same id gets nothing.
export async function verifySubscription(
  rustore: Pick<RuStoreClient, "getSubscription">,
  userId: string,
  purchase: { productId: string; purchaseId: string; sandbox: boolean },
  now = new Date(),
): Promise<SubscriptionStatus> {
  const remote = await rustore.getSubscription({
    packageName: APP_PACKAGE,
    ...purchase,
  });

  const row = await prisma.subscription.upsert({
    where: { purchaseId: purchase.purchaseId },
    create: { ...purchase, userId, expiresAt: remote.expiresAt },
    update: { expiresAt: remote.expiresAt },
  });
  if (row.userId !== userId) {
    throw new PurchaseOwnedElsewhere(purchase.purchaseId);
  }

  return subscriptionStatus(userId, now);
}

export async function subscriptionStatus(
  userId: string,
  now = new Date(),
): Promise<SubscriptionStatus> {
  const latest = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { expiresAt: "desc" },
  });
  return {
    active: latest !== null && latest.expiresAt > now,
    expiresAt: latest?.expiresAt ?? null,
  };
}
