// Saves a document of the sync server to a file. Nothing is changed on the
// server: the empty local document has no updates to send.
//
//   npx vite-node scripts/dump-doc.ts -- wss://user:password@host user/<uid> dumps/doc.bin
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import * as Y from "yjs";
import WebSocket from "ws";
import { WebsocketProvider } from "y-websocket";

const [url, name, out] = process.argv.slice(2).filter((a) => a !== "--");
if (!url || !name || !out) {
  console.error("usage: dump-doc <server url> <document name> <output file>");
  process.exit(1);
}

const doc = new Y.Doc();
const provider = new WebsocketProvider(url, name, doc, {
  WebSocketPolyfill: WebSocket as unknown as typeof globalThis.WebSocket,
  disableBc: true,
});

provider.on("status", ({ status }) => console.log(`status: ${status}`));
provider.on("connection-error", (event) => {
  console.error(`connection failed: ${(event as ErrorEvent).message}`);
  process.exit(1);
});
provider.on("sync", (synced: boolean) => {
  if (!synced) return;
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, Y.encodeStateAsUpdate(doc));
  console.log(`saved ${out}: ${[...doc.share.keys()].join(", ")}`);
  provider.destroy();
  process.exit(0);
});
