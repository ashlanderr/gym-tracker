import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "@fontsource-variable/manrope";
import "./index.css";
import { Layout } from "./pages";
import { initBackButton } from "./native";
import { queryClient, trpc, trpcClient } from "./api";

initBackButton();

// The onboarding has nowhere to keep its answers yet, so nothing can decide
// on its own whether a launch is the first one. A build made with
// VITE_START=onboarding opens on it instead of the home screen, which is how
// it gets looked at on a phone; the profile takes this over later.
if (import.meta.env.VITE_START === "onboarding" && !window.location.hash) {
  window.location.hash = "#/onboarding";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Layout />
      </QueryClientProvider>
    </trpc.Provider>
  </StrictMode>,
);
