import type {
  ModalProps,
  ModalStackMethods,
  ModalStackProps,
} from "./types.ts";
import {
  type FunctionComponent,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router";
import { generateId } from "../../db";
import { ModalStackContext } from "./constants.ts";
import { createPortal } from "react-dom";

export function ModalStack({ children }: ModalStackProps) {
  const [stack, setStack] = useState<ReactNode[]>([]);
  const doNavigate = useNavigate();
  const location = useLocation();

  const locationRef = useRef(location);
  locationRef.current = location;

  const methods = useMemo<ModalStackMethods>(
    () => ({
      pushModal: <D, R>(
        Modal: FunctionComponent<ModalProps<D, R>>,
        data: D,
      ) => {
        const id = generateId();
        let result: R | undefined = undefined;

        doNavigate(locationRef.current, { state: id });

        const promise = new Promise<R | undefined>((resolve) => {
          const listener = () => {
            window.removeEventListener("popstate", listener);
            setStack((stack) => stack.slice(0, stack.length - 1));
            resolve(result);
          };

          window.addEventListener("popstate", listener);

          setStack((stack) => [
            ...stack,
            <Modal
              key={id}
              data={data}
              onCancel={async () => {
                doNavigate(-1);
                await promise;
              }}
              onSubmit={async (r) => {
                doNavigate(-1);
                result = r;
                await promise;
              }}
            />,
          ]);
        });

        return promise;
      },
    }),
    [doNavigate],
  );

  return (
    <ModalStackContext value={methods}>
      {children}
      {createPortal(stack, document.body)}
    </ModalStackContext>
  );
}
