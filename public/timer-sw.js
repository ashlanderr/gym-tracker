// Rest timer notification, imported into the generated service worker (see vite.config.ts).
// The page is frozen in the background and can't play the sound in time, so the worker
// keeps the message event alive until the deadline and shows a notification itself.

const TIMER_NOTIFICATION_TAG = "rest-timer";

let cancelTimer = null;

self.addEventListener("message", (event) => {
  const message = event.data;
  if (message?.type === "timer-start") {
    cancelTimer?.();
    event.waitUntil(
      closeTimerNotifications().then(() => waitForDeadline(message.deadline)),
    );
  } else if (message?.type === "timer-cancel") {
    cancelTimer?.();
    event.waitUntil(closeTimerNotifications());
  }
});

self.addEventListener("notificationclick", (event) => {
  if (event.notification.tag !== TIMER_NOTIFICATION_TAG) return;
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: "window" })
      .then((windows) =>
        windows.length > 0
          ? windows[0].focus()
          : self.clients.openWindow(self.registration.scope),
      ),
  );
});

function waitForDeadline(deadline) {
  return new Promise((resolve) => {
    const delayMs = deadline - Date.now();
    const timeout = setTimeout(() => {
      cancelTimer = null;
      notify(deadline).finally(resolve);
    }, delayMs);

    cancelTimer = () => {
      clearTimeout(timeout);
      cancelTimer = null;
      log("cancelled", { remainingMs: deadline - Date.now() });
      resolve();
    };
    log("scheduled", { delayMs });
  });
}

async function notify(deadline) {
  const lateMs = Date.now() - deadline;
  const windows = await self.clients.matchAll({ type: "window" });
  if (windows.some((client) => client.visibilityState === "visible")) {
    // The page is on screen and plays the sound itself
    await log("skipped, page visible", { lateMs });
    return;
  }
  if (Notification.permission !== "granted") {
    await log("no permission", { lateMs, permission: Notification.permission });
    return;
  }

  try {
    await self.registration.showNotification("Отдых окончен", {
      tag: TIMER_NOTIFICATION_TAG,
      renotify: true,
      icon: "pwa-192x192.png",
      vibrate: [300, 150, 300, 150, 300],
    });
    await log("notification shown", { lateMs });
  } catch (e) {
    await log("notification failed", { lateMs, error: String(e) });
  }
}

async function closeTimerNotifications() {
  const notifications = await self.registration.getNotifications({
    tag: TIMER_NOTIFICATION_TAG,
  });
  notifications.forEach((notification) => notification.close());
}

// Frozen pages receive these messages only after they resume, so the worker's own time is attached
async function log(event, data) {
  const date = new Date();
  const ms = date.getMilliseconds().toString().padStart(3, "0");
  const swTime = `${date.toLocaleTimeString("sv")}.${ms}`;
  const windows = await self.clients.matchAll({ type: "window" });
  windows.forEach((client) =>
    client.postMessage({ type: "timer-log", event, data: { ...data, swTime } }),
  );
}
