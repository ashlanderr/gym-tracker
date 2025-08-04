import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export const doc = new Y.Doc();

const wsProvider = new WebsocketProvider("ws://localhost:1234", "test3", doc);

wsProvider.on("status", (event) => {
  console.log("status", event.status);
});
