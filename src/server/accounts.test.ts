import { afterEach, beforeEach, expect, it } from "vitest";
import { prisma } from "./prisma.ts";
import { canSync, ensureDocument, moveUserData } from "./accounts.ts";

// Talks to the development database, so `npm run db:up` has to be running.

const prefix = `test-accounts-${Date.now()}`;
const anonymous = `${prefix}-anonymous`;
const vk = `${prefix}-vk`;

beforeEach(async () => {
  for (const id of [anonymous, vk]) {
    await prisma.user.create({ data: { id, name: "test", email: `${id}@t` } });
  }
});

afterEach(async () => {
  await prisma.user.deleteMany({ where: { id: { startsWith: prefix } } });
});

it("syncs only an account's own document", () => {
  expect(canSync({ id: vk, isAnonymous: false }, vk)).toBe(true);
  expect(canSync({ id: vk, isAnonymous: false }, anonymous)).toBe(false);
  expect(canSync({ id: anonymous, isAnonymous: true }, anonymous)).toBe(false);
});

it("keeps the subscription when the anonymous user is deleted after linking", async () => {
  await prisma.subscription.create({
    data: {
      purchaseId: `${prefix}-purchase`,
      userId: anonymous,
      productId: "p",
      expiresAt: new Date(),
      sandbox: true,
    },
  });

  await moveUserData(anonymous, vk);
  await prisma.user.delete({ where: { id: anonymous } });

  const subscription = await prisma.subscription.findUnique({
    where: { purchaseId: `${prefix}-purchase` },
  });
  expect(subscription?.userId).toBe(vk);
});

it("creates the account's document once", async () => {
  await ensureDocument(vk);
  await ensureDocument(vk);

  expect(await prisma.document.count({ where: { ownerId: vk } })).toBe(1);
});
