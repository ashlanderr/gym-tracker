import { useSyncExternalStore } from "react";
import * as Y from "yjs";
import {
  getAccountId,
  getDocumentOwner,
  setAccountId,
  setDocumentOwner,
} from "../account";
import { initStore, type LocalStore } from "../db";

// The document the app works on. It changes when a sign-in brings the
// account's document, and when the device is wiped; whatever shows it has to
// follow, so it lives here rather than inside a component.
let current: LocalStore | null = null;
const listeners = new Set<() => void>();

export function currentStore(): LocalStore {
  current ??= initStore(getAccountId());
  return current;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCurrentStore(): LocalStore {
  return useSyncExternalStore(subscribe, currentStore);
}

// The previous document is erased from the device: by now it is either merged
// into the next one or meant to go.
export async function switchStore(next: LocalStore, owner: string | null) {
  const previous = currentStore();
  setAccountId(next.store.documentId);
  setDocumentOwner(owner);
  current = next;
  listeners.forEach((listener) => listener());
  await previous.erase();
}

export function newStore(): LocalStore {
  return initStore(crypto.randomUUID());
}

// As after installing.
export function resetDevice() {
  return switchStore(newStore(), null);
}

// The same data under a new id, for when the old id belongs to an account the
// server no longer lets this device into.
export async function moveToNewDocument() {
  const previous = currentStore();
  const next = newStore();
  await Promise.all([previous.loaded, next.loaded]);
  Y.applyUpdate(
    next.store.personal,
    Y.encodeStateAsUpdate(previous.store.personal),
  );
  await switchStore(next, getDocumentOwner());
}
