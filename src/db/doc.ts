import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";

export type ConnectionStatus =
  | "synced"
  | "connected"
  | "connecting"
  | "disconnected";

export interface Store {
  shared: Y.Doc;
  personal: Y.Doc;
}

const BACKEND_URL_STORAGE_KEY = "BACKEND_URL";

export function getBackendUrl() {
  return (
    localStorage.getItem(BACKEND_URL_STORAGE_KEY) ||
    import.meta.env.VITE_BACKEND_URL ||
    "ws://localhost:1234"
  );
}

export function setBackendUrl(url: string) {
  localStorage.setItem(BACKEND_URL_STORAGE_KEY, url);
}

export function initStore(
  uid: string,
  onStatusChange: (status: ConnectionStatus) => void,
): Store {
  const statusMap = new Map<string, ConnectionStatus>();

  const statusHandler = (value: ConnectionStatus, name: string) => {
    statusMap.set(name, value);

    const values = [...statusMap.values()];
    const someDisconnected = values.some((v) => v === "disconnected");
    const someConnecting = values.some((v) => v === "connecting");
    const someConnected = values.some((v) => v === "connected");

    if (someDisconnected) {
      onStatusChange("disconnected");
    } else if (someConnecting) {
      onStatusChange("connecting");
    } else if (someConnected) {
      onStatusChange("connected");
    } else {
      onStatusChange("synced");
    }
  };

  return {
    shared: initDoc("shared", statusHandler),
    personal: initDoc(`user/${uid}`, statusHandler),
  };
}

function initDoc(
  name: string,
  onStatusChange: (status: ConnectionStatus, name: string) => void,
): Y.Doc {
  const doc = new Y.Doc();

  const wsProvider = new WebsocketProvider(getBackendUrl(), name, doc);

  wsProvider.on("status", (event) => {
    console.log(`wsProvider [${name}]: ${event.status}`);
    onStatusChange(event.status, name);
  });

  wsProvider.on("sync", (state) => {
    if (state) {
      console.log(`wsProvider [${name}]: synced`);
      onStatusChange("synced", name);
    }
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
