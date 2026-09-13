import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.ts";
import { appRouter } from "./router.ts";
import { createContext } from "./trpc.ts";
import { PORT } from "./env.ts";

const app = express();

app.use(cors());
app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext }));
app.get("/alive", (_req, res) => {
  res.status(200).send({});
});

app.listen(PORT, () => {
  console.log(`server ready at http://localhost:${PORT}`);
});
