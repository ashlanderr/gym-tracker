import { afterEach, describe, expect, it } from "vitest";
import * as Y from "yjs";
import { appendUpdate, COMPACT_AFTER, readState } from "./document-store.ts";
import { prisma } from "./prisma.ts";

// Talks to the development database, so `npm run db:up` has to be running.

const documentId = `test-${Date.now()}`;

async function seedOwner() {
  const user = await prisma.user.create({
    data: { id: `${documentId}-user`, name: "test", email: `${documentId}@t` },
  });
  await prisma.document.create({ data: { id: documentId, ownerId: user.id } });
}

async function countUpdates() {
  return prisma.documentUpdate.count({ where: { documentId } });
}

// Writes one update per call, the way a device does while a workout is logged.
async function record(count: number) {
  const doc = new Y.Doc();
  const updates: Uint8Array[] = [];
  doc.on("update", (update: Uint8Array) => updates.push(update));

  for (let i = 0; i < count; ++i) {
    doc.getMap("sets").set(`set-${i}`, i);
  }

  for (const update of updates) {
    await appendUpdate(documentId, update);
  }

  return doc;
}

afterEach(async () => {
  await prisma.document.deleteMany({ where: { id: documentId } });
  await prisma.user.deleteMany({ where: { id: `${documentId}-user` } });
});

describe("document store", () => {
  it("reads back what was written", async () => {
    await seedOwner();
    const written = await record(3);

    const restored = new Y.Doc();
    Y.applyUpdate(restored, (await readState(documentId))!);

    expect(restored.getMap("sets").toJSON()).toEqual(
      written.getMap("sets").toJSON(),
    );
  });

  it("merges the updates once they pile up", async () => {
    await seedOwner();
    const written = await record(COMPACT_AFTER + 5);

    expect(await countUpdates()).toBeLessThan(COMPACT_AFTER);

    const restored = new Y.Doc();
    Y.applyUpdate(restored, (await readState(documentId))!);
    expect(restored.getMap("sets").toJSON()).toEqual(
      written.getMap("sets").toJSON(),
    );
  });
});
