import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useModalStack, useStore } from "../../components";
import { useQueryDataSummary } from "../../db";
import {
  deleteAllData,
  deleteWorkoutHistory,
  resetRecords,
} from "../../domain";
import { pluralize } from "../../utils";
import { APP_VERSION } from "../Home/constants.ts";
import { HOME_PATH, useSelectTab } from "../Tabs";
import { DeleteDataModal } from "./components";
import { RECORD_FORMS, WORKOUT_FORMS } from "./constants.ts";
import type { DangerAction } from "./types.ts";

// Everything that is not about the person: that lives in the profile.
export function Settings() {
  const store = useStore();
  const { pushModal } = useModalStack();
  const selectTab = useSelectTab();
  const summary = useQueryDataSummary(store);

  const dangerHandler = async (action: DangerAction) => {
    const confirmed = await pushModal(DeleteDataModal, action);
    if (!confirmed) return;

    switch (action) {
      case "records":
        resetRecords(store);
        break;
      case "history":
        deleteWorkoutHistory(store);
        break;
      case "all":
        deleteAllData(store);
        // Home finds no profile and hands over to the onboarding.
        selectTab(HOME_PATH);
        break;
    }
  };

  return (
    <div className={s.root}>
      <div className={s.title}>Настройки</div>

      <div className={s.section}>
        <div className={s.sectionTitle}>Тренировки</div>
        <div className={s.group}>
          <Soon label="Программа" />
          <Soon label="Зал и снаряды" note="Гриф, блины, гантели, тренажёры" />
        </div>
      </div>

      <div className={s.section}>
        <div className={s.sectionTitle}>Аккаунт</div>
        <div className={s.group}>
          <Soon
            label="Войти через VK ID"
            note="Чтобы не потерять данные при смене телефона"
          />
        </div>
      </div>

      <div className={s.section}>
        <div className={s.group}>
          <div className={s.item}>
            <div className={s.main}>
              <div className={s.label}>О приложении</div>
            </div>
            <div className={s.value}>{APP_VERSION}</div>
          </div>
        </div>
      </div>

      <div className={clsx(s.section, s.danger)}>
        <div className={s.sectionTitle}>Опасная зона</div>
        <div className={s.group}>
          <button
            className={s.item}
            disabled={summary.records === 0}
            onClick={() => dangerHandler("records")}
          >
            <div className={s.main}>
              <div className={s.label}>Сбросить рекорды</div>
              <div className={s.note}>
                {summary.records === 0
                  ? "Рекордов пока нет"
                  : `${pluralize(summary.records, RECORD_FORMS)}. Тренировки останутся`}
              </div>
            </div>
          </button>
          <button
            className={s.item}
            disabled={summary.workouts === 0}
            onClick={() => dangerHandler("history")}
          >
            <div className={s.main}>
              <div className={s.label}>Удалить историю тренировок</div>
              <div className={s.note}>
                {summary.workouts === 0
                  ? "Тренировок пока нет"
                  : `${pluralize(summary.workouts, WORKOUT_FORMS)}. Профиль и замеры останутся`}
              </div>
            </div>
          </button>
          <button className={s.item} onClick={() => dangerHandler("all")}>
            <div className={s.main}>
              <div className={s.label}>Удалить все данные</div>
              <div className={s.note}>Приложение начнётся с анкеты</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function Soon({ label, note }: { label: string; note?: string }) {
  return (
    <div className={clsx(s.item, s.off)}>
      <div className={s.main}>
        <div className={s.label}>{label}</div>
        {note && <div className={s.note}>{note}</div>}
      </div>
      <span className={s.soon}>скоро</span>
    </div>
  );
}
