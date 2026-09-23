import s from "./styles.module.scss";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { MdArrowBack, MdSettings } from "react-icons/md";
import { BodyMap, useStore } from "../../components";
import { useQueryLatestMeasurement, useQueryProfile } from "../../db";
import { computeMuscleLevels, queryRecentMuscleWork } from "../../domain";
import { pluralize } from "../../utils";
import { DEFAULT_WEIGHT_KG, SEX_SUMMARY } from "../Onboarding/constants.ts";
import { LiftLadder } from "./components";
import { ANONYMOUS_NAME, WORKOUT_FORMS } from "./constants.ts";
import { buildLiftRows } from "./utils.ts";

export function Profile() {
  const store = useStore();
  const navigate = useNavigate();
  const profile = useQueryProfile(store);
  const weight = useQueryLatestMeasurement(store, "weight", null)?.value;
  const height = useQueryLatestMeasurement(store, "height", null)?.value;
  const [now] = useState(() => Date.now());

  const rows = useMemo(() => {
    if (!profile) return [];
    const bodyWeight = weight ?? DEFAULT_WEIGHT_KG[profile.sex];
    return buildLiftRows(store, profile, bodyWeight, now);
  }, [store, profile, weight, now]);

  const recent = useMemo(() => queryRecentMuscleWork(store, now), [store, now]);
  const muscles = useMemo(() => computeMuscleLevels(recent.work), [recent]);

  if (!profile) return null;

  const summary = [
    SEX_SUMMARY[profile.sex],
    ...(height === undefined ? [] : [`${height} см`]),
    ...(weight === undefined ? [] : [`${weight.toLocaleString("ru")} кг`]),
  ].join(" · ");

  return (
    <div className={s.root}>
      <div className={s.top}>
        <button className={s.icon} onClick={() => navigate(-1)}>
          <MdArrowBack />
        </button>
        <button className={s.icon} onClick={() => navigate("/user")}>
          <MdSettings />
        </button>
      </div>
      <div className={s.content}>
        <div className={s.title}>{ANONYMOUS_NAME}</div>
        <div className={s.summary}>{summary}</div>
        <div className={s.section}>
          <div className={s.sectionTitle}>Уровень силы</div>
          <LiftLadder rows={rows} />
        </div>
        <div className={s.section}>
          <div className={s.sectionTitle}>Мышцы за 30 дней</div>
          <BodyMap levels={muscles} />
          <div className={s.note}>
            {recent.workouts === 0
              ? "Закрасится после первой тренировки"
              : pluralize(recent.workouts, WORKOUT_FORMS)}
          </div>
        </div>
      </div>
    </div>
  );
}
