import s from "./styles.module.scss";
import { useState } from "react";
import { clsx } from "clsx";
import { authClient, startVkSignIn } from "../../api";
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
import {
  CC_BY_SA_URL,
  EVERKINETIC_URL,
  PRIVACY_URL,
  RECORD_FORMS,
  STRENGTH_LEVEL_URL,
  WORKOUT_FORMS,
} from "./constants.ts";
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
          <Account />
        </div>
      </div>

      <div className={s.section}>
        <div className={s.sectionTitle}>О приложении</div>
        <div className={s.group}>
          <div className={s.item}>
            <div className={s.main}>
              <div className={s.label}>Версия</div>
            </div>
            <div className={s.value}>{APP_VERSION}</div>
          </div>
          <a className={s.item} href={PRIVACY_URL}>
            <div className={s.main}>
              <div className={s.label}>Политика конфиденциальности</div>
            </div>
          </a>
          <a className={s.item} href={STRENGTH_LEVEL_URL}>
            <div className={s.main}>
              <div className={s.label}>Нормативы силы</div>
              <div className={s.note}>
                Уровни силы считаются по Strength Level
              </div>
            </div>
          </a>
          <div className={s.item}>
            <div className={s.main}>
              <div className={s.label}>Иллюстрации упражнений</div>
              <div className={s.note}>
                Большая часть — из набора{" "}
                <a href={EVERKINETIC_URL}>everkinetic</a> Грега Прайди (Greg
                Priday), лицензия <a href={CC_BY_SA_URL}>CC BY-SA 4.0</a>. Цвета
                инвертированы.
              </div>
            </div>
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

function Account() {
  const { data } = authClient.useSession();
  const [starting, setStarting] = useState(false);

  if (data && !data.user.isAnonymous) {
    return (
      <div className={s.item}>
        <div className={s.main}>
          <div className={s.label}>{data.user.name}</div>
          <div className={s.note}>Вход через VK ID · {data.user.email}</div>
        </div>
      </div>
    );
  }

  const signIn = () => {
    setStarting(true);
    startVkSignIn().catch((error: unknown) => {
      console.warn(error);
      setStarting(false);
    });
  };

  return (
    <button className={s.item} disabled={starting} onClick={signIn}>
      <div className={s.main}>
        <div className={s.label}>Войти через VK ID</div>
        <div className={s.note}>Чтобы не потерять данные при смене телефона</div>
      </div>
    </button>
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
