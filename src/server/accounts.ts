import { prisma } from "./prisma.ts";

// Subscriptions cascade with their owner, and Better Auth deletes the
// anonymous user right after it links an account.
export async function moveUserData(fromUserId: string, toUserId: string) {
  await prisma.subscription.updateMany({
    where: { userId: fromUserId },
    data: { userId: toUserId },
  });
}

interface SyncUser {
  id: string;
  isAnonymous?: boolean | null;
}

// An account has one document on the server, named after the account. An
// anonymous user has none: its data lives on the device only, since nothing
// but that same device could ever reach it again.
export function canSync(user: SyncUser, documentId: string): boolean {
  return !user.isAnonymous && documentId === user.id;
}

export async function ensureDocument(userId: string) {
  await prisma.document.upsert({
    where: { id: userId },
    create: { id: userId, ownerId: userId },
    update: {},
  });
}

// Documents, subscriptions and sessions cascade with the user.
export async function deleteAccount(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
}
