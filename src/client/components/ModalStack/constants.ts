import { createContext } from "react";
import type { ModalStackMethods } from "./types.ts";

export const ModalStackContext = createContext<ModalStackMethods | null>(null);
