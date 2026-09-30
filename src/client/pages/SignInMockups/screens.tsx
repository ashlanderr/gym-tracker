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

function VkButton({
  label = "Войти через VK ID",
  muted,
}: {
  label?: string;
  muted?: boolean;
}) {
  return (
    <button className={clsx(m.vk, muted && m.vkMuted)}>
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
          Дневник тренировок, который сам подбирает веса
        </div>
      </div>
      <div className={m.welcomeActions}>
        <button className={m.primary}>Начать</button>
        <button className={m.linkButton}>
          Уже есть аккаунт? <b>Войти</b>
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
        <div className={m.vkNote}>
          Октус получит доступ к имени, фото и почте
        </div>
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
          Интернет нужен только сейчас. Потом приложение работает и без него.
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
        <div className={m.hello}>Не удалось загрузить тренировки</div>
        <div className={m.sub}>
          Вход выполнен, но пропал интернет. Загрузим тренировки, как только он
          появится.
        </div>
      </div>
      <div className={m.welcomeActions}>
        <button className={m.primary}>Повторить</button>
        <button className={m.linkButton}>Начать без аккаунта</button>
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
          note="Аккаунт пока пустой. Ответь на несколько вопросов, и мы подберём веса для первой тренировки."
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

export function HomeRestored() {
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
            <div className={st.label}>Резервной копии нет</div>
            <div className={st.note}>
              Данные хранятся только на телефоне. Войди, чтобы не потерять их
              при смене телефона
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
    signed: { icon: <MdCloudDone />, text: "Всё сохранено" },
    offline: {
      icon: <MdCloudSync />,
      text: "3 изменения не сохранены",
    },
    rejected: {
      icon: <MdCloudOff />,
      text: "Данные не сохраняются",
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
          <VkButton label="Войти ещё раз" />
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
}: {
  state: AccountState;
  danger?: boolean;
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
                      : "И на телефоне, и в аккаунте"}
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
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
      С телефона данные удалятся, но останутся в аккаунте. Чтобы вернуть их,
      войди снова.
    </Dialog>
  );
}

export function SignOutOffline() {
  return (
    <Dialog
      title="Выйти из аккаунта?"
      submit="Выйти · 5"
      red
      disabled
      warning="Если выйти сейчас, они пропадут"
    >
      3 изменения ещё не сохранены в аккаунте. Подключись к интернету, чтобы
      сохранить их.
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
        Аккаунт удалится вместе с данными. Подписку RuStore это не отменит.
      </div>
    </Dialog>
  );
}

export function Merging() {
  return (
    <div className={o.root}>
      <div className={m.center}>
        <Avatar />
        <div className={m.hello}>Привет, {FIRST_NAME}</div>
        <div className={m.sub}>Добавляем тренировки с телефона…</div>
        <div className={m.bar}>
          <i />
        </div>
      </div>
    </div>
  );
}

// Summaries

interface SummaryCell {
  label: string;
  value: string;
  meta: string;
}

function Summary({
  title,
  cells,
  note,
  action,
}: {
  title: string;
  cells: SummaryCell[];
  note?: string;
  action: string;
}) {
  return (
    <div className={o.root}>
      <div className={m.center}>
        <Avatar />
        <div className={m.hello}>{title}</div>
        <div className={clsx(m.compare, m.summary)}>
          {cells.map(({ label, value, meta }) => (
            <div key={label}>
              <span>{label}</span>
              <b>{value}</b>
              <i>{meta}</i>
            </div>
          ))}
        </div>
        {note && <div className={m.hint}>{note}</div>}
      </div>
      <div className={m.welcomeActions}>
        <button className={m.primary}>{action}</button>
      </div>
    </div>
  );
}

export function RestoredSummary() {
  return (
    <Summary
      title={`С возвращением, ${FIRST_NAME}`}
      cells={[
        { label: "Тренировки", value: "48", meta: "последняя вчера" },
        { label: "Рекорды", value: "12", meta: "в 9 упражнениях" },
      ]}
      action="К тренировкам"
    />
  );
}

export function MergedSummary() {
  return (
    <Summary
      title="Тренировки объединены"
      cells={[
        { label: "В аккаунте", value: "48", meta: "последняя вчера" },
        { label: "С телефона", value: "+2", meta: "последняя сегодня" },
      ]}
      note="Профиль взяли из аккаунта"
      action="Продолжить"
    />
  );
}

// Profile

type ProfileState = "anon" | "signed";

export function ProfileScreen({
  state,
  muted,
}: {
  state: ProfileState;
  muted?: boolean;
}) {
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
          <div className={clsx(st.group, m.profileBackup)}>
            <div className={st.item}>
              <div className={st.main}>
                <div className={st.label}>Резервной копии нет</div>
                <div className={st.note}>
                  Данные хранятся только на телефоне. Войди, чтобы не потерять
                  их при смене телефона
                </div>
              </div>
            </div>
            <div className={m.groupAction}>
              <VkButton muted={muted} />
            </div>
          </div>
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
