import { prisma } from "./prisma.ts";

// A person has one document, the one the account owns. The anonymous
// document follows the sign-in only when the account has none yet; otherwise
// it goes with the anonymous user, and the device, which holds all of it,
// merges it into the account's document itself.
export async function moveUserData(fromUserId: string, toUserId: string) {
  const owned = await accountDocument(toUserId);
  await prisma.$transaction([
    ...(owned
      ? []
      : [
          prisma.document.updateMany({
            where: { ownerId: fromUserId },
            data: { ownerId: toUserId },
          }),
        ]),
    prisma.subscription.updateMany({
      where: { userId: fromUserId },
      data: { userId: toUserId },
    }),
  ]);
}

export async function accountDocument(userId: string): Promise<string | null> {
  const document = await prisma.document.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return document?.id ?? null;
}

export type DocumentAccess = "own" | "free" | "taken";

// Whether the device may sync the document it holds. A taken one belongs to
// another user, typically an anonymous one this device no longer speaks for;
// the device then keeps its data under a new id.
export async function documentAccess(
  userId: string,
  documentId: string,
): Promise<DocumentAccess> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { ownerId: true },
  });
  if (!document) return "free";
  return document.ownerId === userId ? "own" : "taken";
}

// Documents, subscriptions and sessions cascade with the user.
export async function deleteAccount(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
}
