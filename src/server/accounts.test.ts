import { afterEach, beforeEach, expect, it } from "vitest";
import { prisma } from "./prisma.ts";
import { accountDocument, documentAccess, moveUserData } from "./accounts.ts";

// Talks to the development database, so `npm run db:up` has to be running.

const prefix = `test-accounts-${Date.now()}`;
const anonymous = `${prefix}-anonymous`;
const vk = `${prefix}-vk`;
const documentId = `${prefix}-document`;

beforeEach(async () => {
  for (const id of [anonymous, vk]) {
    await prisma.user.create({ data: { id, name: "test", email: `${id}@t` } });
  }
  await prisma.document.create({
    data: { id: documentId, ownerId: anonymous },
  });
});

afterEach(async () => {
  await prisma.user.deleteMany({ where: { id: { startsWith: prefix } } });
});

it("keeps the document when the anonymous user is deleted after linking", async () => {
  await moveUserData(anonymous, vk);
  await prisma.user.delete({ where: { id: anonymous } });

  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });
  expect(document?.ownerId).toBe(vk);
});

it("leaves the anonymous document behind when the account already has one", async () => {
  const own = `${prefix}-own`;
  await prisma.document.create({ data: { id: own, ownerId: vk } });

  await moveUserData(anonymous, vk);
  await prisma.user.delete({ where: { id: anonymous } });

  expect(await accountDocument(vk)).toBe(own);
  expect(await prisma.document.count({ where: { ownerId: vk } })).toBe(1);
});

it("tells a device whether the document it holds is its own to sync", async () => {
  expect(await documentAccess(anonymous, documentId)).toBe("own");
  expect(await documentAccess(vk, documentId)).toBe("taken");
  expect(await documentAccess(vk, `${prefix}-nobody`)).toBe("free");
});
