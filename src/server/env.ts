import { config } from "dotenv";
config();

export const { DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL } =
  process.env;

export const PORT = Number(process.env.PORT ?? 5000);
