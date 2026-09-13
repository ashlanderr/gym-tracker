import * as Y from "yjs";
import { prisma } from "./prisma.ts";

// How many appended updates are allowed before they are merged into one row.
// Every update is its own insert, which trades a little write amplification
// for a document that does not grow a row per checked-off set forever.
export const COMPACT_AFTER = 100;

export async function readState(
  documentId: string,
): Promise<Uint8Array | null> {
  const rows = await prisma.documentUpdate.findMany({
    where: { documentId },
    orderBy: { id: "asc" },
    select: { update: true },
  });

  if (rows.length === 0) return null;
  return Y.mergeUpdates(rows.map((row) => row.update));
}

export async function appendUpdate(documentId: string, update: Uint8Array) {
  const count = await prisma.documentUpdate.count({ where: { documentId } });
  await prisma.documentUpdate.create({
    data: { documentId, update: Buffer.from(update) },
  });

  if (count + 1 > COMPACT_AFTER) await compact(documentId);
}

// Merges what has been written so far into a single row. Updates that arrive
// while this runs keep their own rows: Yjs applies updates in any order, so
// they do not have to stay behind the merged one.
export async function compact(documentId: string) {
  await prisma.$transaction(async (tx) => {
    const rows = await tx.documentUpdate.findMany({
      where: { documentId },
      orderBy: { id: "asc" },
    });
    if (rows.length <= 1) return;

    const merged = Y.mergeUpdates(rows.map((row) => row.update));
    await tx.documentUpdate.deleteMany({
      where: { documentId, id: { lte: rows[rows.length - 1].id } },
    });
    await tx.documentUpdate.create({
      data: { documentId, update: Buffer.from(merged) },
    });
  });
}
