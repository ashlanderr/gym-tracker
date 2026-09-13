import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

// Capacitor leaves the Android back button entirely to this plugin: with no
// listener registered the system default runs and finishes the activity, so
// the button closes the app instead of leaving a page or a modal.
//
// The app is built on browser history - HashRouter for pages, one history
// entry per modal in ModalStack - so delegating to window.history keeps the
// hardware button equivalent to the browser back button, and ModalStack
// still closes through its own popstate listener.
export function initBackButton() {
  if (!Capacitor.isNativePlatform()) return;

  void App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      void App.exitApp();
    }
  });
}
