import s from "./styles.module.scss";
import { type ReactNode, useEffect } from "react";
import { migrate, SCHEMA_VERSION, useSchemaVersion } from "../../db";
import type { SchemaGateProps } from "./types.ts";

// The data is migrated on this device once it has both the local copy and
// what the server holds, so nothing unmigrated comes in after. The server may
// be skipped: there is only one device per person.
export function SchemaGate({
  store,
  loaded,
  status,
  children,
}: SchemaGateProps) {
  const version = useSchemaVersion(store);
  const serverReady = !store.hasServer || status === "synced";
  const outdated = loaded && version < SCHEMA_VERSION;

  useEffect(() => {
    if (outdated && serverReady) migrate(store.personal);
  }, [outdated, serverReady, store]);

  if (!loaded) {
    return <Screen spinner title="Загрузка" />;
  }

  if (version > SCHEMA_VERSION) {
    return (
      <Screen
        title="Обновите приложение"
        text="Данные сохранены более новой версией."
        action={
          <button className={s.button} onClick={() => location.reload()}>
            Обновить
          </button>
        }
      />
    );
  }

  if (version < SCHEMA_VERSION) {
    return (
      <Screen
        spinner
        title="Обновляем данные"
        text={serverReady ? undefined : "Ждём сервер, чтобы ничего не потерять."}
        action={
          !serverReady && (
            <button
              className={s.secondary}
              onClick={() => migrate(store.personal)}
            >
              Обновить без сервера
            </button>
          )
        }
      />
    );
  }

  return children;
}

interface ScreenProps {
  spinner?: boolean;
  title: string;
  text?: string;
  action?: ReactNode;
}

function Screen({ spinner, title, text, action }: ScreenProps) {
  return (
    <div className={s.root}>
      {spinner && <div className={s.spinner} />}
      <div className={s.title}>{title}</div>
      {text && <div className={s.text}>{text}</div>}
      {action}
    </div>
  );
}
