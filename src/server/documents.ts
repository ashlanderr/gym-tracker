import * as Y from "yjs";
import { appendUpdate, readState } from "./document-store.ts";

export interface SyncDocument {
  id: string;
  doc: Y.Doc;
  connections: Set<unknown>;
}

const open = new Map<string, Promise<SyncDocument>>();

async function load(documentId: string): Promise<SyncDocument> {
  const doc = new Y.Doc();

  const state = await readState(documentId);
  if (state) Y.applyUpdate(doc, state);

  // Subscribed after the stored state is applied, so loading does not write
  // everything straight back.
  doc.on("update", (update: Uint8Array) => {
    appendUpdate(documentId, update).catch((error) =>
      console.error(`failed to store an update of ${documentId}`, error),
    );
  });

  return { id: documentId, doc, connections: new Set() };
}

// Documents are shared between the devices of one account, so a second
// connection has to reach the same in-memory document - and wait for the same
// load, rather than start its own.
export function openDocument(documentId: string): Promise<SyncDocument> {
  const existing = open.get(documentId);
  if (existing) return existing;

  const loading = load(documentId);
  open.set(documentId, loading);
  return loading;
}

export function releaseDocument(document: SyncDocument) {
  if (document.connections.size > 0) return;

  open.delete(document.id);
  document.doc.destroy();
}
