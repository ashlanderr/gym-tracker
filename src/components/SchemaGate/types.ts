import type { ReactNode } from "react";
import type { ConnectionStatus, Store } from "../../db";

export interface SchemaGateProps {
  store: Store;
  loaded: boolean;
  status: ConnectionStatus;
  children: ReactNode;
}
