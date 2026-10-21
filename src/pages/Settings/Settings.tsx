import {
  HeaderButton,
  PageHeader,
  useConnectionStatus,
  useStore,
} from "../../components";
import { getBackendUrl, setBackendUrl } from "../../db";
import { useState } from "react";
import { MdLogout, MdPerson } from "react-icons/md";
import { signOut, useUser } from "../../firebase/auth.ts";
import { formatSoundLog } from "../../utils";
import { APP_VERSION } from "./constants.ts";
import { seedWorkouts } from "./seed.ts";
import s from "./styles.module.scss";

export function Settings() {
  const user = useUser();
  const store = useStore();
  const connection = useConnectionStatus();
  const [backendUrlInput, setBackendUrlInput] = useState<string | null>(null);

  const saveHandler = () => {
    if (backendUrlInput === null) return;
    setBackendUrl(backendUrlInput);
    setBackendUrlInput(null);
    location.reload();
  };

  const copySoundLogHandler = async () => {
    try {
      await navigator.clipboard.writeText(formatSoundLog());
      alert("Лог звука таймера скопирован");
    } catch (e) {
      alert(`Не удалось скопировать лог: ${e}`);
    }
  };

  return (
    <div className={s.root}>
      <PageHeader
        title="Настройки"
        right={
          <HeaderButton
            primary
            disabled={backendUrlInput === null}
            onClick={saveHandler}
          >
            Сохранить
          </HeaderButton>
        }
      />
      <div className={s.body}>
        <div className={s.user}>
          {user.photoURL ? (
            <img className={s.userImage} src={user.photoURL} alt="User Photo" />
          ) : (
            <div className={s.userImage}>
              <MdPerson />
            </div>
          )}
          <div className={s.userName}>
            {user.displayName ?? "Анонимный Пользователь"}
          </div>
          <button className={s.signOut} onClick={signOut}>
            <MdLogout />
            <span>Выйти</span>
          </button>
        </div>
        <div className={s.field}>
          <label className={s.fieldLabel}>URL</label>
          <input
            className={s.fieldInput}
            value={backendUrlInput ?? getBackendUrl() ?? ""}
            placeholder=""
            onChange={(e) => setBackendUrlInput(e.target.value)}
          />
        </div>
        <div className={s.field} onClick={copySoundLogHandler}>
          <div className={s.fieldLabel}>Версия</div>
          <div className={s.fieldValue}>{APP_VERSION}</div>
        </div>
        <div className={s.field}>
          <div className={s.fieldLabel}>Сеть</div>
          <div className={s.fieldValue}>{connection}</div>
        </div>
        {/* Test data goes only into a local account while developing, never
            into a real synced one. */}
        {import.meta.env.DEV && user.uid.startsWith("local-") && (
          <button
            className={s.seed}
            onClick={() => seedWorkouts(store, user.uid)}
          >
            Добавить тестовые тренировки
          </button>
        )}
      </div>
    </div>
  );
}
