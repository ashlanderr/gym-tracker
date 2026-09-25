// The stock y-websocket-server with basic auth in front of it. The auth lives here and not in the
// proxy so that the password can be kept in plain text: caddy's basic_auth only takes a hash.
import http from "node:http";
import { timingSafeEqual } from "node:crypto";
import WebSocket from "ws";
import { setupWSConnection } from "@y/websocket-server/utils";

const host = process.env.HOST || "localhost";
const port = Number(process.env.PORT || "1234");
const { BASIC_AUTH_USER, BASIC_AUTH_PASSWORD } = process.env;

if (!BASIC_AUTH_USER || !BASIC_AUTH_PASSWORD) {
  console.error("BASIC_AUTH_USER and BASIC_AUTH_PASSWORD must be set");
  process.exit(1);
}

const expected = Buffer.from(
  "Basic " + Buffer.from(`${BASIC_AUTH_USER}:${BASIC_AUTH_PASSWORD}`).toString("base64"),
);

function isAuthorized(request) {
  const actual = Buffer.from(request.headers.authorization ?? "");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const unauthorized =
  "HTTP/1.1 401 Unauthorized\r\n" +
  'WWW-Authenticate: Basic realm="Restricted Access"\r\n' +
  "Content-Length: 0\r\n" +
  "Connection: close\r\n\r\n";

const wss = new WebSocket.Server({ noServer: true });
wss.on("connection", setupWSConnection);

const server = http.createServer((request, response) => {
  // The container healthcheck has no credentials, so it gets the bare status
  if (request.url === "/health") {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("okay");
    return;
  }
  if (!isAuthorized(request)) {
    response.writeHead(401, { "WWW-Authenticate": 'Basic realm="Restricted Access"' });
    response.end();
    return;
  }
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("okay");
});

server.on("upgrade", (request, socket, head) => {
  if (!isAuthorized(request)) {
    socket.end(unauthorized);
    return;
  }
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

server.listen(port, host, () => {
  console.log(`running at '${host}' on port ${port}`);
});
