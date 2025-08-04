import { createContext } from "react";
import type { Store } from "../../db/doc.ts";

export const StoreContext = createContext<Store | null>(null);
