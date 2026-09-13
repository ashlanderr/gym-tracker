import type { FunctionComponent, ReactNode } from "react";

export interface ModalStackProps {
  children: ReactNode;
}

export interface ModalProps<D, R> {
  data: D;
  onCancel: () => Promise<void> | void;
  onSubmit: (result: R) => Promise<void> | void;
}

export interface ModalStackMethods {
  pushModal: <D, R>(
    modal: FunctionComponent<ModalProps<D, R>>,
    data: D,
  ) => Promise<R | undefined>;
}
