import { MdCalendarToday, MdPerson, MdSettings } from "react-icons/md";

// The home tab is the root of the history: every other tab sits one entry
// above it, so the back button always returns there and then leaves the app.
export const HOME_PATH = "/";

export const TABS = [
  { path: HOME_PATH, label: "Тренировки", icon: MdCalendarToday },
  { path: "/profile", label: "Профиль", icon: MdPerson },
  { path: "/settings", label: "Настройки", icon: MdSettings },
];

export const TAB_PATHS = TABS.map(({ path }) => path);
