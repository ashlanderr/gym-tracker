import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.ts";
import { appRouter } from "./router.ts";
import { createContext } from "./trpc.ts";
import { PORT } from "./env.ts";
import { APP_ORIGINS } from "./constants.ts";
import { listenForSync } from "./sync.ts";

const app = express();

// The Better Auth client sends credentials, which a browser refuses to pair
// with a wildcard origin, so the allowed origins have to be named.
app.use(cors({ origin: APP_ORIGINS, credentials: true }));
app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext }));
app.get("/alive", (_req, res) => {
  res.status(200).send({});
});

const server = app.listen(PORT, () => {
  console.log(`server ready at http://localhost:${PORT}`);
});

listenForSync(server);
