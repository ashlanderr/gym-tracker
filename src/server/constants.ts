// The Android application id, the same in RuStore.
export const APP_PACKAGE = "ru.ashlanderr.gymtracker";

// Origins the app itself is served from. Android runs the WebView on
// https://localhost, iOS would use capacitor://localhost, and the web build in
// development talks to the server through the Vite proxy.
export const APP_ORIGINS = [
  "https://localhost",
  "http://localhost",
  "capacitor://localhost",
  "http://localhost:5173",
];
