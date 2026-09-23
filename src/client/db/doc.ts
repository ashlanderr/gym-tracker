import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";

export type ConnectionStatus =
  | "synced"
  | "connected"
  | "connecting"
  | "disconnected";

export interface Store {
  documentId: string;
  personal: Y.Doc;
}

export interface LocalStore {
  store: Store;
  // Resolves once the document saved on the device is read back. Before that
  // an empty document cannot tell "nothing yet" from "nothing ever".
  loaded: Promise<unknown>;
}

// The app is local-first: the document exists and accepts writes before there
// is a network or an account. Sync is attached later, once there is a session.
export function initStore(documentId: string): LocalStore {
  const doc = new Y.Doc();
  const idbProvider = new IndexeddbPersistence(`user/${documentId}`, doc);
  return {
    store: { documentId, personal: doc },
    loaded: idbProvider.whenSynced,
  };
}

export function connectStore(
  store: Store,
  url: string,
  token: string,
  onStatusChange: (status: ConnectionStatus) => void,
) {
  const provider = new WebsocketProvider(
    url,
    store.documentId,
    store.personal,
    {
      params: { token },
    },
  );

  provider.on("status", (event: { status: ConnectionStatus }) => {
    console.log(`wsProvider [${store.documentId}]: ${event.status}`);
    onStatusChange(event.status);
  });

  provider.on("sync", (synced: boolean) => {
    if (!synced) return;
    console.log(`wsProvider [${store.documentId}]: synced`);
    onStatusChange("synced");
  });

  return () => provider.destroy();
}
