import m from "./screens.module.scss";
import o from "../Onboarding/styles.module.scss";
import st from "../Settings/styles.module.scss";
import pr from "../Profile/pages/ProfilePage/styles.module.scss";
import tb from "../Tabs/styles.module.scss";
import cd from "../../components/ConfirmDialog/styles.module.scss";
import dd from "../Settings/components/DeleteDataModal/styles.module.scss";
import type { ReactNode } from "react";
import { clsx } from "clsx";
import {
  MdArrowBack,
  MdCheck,
  MdCloudDone,
  MdCloudOff,
  MdCloudSync,
  MdLock,
  MdOutlineFitnessCenter,
} from "react-icons/md";
import { SiVk } from "react-icons/si";
import { TABS } from "../Tabs/constants.ts";
import { StepLayout } from "../Onboarding/components";

const NAME = "Александр Шилов";
const FIRST_NAME = "Александр";
const EMAIL = "a•••@gmail.com";
const LOGO = `${import.meta.env.BASE_URL}pwa-192x192.png`;
const noop = () => {};

function VkButton({ label = "Войти через VK ID" }: { label?: string }) {
  return (
    <button className={m.vk}>
      <SiVk />
      {label}
    </button>
  );
}

function WithTabs({ path, children }: { path: string; children: ReactNode }) {
  return (
    <div className={tb.root}>
      <div className={tb.page}>{children}</div>
      <nav className={tb.bar}>
        {TABS.map(({ path: tab, label, icon: Icon }) => (
          <button
            key={tab}
            className={clsx(tb.tab, tab === path && tb.current)}
          >
            <Icon className={tb.icon} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Toast({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className={m.toastLayer}>
      <div className={m.toast}>
        <span className={m.toastIcon}>{icon}</span>
        <span>{children}</span>
      </div>
    </div>
  );
}

function Avatar({ letter = "А", small }: { letter?: string; small?: boolean }) {
  return <div className={clsx(m.avatar, small && m.avatarSmall)}>{letter}</div>;
}

// Onboarding

export function WelcomeBrand() {
  return (
    <div className={o.root}>
      <div className={m.welcome}>
        <img className={m.logo} src={LOGO} alt="" />
        <div className={m.brand}>Октус</div>
        <div className={m.tagline}>
          Отмечай подходы — веса, разминку и отдых приложение подберёт само
        </div>
      </div>
      <div className={m.welcomeActions}>
        <button className={m.primary}>Начать</button>
        <button className={m.linkButton}>
          Уже занимались с Октусом? <b>Войти</b>
        </button>
      </div>
    </div>
  );
}

export function WelcomeChoice() {
  return (
    <div className={o.root}>
      <div className={m.welcome}>
        <img className={m.logo} src={LOGO} alt="" />
        <div className={m.brand}>Октус</div>
        <div className={m.tagline}>
          Дневник тренировок, который подбирает веса
        </div>
      </div>
      <div className={m.choices}>
        <button className={m.choice}>
          <b>Я здесь впервые</b>
          <span>Пара минут вопросов — и первая тренировка готова</span>
        </button>
        <button className={m.choice}>
          <b>
            <SiVk /> У меня уже есть аккаунт
          </b>
          <span>Войти через VK ID, тренировки вернутся</span>
        </button>
      </div>
    </div>
  );
}

export function OldWelcome() {
  return (
    <div className={o.root}>
      <div className={o.top}>
        <button className={o.back}>
          <MdArrowBack />
        </button>
      </div>
      <div className={o.progress} />
      <div className={o.stage}>
        <StepLayout
          icon={<MdOutlineFitnessCenter />}
          question="Настроим приложение под тебя"
          note="Несколько вопросов — и вес, подходы и разминка будут подбираться автоматически."
          text="Ответы можно изменить в профиле."
          action={{ label: "Начать", onClick: noop }}
        />
      </div>
    </div>
  );
}

export function VkBrowser({ existing = true }: { existing?: boolean }) {
  return (
    <div className={m.browser}>
      <div className={m.urlBar}>
        <MdLock /> id.vk.com
      </div>
      <div className={m.vkPage}>
        <SiVk className={m.vkLogo} />
        <div className={m.vkTitle}>Вход в Октус</div>
        <div className={m.vkAccount}>
          <Avatar small />
          <div>
            <b>{existing ? NAME : "Мария Иванова"}</b>
            <span>+7 ••• ••• •• 12</span>
          </div>
        </div>
        <button className={m.vkContinue}>
          Продолжить как {existing ? FIRST_NAME : "Мария"}
        </button>
        <div className={m.vkNote}>Октус получит имя, фото и почту</div>
      </div>
    </div>
  );
}

export function Restoring() {
  return (
    <div className={o.root}>
      <div className={m.center}>
        <Avatar />
        <div className={m.hello}>С возвращением, {FIRST_NAME}</div>
        <div className={m.sub}>Загружаем тренировки…</div>
        <div className={m.bar}>
          <i />
        </div>
      </div>
      <div className={m.welcomeActions}>
        <div className={m.hint}>
          Нужна сеть только сейчас. Дальше всё работает и без неё.
        </div>
      </div>
    </div>
  );
}

export function RestoreFailed() {
  return (
    <div className={o.root}>
      <div className={m.center}>
        <div className={m.iconCircle}>
          <MdCloudOff />
        </div>
        <div className={m.hello}>Не получилось загрузить</div>
        <div className={m.sub}>
          Вход выполнен, но тренировки не пришли: нет сети. Попробуем ещё раз,
          как только она появится.
        </div>
      </div>
      <div className={m.welcomeActions}>
        <button className={m.primary}>Повторить</button>
        <button className={m.linkButton}>Выйти и начать без аккаунта</button>
      </div>
    </div>
  );
}

export function HelloNew() {
  return (
    <div className={o.root}>
      <div className={o.top}>
        <button className={o.back}>
          <MdArrowBack />
        </button>
      </div>
      <div className={o.progress} />
      <div className={o.stage}>
        <StepLayout
          icon={<Avatar letter="М" />}
          question="Привет, Мария!"
          note="В этом аккаунте ещё нет тренировок. Ответь на несколько вопросов — и подберём веса для первой."
          action={{ label: "Дальше", onClick: noop }}
        />
      </div>
    </div>
  );
}

export function SexStepStub() {
  return (
    <div className={o.root}>
      <div className={o.top}>
        <button className={o.back}>
          <MdArrowBack />
        </button>
      </div>
      <div className={o.progress}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <i key={i} className={clsx(i === 0 && o.filled)} />
        ))}
      </div>
      <div className={o.stage}>
        <StepLayout
          question="Какой у тебя пол?"
          note="Стартовые веса у мужчин и женщин разные."
          why="—"
        >
          <div className={m.sexStub}>
            <span>Мужской</span>
            <span>Женский</span>
          </div>
        </StepLayout>
      </div>
    </div>
  );
}

// Home

export function HomeRestored({ toast = true }: { toast?: boolean }) {
  return (
    <WithTabs path="/">
      <div className={m.home}>
        <div className={m.newWorkout}>
          <div>Новая тренировка</div>
          <button>+ Начать тренировку</button>
        </div>
        {["Вт, 29 сент", "Сб, 26 сент", "Чт, 24 сент", "Вт, 22 сент"].map(
          (date) => (
            <div key={date} className={m.workout}>
              <b>Верх тела</b>
              <span>{date} · 1 ч 04 мин</span>
            </div>
          ),
        )}
      </div>
      {toast && (
        <Toast icon={<MdCloudDone />}>48 тренировок из аккаунта на месте</Toast>
      )}
    </WithTabs>
  );
}

// Settings

type AccountState = "anon" | "signed" | "offline" | "rejected";

function AccountGroup({ state }: { state: AccountState }) {
  if (state === "anon") {
    return (
      <div className={st.group}>
        <div className={st.item}>
          <div className={st.main}>
            <div className={st.label}>Данные только на этом телефоне</div>
            <div className={st.note}>
              Войди, чтобы не потерять их при смене или сбросе телефона
            </div>
          </div>
        </div>
        <div className={m.groupAction}>
          <VkButton />
        </div>
      </div>
    );
  }

  const status: Record<
    Exclude<AccountState, "anon">,
    { icon: ReactNode; text: string; warn?: boolean }
  > = {
    signed: { icon: <MdCloudDone />, text: "Сохранено · только что" },
    offline: {
      icon: <MdCloudSync />,
      text: "Нет сети · 3 изменения ждут отправки",
    },
    rejected: {
      icon: <MdCloudOff />,
      text: "Вход устарел — войди снова, чтобы продолжить сохранять",
      warn: true,
    },
  };
  const { icon, text, warn } = status[state];

  return (
    <div className={st.group}>
      <button className={st.item}>
        <Avatar small />
        <div className={st.main}>
          <div className={st.label}>{NAME}</div>
          <div className={st.note}>VK ID · {EMAIL}</div>
        </div>
      </button>
      <div className={clsx(st.item, m.syncRow, warn && m.warn)}>
        {icon}
        <div className={st.main}>
          <div className={st.note}>{text}</div>
        </div>
      </div>
      {state === "rejected" ? (
        <div className={m.groupAction}>
          <VkButton label="Войти снова" />
        </div>
      ) : (
        <button className={st.item}>
          <div className={st.main}>
            <div className={st.label}>Выйти</div>
          </div>
        </button>
      )}
    </div>
  );
}

export function SettingsScreen({
  state,
  danger,
  toast,
}: {
  state: AccountState;
  danger?: boolean;
  toast?: ReactNode;
}) {
  return (
    <WithTabs path="/settings">
      <div className={st.root}>
        <div className={st.title}>Настройки</div>
        {!danger && (
          <div className={st.section}>
            <div className={st.sectionTitle}>Аккаунт</div>
            <AccountGroup state={state} />
          </div>
        )}
        {!danger && (
          <div className={st.section}>
            <div className={st.sectionTitle}>Тренировки</div>
            <div className={st.group}>
              <div className={clsx(st.item, st.off)}>
                <div className={st.main}>
                  <div className={st.label}>Программа</div>
                </div>
                <span className={st.soon}>скоро</span>
              </div>
              <div className={clsx(st.item, st.off)}>
                <div className={st.main}>
                  <div className={st.label}>Зал и снаряды</div>
                  <div className={st.note}>Гриф, блины, гантели, тренажёры</div>
                </div>
                <span className={st.soon}>скоро</span>
              </div>
            </div>
          </div>
        )}
        {danger && (
          <div className={clsx(st.section, st.danger)}>
            <div className={st.sectionTitle}>Опасная зона</div>
            <div className={st.group}>
              <button className={st.item}>
                <div className={st.main}>
                  <div className={st.label}>Сбросить рекорды</div>
                  <div className={st.note}>
                    12 рекордов. Тренировки останутся
                  </div>
                </div>
              </button>
              <button className={st.item}>
                <div className={st.main}>
                  <div className={st.label}>Удалить историю тренировок</div>
                  <div className={st.note}>
                    48 тренировок. Профиль и замеры останутся
                  </div>
                </div>
              </button>
              <button className={st.item}>
                <div className={st.main}>
                  <div className={st.label}>Удалить все данные</div>
                  <div className={st.note}>
                    {state === "anon"
                      ? "Приложение начнётся с анкеты"
                      : "С телефона и из аккаунта. Приложение начнётся с начала"}
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
      {toast}
    </WithTabs>
  );
}

// Dialogs

function Dialog({
  title,
  children,
  cancel = "Отмена",
  submit,
  red,
  disabled,
  warning,
}: {
  title: string;
  children: ReactNode;
  cancel?: string;
  submit: string;
  red?: boolean;
  disabled?: boolean;
  warning?: string;
}) {
  return (
    <div className={m.backdrop}>
      <div className={cd.dialog}>
        <div className={cd.title}>{title}</div>
        <div className={cd.body}>{children}</div>
        {warning && <div className={cd.warning}>{warning}</div>}
        <div className={cd.actions}>
          <button className={cd.cancel}>{cancel}</button>
          <button
            className={clsx(cd.submit, !red && m.blueSubmit)}
            disabled={disabled}
          >
            {submit}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SignOutDialog() {
  return (
    <Dialog title="Выйти из аккаунта?" submit="Выйти" red>
      Тренировки останутся в аккаунте и вернутся после входа. С этого телефона
      они удалятся.
    </Dialog>
  );
}

export function SignOutOffline() {
  return (
    <Dialog title="Выйти из аккаунта?" submit="Выйти" red disabled>
      3 изменения ещё не отправлены. Без сети они пропадут вместе с данными на
      телефоне — подключись к интернету и подожди пару секунд.
    </Dialog>
  );
}

export function DeleteAllSigned() {
  return (
    <Dialog
      title="Удалить все данные?"
      submit="Удалить · 5"
      red
      disabled
      warning="Отменить нельзя"
    >
      <div className={dd.list}>
        {[
          ["Тренировки", "48"],
          ["Подходы", "1 204"],
          ["Рекорды", "12"],
          ["Замеры веса и роста", "9"],
        ].map(([label, value]) => (
          <div key={label} className={dd.row}>
            {label}
            <b>{value}</b>
          </div>
        ))}
      </div>
      <div className={dd.keep}>
        Удалятся с телефона и из аккаунта, вход через VK ID отвяжется. Подписку
        RuStore это не отменяет.
      </div>
    </Dialog>
  );
}

export function MergeSheet() {
  return (
    <div className={m.backdrop}>
      <div className={m.sheet}>
        <div className={m.sheetTitle}>В аккаунте уже есть тренировки</div>
        <div className={m.compare}>
          <div>
            <span>Аккаунт {FIRST_NAME}</span>
            <b>48 тренировок</b>
            <i>последняя 29 сентября</i>
          </div>
          <div>
            <span>Этот телефон</span>
            <b>2 тренировки</b>
            <i>последняя сегодня</i>
          </div>
        </div>
        <button className={m.primary}>Объединить</button>
        <button className={m.linkButton}>Оставить только аккаунт</button>
        <div className={m.hint}>
          Профиль и ответы анкеты берутся из аккаунта
        </div>
      </div>
    </div>
  );
}

export function Merging() {
  return (
    <div className={o.root}>
      <div className={m.center}>
        <Avatar />
        <div className={m.hello}>Привет, {FIRST_NAME}</div>
        <div className={m.sub}>
          Загружаем аккаунт и добавляем 2 тренировки с этого телефона…
        </div>
        <div className={m.bar}>
          <i />
        </div>
      </div>
    </div>
  );
}

export function MergedToast() {
  return (
    <Toast icon={<MdCheck />}>
      Вход выполнен. 2 тренировки с телефона добавлены к 48 в аккаунте
    </Toast>
  );
}

// Profile

type ProfileState = "anon" | "signed";

export function ProfileScreen({ state }: { state: ProfileState }) {
  return (
    <WithTabs path="/profile">
      <div className={pr.root}>
        {state === "anon" ? (
          <>
            <div className={pr.title}>Профиль</div>
            <button className={pr.sex}>Мужчина</button>
          </>
        ) : (
          <div className={m.profileHead}>
            <Avatar />
            <div>
              <div className={pr.title}>{NAME}</div>
              <button className={pr.sex}>Мужчина</button>
            </div>
          </div>
        )}
        {state === "anon" && (
          <button className={m.backupLine}>
            <MdCloudOff />
            <span>
              Данные только на этом телефоне · <b>Войти</b>
            </span>
          </button>
        )}
        <div className={pr.section}>
          <div className={pr.sectionTitle}>Тело</div>
          <div className={m.cardStub}>
            <span>Вес</span>
            <b>80 кг</b>
          </div>
          <div className={m.cardStub}>
            <span>Рост</span>
            <b>178 см</b>
          </div>
        </div>
        <div className={pr.section}>
          <div className={pr.sectionTitle}>Уровень силы</div>
          <div className={m.ladderStub} />
        </div>
      </div>
    </WithTabs>
  );
}
