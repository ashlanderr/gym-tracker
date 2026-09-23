import { useLocation, useNavigate } from "react-router";
import { HOME_PATH } from "./constants.ts";

// Switching tabs never stacks up: home pushes one entry, the other tabs
// replace it, and going home pops it. A tab opened as the very first entry
// has no home under it to pop back to.
export function useSelectTab() {
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname;

  return (path: string) => {
    if (path === current) return;

    if (current === HOME_PATH) {
      navigate(path);
    } else if (path !== HOME_PATH) {
      navigate(path, { replace: true });
    } else if (location.key === "default") {
      navigate(HOME_PATH, { replace: true });
    } else {
      navigate(-1);
    }
  };
}
