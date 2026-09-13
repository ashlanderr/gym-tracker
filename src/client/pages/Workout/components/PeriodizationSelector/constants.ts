import s from "./styles.module.scss";

export const MODE_OPTIONS = {
  none: {
    label: "-",
    action: "Отключить",
    description: "Тренировка без периодизации.",
    className: s.noneMode,
  },
  light: {
    label: "Легкий",
    action: "Легкий",
    description: "Сниженная нагрузка для восстановления и техники.",
    className: s.lightMode,
  },
  medium: {
    label: "Средний",
    action: "Средний",
    description: "Умеренная нагрузка для поддержания прогресса.",
    className: s.mediumMode,
  },
  heavy: {
    label: "Тяжелый",
    action: "Тяжелый",
    description: "Максимальная нагрузка для новых рекордов.",
    className: s.hardMode,
  },
};
