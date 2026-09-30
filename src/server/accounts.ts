import { prisma } from "./prisma.ts";

// Documents and subscriptions cascade with their owner, and Better Auth
// deletes the anonymous user right after it links an account.
export async function moveUserData(fromUserId: string, toUserId: string) {
  await prisma.$transaction([
    prisma.document.updateMany({
      where: { ownerId: fromUserId },
      data: { ownerId: toUserId },
    }),
    prisma.subscription.updateMany({
      where: { userId: fromUserId },
      data: { userId: toUserId },
    }),
  ]);
}
