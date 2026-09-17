import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "@fontsource-variable/manrope";
import "./index.css";
import { Layout } from "./pages";
import { initBackButton } from "./native";
import { queryClient, trpc, trpcClient } from "./api";

initBackButton();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Layout />
      </QueryClientProvider>
    </trpc.Provider>
  </StrictMode>,
);
