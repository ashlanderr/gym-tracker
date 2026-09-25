import { logSound } from "../../../../utils";

// The service worker part lives in public/timer-sw.js
navigator.serviceWorker?.addEventListener("message", (event) => {
  if (event.data?.type !== "timer-log") return;
  logSound(`sw ${event.data.event}`, event.data.data);
});

export function scheduleNotification(deadline: number) {
  requestPermission();
  postToWorker({ type: "timer-start", deadline });
}

export function cancelNotification() {
  postToWorker({ type: "timer-cancel" });
}

function requestPermission() {
  if (!("Notification" in window)) {
    logSound("notifications unsupported");
    return;
  }
  if (Notification.permission !== "default") return;

  Notification.requestPermission()
    .then((permission) => logSound("notification permission", { permission }))
    .catch((e) => logSound("notification permission failed", { error: String(e) }));
}

function postToWorker(message: object) {
  const worker = navigator.serviceWorker?.controller;
  if (!worker) {
    logSound("no service worker");
    return;
  }
  worker.postMessage(message);
}
