import s from "./styles.module.scss";
import { useState } from "react";
import { clsx } from "clsx";
import { MdCalendarToday, MdPerson, MdSettings } from "react-icons/md";
import { pluralize } from "../../utils";
import { BodyMap } from "../WorkoutFinish/components";
import { LiftLadder } from "./components";
import { NEWCOMER, TRAINED } from "./constants.ts";

const WORKOUT_FORMS: [string, string, string] = [
  "тренировка",
  "тренировки",
  "тренировок",
];

export function ProfileMockups() {
  const [newcomer, setNewcomer] = useState(false);
  const profile = newcomer ? NEWCOMER : TRAINED;

  return (
    <div className={s.root}>
      <div className={s.controls}>
        <button
          className={clsx(s.control, newcomer && s.active)}
          onClick={() => setNewcomer(!newcomer)}
        >
          Новичок
        </button>
      </div>
      <div className={s.content}>
        <div className={s.header}>
          <div className={s.title}>{profile.name}</div>
          <button className={s.settings}>
            <MdSettings />
          </button>
        </div>
        <div className={s.summary}>{profile.summary}</div>
        <div className={s.section}>
          <div className={s.sectionTitle}>Уровень силы</div>
          <LiftLadder lifts={profile.lifts} bodyWeight={profile.bodyWeight} />
        </div>
        <div className={s.section}>
          <div className={s.sectionTitle}>Мышцы за 30 дней</div>
          <BodyMap levels={profile.muscles} />
          <div className={s.note}>
            {profile.workouts === 0
              ? "Закрасится после первой тренировки"
              : pluralize(profile.workouts, WORKOUT_FORMS)}
          </div>
        </div>
      </div>
      <div className={s.tabs}>
        <button className={s.tab}>
          <MdCalendarToday />
          Тренировки
        </button>
        <button className={clsx(s.tab, s.current)}>
          <MdPerson />
          Профиль
        </button>
      </div>
    </div>
  );
}
