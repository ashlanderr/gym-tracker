import { useSyncExternalStore } from "react";
import { initStore, type LocalStore } from "../db";

const DOCUMENT_STORAGE_KEY = "DOCUMENT";

// Without an account the data lives on the device alone, under this name. With
// one it is the account's document, named after the account, and the name
// tells whose data the device holds.
export const LOCAL_DOCUMENT = "local";

function storedDocumentId(): string {
  return localStorage.getItem(DOCUMENT_STORAGE_KEY) ?? LOCAL_DOCUMENT;
}

// The document the app works on. It changes when a sign-in brings the
// account's document, and when the device is wiped; whatever shows it has to
// follow, so it lives here rather than inside a component.
let current: LocalStore | null = null;
const listeners = new Set<() => void>();

export function currentStore(): LocalStore {
  current ??= initStore(storedDocumentId());
  return current;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCurrentStore(): LocalStore {
  return useSyncExternalStore(subscribe, currentStore);
}

function show(next: LocalStore) {
  const { documentId } = next.store;
  if (documentId === LOCAL_DOCUMENT) {
    localStorage.removeItem(DOCUMENT_STORAGE_KEY);
  } else {
    localStorage.setItem(DOCUMENT_STORAGE_KEY, documentId);
  }
  current = next;
  listeners.forEach((listener) => listener());
}

// The previous document is erased from the device: by now it is either merged
// into the next one or meant to go.
export async function switchStore(next: LocalStore) {
  const previous = currentStore();
  show(next);
  await previous.erase();
}

// As after installing. The device's own document may be the one to erase, and
// the new one opens under the same name, so the old goes first.
export async function resetDevice() {
  await currentStore().erase();
  show(initStore(LOCAL_DOCUMENT));
}
