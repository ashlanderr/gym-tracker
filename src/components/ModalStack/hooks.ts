import type { ModalStackMethods } from "./types.ts";
import { useContext } from "react";
import { ModalStackContext } from "./constants.ts";

export function useModalStack(): ModalStackMethods {
  const context = useContext(ModalStackContext);
  if (!context) throw new Error("ModalStackContext is not provided");
  return context;
}
