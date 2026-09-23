import s from "./styles.module.scss";
import { clsx } from "clsx";
import { Outlet, useLocation } from "react-router";
import { TABS } from "./constants.ts";
import { useSelectTab } from "./hooks.ts";

export function Tabs() {
  const { pathname } = useLocation();
  const selectTab = useSelectTab();

  return (
    <div className={s.root}>
      <div className={s.page}>
        <Outlet />
      </div>
      <nav className={s.bar}>
        {TABS.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            className={clsx(s.tab, path === pathname && s.current)}
            onClick={() => selectTab(path)}
          >
            <Icon className={s.icon} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
