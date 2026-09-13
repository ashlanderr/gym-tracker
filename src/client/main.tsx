import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { Layout } from "./pages";
import { initBackButton } from "./native";
import { ensureSession, queryClient, trpc, trpcClient } from "./api";

initBackButton();
void ensureSession();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Layout />
      </QueryClientProvider>
    </trpc.Provider>
  </StrictMode>,
);
