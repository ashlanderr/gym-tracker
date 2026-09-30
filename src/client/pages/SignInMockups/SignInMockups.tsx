import s from "./styles.module.scss";
import { Fragment, type ReactNode } from "react";
import { MdArrowForward } from "react-icons/md";
import { Phone } from "./components";
import {
  DeleteAllSigned,
  HelloNew,
  HomeRestored,
  Merging,
  MergedSummary,
  OldWelcome,
  ProfileScreen,
  RestoredSummary,
  Restoring,
  RestoreFailed,
  SettingsScreen,
  SexStepStub,
  SignOutDialog,
  SignOutOffline,
  VkBrowser,
  WelcomeBrand,
} from "./screens.tsx";
import {
  MERGE_DATA,
  mergeRows,
  numericDate,
  RESTORE_DATA,
  restoreRows,
  wordDate,
} from "./summaries.ts";
import { Cells } from "./summaryBlocks.tsx";

interface Step {
  caption: string;
  note?: string;
  screen: ReactNode;
  overlay?: ReactNode;
  // What the person does to get from this screen to the next one.
  action?: string;
}

function Flow({
  id,
  title,
  children,
  steps,
}: {
  id: string;
  title: string;
  children: ReactNode;
  steps: Step[];
}) {
  return (
    <section className={s.flow} id={id}>
      <h2>{title}</h2>
      <div className={s.text}>{children}</div>
      <div className={s.row}>
        {steps.map((step, index) => (
          <Fragment key={index}>
            <Phone
              caption={step.caption}
              note={step.note}
              overlay={step.overlay}
            >
              {step.screen}
            </Phone>
            {step.action && (
              <div className={s.arrow}>
                <MdArrowForward />
                <span>{step.action}</span>
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}

const VARIANTS = [
  { name: "Месяц словом", date: wordDate },
  { name: "DD.MM.YYYY", date: numericDate },
];

// The app routes by hash, so a plain anchor would navigate away.
const jump = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export function SignInMockups() {
  return (
    <div className={s.root}>
      <header className={s.intro}>
        <h1>Вход в приложение: VK ID, данные, выход</h1>

        <h3>Как сейчас</h3>
        <ul>
          <li>
            Документ Yjs называется по <code>ACCOUNT_ID</code>. Это UUID,
            который телефон создаёт сам. После переустановки UUID будет новым, и
            после входа у VK-аккаунта появится второй документ:{" "}
            <code>moveUserData</code> просто меняет его владельца. Старый
            документ с историей остаётся на сервере, но клиент его не откроет,
            потому что подключается только к своему UUID. Для человека
            тренировки пропадают.
          </li>
          <li>
            На первом экране онбординга нет ни названия приложения, ни входа.
            Стрелка «назад» никуда не ведёт.
          </li>
          <li>
            Выйти из аккаунта нельзя. «Удалить все данные» очищает коллекции, но
            оставляет сессию. В профиле всегда написано «Анонимный
            пользователь». Если сервер не узнаёт токен, синхронизация навсегда
            остаётся в состоянии «connecting».
          </li>
        </ul>

        <h3>Принципы</h3>
        <ol>
          <li>
            <b>Аккаунт нужен для сохранности, а не для доступа.</b> Приложение
            работает сразу после установки и без интернета. Вход ничего не
            открывает, он переносит данные между телефонами, а позже и подписку.
          </li>
          <li>
            <b>У человека один документ.</b> Документ принадлежит аккаунту, а не
            телефону. Анонимный аккаунт отличается от обычного только тем, что у
            него нет имени. Сервер знает основной документ пользователя и после
            входа сообщает его id.
          </li>
          <li>
            <b>Вход не теряет данные.</b> Если у телефона и у аккаунта разные
            документы, мы их объединяем, а не выбираем один. Yjs делает это сам:
            у тренировок и подходов случайные id, а повторно применённое
            изменение ничего не дублирует. Конфликт возможен только в профиле,
            потому что у него фиксированный id <code>current</code>. В этом
            случае остаётся профиль аккаунта, а рекорды пересчитываются.
          </li>
          <li>
            <b>Выход убирает данные с телефона.</b> В аккаунте они остаются, а
            телефон возвращается на первый экран. Пока не всё сохранено, выйти
            нельзя, иначе несохранённые изменения пропадут.
          </li>
          <li>
            <b>Удаление удаляет всё.</b> Если человек вошёл, удаляем и документ
            на сервере, и самого пользователя. Это же закрывает требование
            RuStore и 152-ФЗ об удалении аккаунта.
          </li>
          <li>
            <b>Ничего не всплывает само</b>, как требует{" "}
            <code>design/README.md</code>. Напоминание о резервной копии — это
            строка в профиле и в настройках, без всплывающих окон.
          </li>
        </ol>

        <h3>Модель данных</h3>
        <ul>
          <li>
            Сервер хранит основной документ пользователя: в{" "}
            <code>User.documentId</code> или как самый старый документ
            владельца. Его id отдаёт tRPC <code>account.document</code>.
          </li>
          <li>
            Клиент умеет переключать документ в <code>StoreProvider</code>.
            После входа он открывает документ аккаунта, ждёт синхронизации и
            применяет к нему состояние локального документа. Профиль телефона
            при этом отбрасывается, если в аккаунте свой уже есть. Потом клиент
            пересчитывает рекорды, стирает локальный IndexedDB и просит сервер
            удалить старый анонимный документ.
          </li>
          <li>
            Имя, аватар, почта и способ входа кэшируются в{" "}
            <code>localStorage</code>. Профиль и настройки берут их из кэша, а
            не из сессии, поэтому без интернета выглядят так же.
          </li>
          <li>
            При запуске <code>ensureSession</code> проверяет токен на сервере.
            Если сервер не узнал анонимный токен, создаём новую анонимную сессию
            и переносим локальный документ под новый id. Если не узнал токен VK,
            приложение продолжает работать локально, а в настройках просит войти
            ещё раз. Повторный вход проходит как объединение.
          </li>
        </ul>

        <h3>Пол из VK</h3>
        <p>
          VK ID вместе с именем отдаёт пол в поле <code>sex</code>: 0 — не
          указан, 1 — женский, 2 — мужской.{" "}
          <b>Предлагаю его не брать и спрашивать самим.</b> Выигрыш — один тап,
          и только когда новый человек сразу нажал «Войти». Обычно входят те, у
          кого профиль в аккаунте уже есть. В VK пол часто скрыт или указан
          неправдоподобно, а у нас он меняет стартовые веса почти вдвое. Пусть
          человек ответит сам и прочитает «Зачем это?». К тому же каждое лишнее
          поле из VK придётся описать в политике по 152-ФЗ. Можно было бы
          заранее выбрать ответ на шаге с полом, но это лишний код ради одного
          тапа.
        </p>

        <nav className={s.toc}>
          <button onClick={() => jump("first")}>1. Первый экран</button>
          <button onClick={() => jump("return")}>2. Возвращение</button>
          <button onClick={() => jump("summaries")}>
            Итоги на разных данных
          </button>
          <button onClick={() => jump("empty")}>3. Пустой аккаунт</button>
          <button onClick={() => jump("merge")}>
            4. Вход, когда на телефоне есть данные
          </button>
          <button onClick={() => jump("signout")}>5. Выход</button>
          <button onClick={() => jump("delete")}>6. Удаление данных</button>
          <button onClick={() => jump("rejected")}>
            7. Сервер не узнал токен
          </button>
          <button onClick={() => jump("profile")}>8. Профиль</button>
        </nav>
      </header>

      <Flow
        id="first"
        title="1. Первый экран"
        steps={[
          { caption: "Сейчас", screen: <OldWelcome /> },
          {
            caption: "Новый",
            note: "Новых людей большинство, им нужна одна кнопка. Ссылку на вход найдёт тот, кто её ищет. Стрелки «назад» нет, потому что возвращаться некуда.",
            screen: <WelcomeBrand />,
          },
        ]}
      >
        Первый экран говорит, что это за приложение, и даёт войти тем, кто уже
        им пользовался. Вопросы анкеты остаются прежними. Фраза «Ответы можно
        изменить в профиле» переезжает на итоговый экран.
      </Flow>

      <Flow
        id="return"
        title="2. Возвращение после переустановки или на новом телефоне"
        steps={[
          {
            caption: "Первый экран",
            screen: <WelcomeBrand />,
            action: "Войти",
          },
          {
            caption: "VK ID в системном браузере",
            screen: <VkBrowser />,
            action: "возврат по deep link",
          },
          {
            caption: "Загрузка документа аккаунта",
            note: "Локальный документ пустой, объединять нечего. Клиент просто переключается на документ аккаунта.",
            screen: <Restoring />,
            action: "синхронизация",
          },
          {
            caption: "Итог загрузки",
            note: "Вместо уведомления поверх главной: человек видит, что тренировки вернулись, и сам идёт дальше.",
            screen: <RestoredSummary />,
            action: "К тренировкам",
          },
          {
            caption: "Главная без анкеты",
            note: "Профиль пришёл из аккаунта, поэтому анкету пропускаем.",
            screen: <HomeRestored />,
          },
          {
            caption: "Если интернет пропал во время загрузки",
            note: "Вход уже выполнен, достаточно повторить. «Начать без аккаунта» выходит и возвращает на первый экран.",
            screen: <RestoreFailed />,
          },
        ]}
      >
        Сценарий из TODO: человек вошёл, потренировался, удалил приложение и
        поставил снова. Сейчас в этом случае появляется второй документ. В новой
        модели телефон получает от сервера id основного документа и открывает
        его.
      </Flow>

      <section className={s.flow} id="summaries">
        <h2>Итоги на разных данных</h2>
        <div className={s.text}>
          Сравниваются два формата. Месяц словом — как в профиле: «сегодня»,
          «вчера», «3 дня назад» в пределах недели, дальше число и месяц, для
          прошлых лет с годом. DD.MM.YYYY: словами только «сегодня» и «вчера».
          Подпись под числом не переносится, так видно, помещается ли она на
          самом узком телефоне (360px). Если рекордов нет, их карточка не
          показывается.
        </div>
        {VARIANTS.map((variant) => (
          <div key={variant.name} className={s.variant}>
            <h3>{variant.name}</h3>
            <div className={s.kind}>После переустановки</div>
            <div className={s.row}>
              {RESTORE_DATA.map((data) => (
                <figure key={data.name} className={s.box}>
                  <div>
                    <Cells rows={restoreRows(data, variant.date)} />
                  </div>
                  <figcaption className={s.kind}>{data.name}</figcaption>
                </figure>
              ))}
            </div>
            <div className={s.kind}>После объединения</div>
            <div className={s.row}>
              {MERGE_DATA.map((data) => (
                <figure key={data.name} className={s.box}>
                  <div>
                    <Cells rows={mergeRows(data, variant.date)} />
                  </div>
                  <figcaption className={s.kind}>{data.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        ))}
      </section>

      <Flow
        id="empty"
        title="3. Вход в аккаунт, где ещё ничего нет"
        steps={[
          {
            caption: "VK-аккаунт без документа",
            screen: <VkBrowser existing={false} />,
            action: "возврат по deep link",
          },
          {
            caption: "Приветствие по имени",
            note: "Человек нажал «Войти», хотя раньше Октусом не пользовался. Это не ошибка: вход состоялся, дальше анкета.",
            screen: <HelloNew />,
            action: "Дальше",
          },
          {
            caption: "Обычная анкета",
            note: "Пол спрашиваем сами, см. «Пол из VK».",
            screen: <SexStepStub />,
          },
        ]}
      >
        Если человек перепутал «Войти» и «Начать», наказывать его не за что.
        Анонимный документ становится документом аккаунта, и анкета идёт как
        обычно.
      </Flow>

      <Flow
        id="merge"
        title="4. Вход из настроек, когда на телефоне уже есть тренировки"
        steps={[
          {
            caption: "Настройки без входа",
            note: "Блок аккаунта поднят наверх: из всего на этом экране только его действительно стоит сделать.",
            screen: <SettingsScreen state="anon" />,
            action: "Войти",
          },
          {
            caption: "VK ID",
            screen: <VkBrowser />,
            action: "возврат по deep link",
          },
          {
            caption: "Объединение",
            screen: <Merging />,
            action: "готово",
          },
          {
            caption: "Итог объединения",
            note: "Объединение ничего не удаляет, поэтому ни о чём не спрашиваем, а только показываем, что получилось.",
            screen: <MergedSummary />,
            action: "Продолжить",
          },
          {
            caption: "Настройки после входа",
            screen: <SettingsScreen state="signed" />,
          },
        ]}
      >
        Конфликт из TODO: у анонимного аккаунта свой документ, у VK-аккаунта
        свой. Если на телефоне только ответы анкеты и нет тренировок, его
        профиль отбрасываем без вопросов. Объединяет клиент, а не сервер: у
        клиента есть полная локальная копия, даже та часть, которую он не успел
        отправить.
      </Flow>

      <Flow
        id="signout"
        title="5. Выход"
        steps={[
          {
            caption: "Настройки после входа",
            note: "Имя и аватар из кэша. Строка о сохранении заменяет отладочное «Network: Synced» с главной.",
            screen: <SettingsScreen state="signed" />,
            action: "Выйти",
          },
          {
            caption: "Подтверждение",
            screen: <SettingsScreen state="signed" />,
            overlay: <SignOutDialog />,
            action: "Выйти",
          },
          {
            caption: "Первый экран",
            note: "Документ стёрт с телефона, сессия удалена. После входа всё вернётся.",
            screen: <WelcomeBrand />,
          },
          {
            caption: "Выход без интернета",
            note: "Выйти можно, но кнопка включается через 5 секунд, как при удалении данных. Этого хватит, чтобы прочитать, что изменения пропадут.",
            screen: <SettingsScreen state="offline" />,
            overlay: <SignOutOffline />,
          },
        ]}
      >
        Выходят, чтобы отдать телефон или сменить аккаунт. Можно было бы
        выходить, оставляя данные на телефоне, но тогда нужна их копия в новом
        анонимном документе, и при следующем входе снова придётся объединять.
        Это того не стоит.
      </Flow>

      <Flow
        id="delete"
        title="6. Удаление всех данных после входа"
        steps={[
          {
            caption: "Опасная зона",
            screen: <SettingsScreen state="signed" danger />,
            action: "Удалить все данные",
          },
          {
            caption: "Подтверждение",
            note: "Та же модалка, что сейчас, плюс строка про аккаунт и подписку.",
            screen: <SettingsScreen state="signed" danger />,
            overlay: <DeleteAllSigned />,
            action: "Удалить",
          },
          {
            caption: "Первый экран",
            note: "Документ, пользователь и сессия удалены на сервере. Без входа происходит то же самое с анонимным пользователем.",
            screen: <WelcomeBrand />,
          },
        ]}
      >
        Сейчас удаление очищает коллекции внутри документа, и пустой документ
        синхронизируется. Предлагаю удалять по-настоящему: сначала на сервере,
        потом локальный IndexedDB и токен, после чего показывать первый экран.
      </Flow>

      <Flow
        id="rejected"
        title="7. Сервер не узнал токен"
        steps={[
          {
            caption: "Приложение работает локально",
            note: "Всплывающих окон нет. Строка в настройках объясняет, что данные перестали сохраняться.",
            screen: <SettingsScreen state="rejected" />,
            action: "Войти ещё раз",
          },
          {
            caption: "VK ID",
            screen: <VkBrowser />,
            action: "возврат по deep link",
          },
          {
            caption: "Дальше как при объединении",
            note: "Изменения, сделанные за это время, попадут в документ аккаунта.",
            screen: <MergedSummary />,
          },
        ]}
      >
        Если токен был анонимным, человеку ничего не показываем. Тихо создаём
        новую анонимную сессию и переносим локальный документ под новый id,
        потому что старый может принадлежать кому-то другому. Если токен был от
        VK-аккаунта, показываем: без человека его не восстановить.
      </Flow>

      <Flow
        id="profile"
        title="8. Шапка профиля"
        steps={[
          {
            caption: "Без входа",
            note: "Вместо «Анонимный пользователь» просто «Профиль». Плашка та же, что в настройках, но кнопка приглушённая: профиль открывают часто, и яркая кнопка мозолила бы глаза.",
            screen: <ProfileScreen state="anon" />,
          },
          {
            caption: "После входа",
            note: "Имя и аватар из VK. Имя не редактируется: при каждом входе оно обновляется из VK. Без интернета экран выглядит так же, потому что данные берутся из кэша.",
            screen: <ProfileScreen state="signed" />,
          },
        ]}
      >
        Профиль и настройки берут имя и аватар из одного кэша на устройстве. Кэш
        обновляется при каждом успешном запросе сессии.
      </Flow>
    </div>
  );
}
