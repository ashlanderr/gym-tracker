import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";

export const doc = new Y.Doc();

const DOC_NAME = "test3";

const wsProvider = new WebsocketProvider("ws://localhost:1234", "test3", doc);

wsProvider.on("status", (event) => {
  console.log("wsProvider status: " + event.status);
});

const idbProvider = new IndexeddbPersistence(DOC_NAME, doc);

idbProvider.on("synced", () => {
  console.log("idbProvider synced");
});
