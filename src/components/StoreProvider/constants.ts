import { createContext } from "react";
import type { ConnectionStatus, Store } from "../../db/doc.ts";

export const StoreContext = createContext<Store | null>(null);

export const ConnectionContext = createContext<ConnectionStatus | null>(null);
