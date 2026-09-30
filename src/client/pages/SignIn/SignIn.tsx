import s from "./styles.module.scss";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { MdCloudOff } from "react-icons/md";
import { useSessionState } from "../../api";
import { Avatar } from "../../components";
import type { HistorySummary } from "../../domain";
import {
  abandonSignIn,
  closeSignIn,
  finishSignIn,
  useSignInState,
} from "../../session";
import { pluralize } from "../../utils";
import { type SummaryCell, SummaryCells } from "./components";
import { EXERCISE_FORMS } from "./constants.ts";
import { formatLastDate } from "./utils.ts";

// Where a sign-in lands while the account's document comes in, and what it
// reports once it has: a screen of its own rather than a toast over the home
// screen, since the person has to see that the workouts are back.
export function SignIn() {
  const state = useSignInState();
  const session = useSessionState();
  const navigate = useNavigate();
  const location = useLocation();
  const [now] = useState(() => Date.now());

  const account = session.kind === "account" ? session.account : null;
  const firstName = account?.name.split(" ")[0] ?? "";
  const avatar = account && (
    <Avatar name={account.name} image={account.image} />
  );

  const last = (history: HistorySummary) =>
    history.lastWorkout === null
      ? "пока нет"
      : `последняя ${formatLastDate(history.lastWorkout, now)}`;

  // Opened at start, the page is the first entry and has nothing to go back
  // to; opened from the settings, it goes back there.
  const leave = (home: boolean) => {
    closeSignIn();
    if (home || location.key === "default") {
      void navigate("/", { replace: true });
    } else {
      void navigate(-1);
    }
  };

  const abandon = async () => {
    await abandonSignIn();
    void navigate("/", { replace: true });
  };

  switch (state.step) {
    case "idle":
      return <Navigate to="/" replace />;

    // A retry from the failure screen asks the server again first.
    case "checking":
      return null;

    case "loading":
      return (
        <div className={s.root}>
          <div className={s.center}>
            {avatar}
            <h1 className={s.title}>
              {state.kind === "restore"
                ? `С возвращением, ${firstName}`
                : `Привет, ${firstName}`}
            </h1>
            <div className={s.note}>
              {state.kind === "restore"
                ? "Загружаем тренировки…"
                : "Добавляем тренировки с телефона…"}
            </div>
            <div className={s.bar}>
              <i />
            </div>
          </div>
          <div className={s.actions}>
            <div className={s.hint}>
              Интернет нужен только сейчас. Потом приложение работает и без
              него.
            </div>
          </div>
        </div>
      );

    case "failed":
      return (
        <div className={s.root}>
          <div className={s.center}>
            <div className={s.icon}>
              <MdCloudOff />
            </div>
            <h1 className={s.title}>Не удалось загрузить тренировки</h1>
            <div className={s.note}>
              Вход выполнен, но пропал интернет. Проверь подключение и попробуй
              ещё раз.
            </div>
          </div>
          <div className={s.actions}>
            <button className={s.primary} onClick={() => void finishSignIn()}>
              Повторить
            </button>
            <button className={s.secondary} onClick={() => void abandon()}>
              Начать без аккаунта
            </button>
          </div>
        </div>
      );

    case "restored": {
      const { history } = state;
      const cells: SummaryCell[] = [
        {
          label: "Тренировки",
          value: history.workouts.toLocaleString("ru"),
          meta: last(history),
        },
      ];
      if (history.records > 0) {
        cells.push({
          label: "Рекорды",
          value: history.records.toLocaleString("ru"),
          meta: `в ${pluralize(history.recordExercises, EXERCISE_FORMS)}`,
        });
      }

      return (
        <div className={s.root}>
          <div className={s.center}>
            {avatar}
            <h1 className={s.title}>С возвращением, {firstName}</h1>
            <SummaryCells cells={cells} />
          </div>
          <div className={s.actions}>
            <button className={s.primary} onClick={() => leave(true)}>
              К тренировкам
            </button>
          </div>
        </div>
      );
    }

    case "merged":
      return (
        <div className={s.root}>
          <div className={s.center}>
            {avatar}
            <h1 className={s.title}>Тренировки объединены</h1>
            <SummaryCells
              cells={[
                {
                  label: "В аккаунте",
                  value: state.account.workouts.toLocaleString("ru"),
                  meta: last(state.account),
                },
                {
                  label: "С телефона",
                  value: `+${state.phone.workouts.toLocaleString("ru")}`,
                  meta: last(state.phone),
                },
              ]}
            />
            {state.accountProfile && (
              <div className={s.hint}>Профиль взяли из аккаунта</div>
            )}
          </div>
          <div className={s.actions}>
            <button className={s.primary} onClick={() => leave(false)}>
              Продолжить
            </button>
          </div>
        </div>
      );
  }
}
