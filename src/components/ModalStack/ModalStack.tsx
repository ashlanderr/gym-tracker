import type { ModalStackMethods, ModalStackProps } from "./types.ts";
import { type ReactNode, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { generateId } from "../../db";
import { ModalStackContext } from "./constants.ts";
import { createPortal } from "react-dom";

export function ModalStack({ children }: ModalStackProps) {
  const [stack, setStack] = useState<ReactNode[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const locationRef = useRef(location);
  locationRef.current = location;

  const methods = useMemo<ModalStackMethods>(
    () => ({
      pushModal: (Modal, data) => {
        const id = generateId();
        navigate(locationRef.current, { state: id });

        return new Promise((resolve) => {
          const listener = () => {
            window.removeEventListener("popstate", listener);
            setStack((stack) => stack.slice(0, stack.length - 1));
            resolve(undefined);
          };

          window.addEventListener("popstate", listener);

          setStack((stack) => [
            ...stack,
            <Modal
              key={id}
              data={data}
              onCancel={() => {
                window.removeEventListener("popstate", listener);
                setStack((stack) => stack.slice(0, stack.length - 1));
                navigate(-1);
                resolve(undefined);
              }}
              onSubmit={(result) => {
                window.removeEventListener("popstate", listener);
                setStack((stack) => stack.slice(0, stack.length - 1));
                navigate(-1);
                resolve(result);
              }}
            />,
          ]);
        });
      },
    }),
    [navigate],
  );

  return (
    <ModalStackContext value={methods}>
      {children}
      {createPortal(stack, document.body)}
    </ModalStackContext>
  );
}
