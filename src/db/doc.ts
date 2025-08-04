import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";

export interface Store {
  shared: Y.Doc;
  personal: Y.Doc;
}

export function initStore(uid: string): Store {
  return {
    shared: initDoc("shared"),
    personal: initDoc(`user/${uid}`),
  };
}

function initDoc(name: string): Y.Doc {
  const doc = new Y.Doc();

  const wsProvider = new WebsocketProvider("ws://localhost:1234", name, doc);

  wsProvider.on("status", (event) => {
    console.log(`wsProvider [${name}]: ${event.status}`);
  });

  const idbProvider = new IndexeddbPersistence(name, doc);

  idbProvider.on("synced", () => {
    console.log(`idbProvider [${name}]: synced`);
  });

  return doc;
}

export function destroyStore(store: Store) {
  store.shared.destroy();
  store.personal.destroy();
  console.log("store destroyed");
}
