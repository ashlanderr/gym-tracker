import type { Server } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import * as syncProtocol from "y-protocols/sync";
import { auth } from "./auth.ts";
import { prisma } from "./prisma.ts";
import {
  openDocument,
  releaseDocument,
  type SyncDocument,
} from "./documents.ts";

export const SYNC_PATH = "/sync/";

const DOCUMENT_ID = /^[A-Za-z0-9_-]{1,64}$/;

// y-websocket multiplexes two protocols over one socket. Awareness carries
// presence for collaborative editing, which a personal training log has no use
// for, so it is passed between the devices of an account untouched.
const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;

const PING_INTERVAL = 30_000;

const wss = new WebSocketServer({ noServer: true });

// A browser cannot set headers on a WebSocket, so the session token travels in
// the query string. It stays on our own server, which does not log it.
async function authorize(url: URL): Promise<string | null> {
  const documentId = url.pathname.slice(SYNC_PATH.length);
  const token = url.searchParams.get("token");
  if (!DOCUMENT_ID.test(documentId) || !token) return null;

  const session = await auth.api.getSession({
    headers: new Headers({ authorization: `Bearer ${token}` }),
  });
  if (!session) return null;

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { ownerId: true },
  });

  // The first connection claims the document: its id was generated on the
  // device back when it had no account at all.
  if (!document) {
    await prisma.document.create({
      data: { id: documentId, ownerId: session.user.id },
    });
    return documentId;
  }

  return document.ownerId === session.user.id ? documentId : null;
}

function broadcast(
  document: SyncDocument,
  message: Uint8Array,
  from: WebSocket,
) {
  for (const connection of document.connections) {
    const other = connection as WebSocket;
    if (other !== from && other.readyState === other.OPEN) other.send(message);
  }
}

function handleMessage(
  document: SyncDocument,
  connection: WebSocket,
  data: Uint8Array,
) {
  const decoder = decoding.createDecoder(data);

  switch (decoding.readVarUint(decoder)) {
    case MESSAGE_SYNC: {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_SYNC);
      const type = syncProtocol.readSyncMessage(
        decoder,
        encoder,
        document.doc,
        connection,
      );

      // Length 1 means the reply holds nothing but the message type.
      if (encoding.length(encoder) > 1) {
        connection.send(encoding.toUint8Array(encoder));
      }

      // Only messages that carry changes are worth relaying; a request for
      // the state of a peer is not.
      if (
        type === syncProtocol.messageYjsUpdate ||
        type === syncProtocol.messageYjsSyncStep2
      ) {
        broadcast(document, data, connection);
      }
      break;
    }

    case MESSAGE_AWARENESS:
      broadcast(document, data, connection);
      break;
  }
}

function accept(document: SyncDocument, connection: WebSocket) {
  document.connections.add(connection);

  connection.on("message", (data: ArrayBuffer) =>
    handleMessage(document, connection, new Uint8Array(data)),
  );

  let alive = true;
  const ping = setInterval(() => {
    if (!alive) return connection.terminate();
    alive = false;
    connection.ping();
  }, PING_INTERVAL);

  connection.on("pong", () => {
    alive = true;
  });

  connection.on("close", () => {
    clearInterval(ping);
    document.connections.delete(connection);
    releaseDocument(document);
  });

  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, MESSAGE_SYNC);
  syncProtocol.writeSyncStep1(encoder, document.doc);
  connection.send(encoding.toUint8Array(encoder));
}

export function listenForSync(server: Server) {
  server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url ?? "", "http://localhost");

    if (!url.pathname.startsWith(SYNC_PATH)) {
      socket.destroy();
      return;
    }

    void (async () => {
      const documentId = await authorize(url);
      if (!documentId) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      const document = await openDocument(documentId);
      wss.handleUpgrade(req, socket, head, (connection) => {
        connection.binaryType = "arraybuffer";
        accept(document, connection);
      });
    })().catch((error) => {
      console.error("sync upgrade failed", error);
      socket.destroy();
    });
  });
}
