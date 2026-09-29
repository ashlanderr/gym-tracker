import { config } from "dotenv";
config();

export const { DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL } =
  process.env;

export const PORT = Number(process.env.PORT ?? 5000);

// RuStore Public API key from the console. Optional: without it the server
// runs, only subscriptions cannot be checked.
export const { RUSTORE_KEY_ID, RUSTORE_PRIVATE_KEY } = process.env;
