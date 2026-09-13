// Reads the console of the app running on a connected Android device, and
// optionally runs an expression inside it.
//
//   npm run webview:log
//   npm run webview:log -- --eval "fetch('/alive').then(r => r.status)"
//
// This exists because logcat is closed on some vendor builds, so the usual
// `adb logcat | grep chromium` shows nothing. A debug build of the WebView
// still opens a DevTools socket, which works everywhere and can do more.

import { execFileSync } from "node:child_process";
import { join } from "node:path";

const PORT = 9222;

const adbPath = process.env.ANDROID_HOME
  ? join(process.env.ANDROID_HOME, "platform-tools", "adb")
  : "adb";

function adb(...args) {
  return execFileSync(adbPath, args, { encoding: "utf8" });
}

function findDevToolsSocket() {
  const sockets = adb("shell", "cat", "/proc/net/unix");
  const names = [...sockets.matchAll(/webview_devtools_remote_\d+/g)].map(
    (match) => match[0],
  );
  const unique = [...new Set(names)];

  if (unique.length === 0) {
    throw new Error(
      "No WebView DevTools socket. Start the app on the device, and make " +
        "sure it is a debug build.",
    );
  }
  return unique[unique.length - 1];
}

async function findPage() {
  const response = await fetch(`http://localhost:${PORT}/json`);
  const targets = await response.json();
  const page = targets.find((target) => target.type === "page");
  if (!page) throw new Error("The WebView has no page open.");
  return page;
}

function describe(remoteObject) {
  return remoteObject?.value ?? remoteObject?.description ?? remoteObject?.type;
}

const socket = findDevToolsSocket();
adb("forward", `tcp:${PORT}`, `localabstract:${socket}`);

const page = await findPage();
console.log(`${page.title} — ${page.url}\n`);

const ws = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let lastId = 0;

function send(method, params = {}) {
  const id = ++lastId;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve) => pending.set(id, resolve));
}

ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);

  if (message.id) {
    pending.get(message.id)?.(message);
    pending.delete(message.id);
    return;
  }

  if (message.method === "Runtime.consoleAPICalled") {
    const text = message.params.args.map(describe).join(" ");
    console.log(`[${message.params.type}] ${text}`);
  } else if (message.method === "Log.entryAdded") {
    const { level, text, url } = message.params.entry;
    console.log(`[${level}] ${text}${url ? ` @ ${url}` : ""}`);
  } else if (message.method === "Runtime.exceptionThrown") {
    const { exceptionDetails } = message.params;
    console.log(
      `[exception] ${describe(exceptionDetails.exception) ?? exceptionDetails.text}`,
    );
  }
});

ws.addEventListener("open", async () => {
  await send("Runtime.enable");
  await send("Log.enable");

  const evalIndex = process.argv.indexOf("--eval");
  if (evalIndex === -1) {
    console.log("Listening. Ctrl+C to stop.\n");
    return;
  }

  const { result } = await send("Runtime.evaluate", {
    expression: process.argv[evalIndex + 1],
    awaitPromise: true,
    returnByValue: true,
  });
  console.log(describe(result.result));
  ws.close();
});
