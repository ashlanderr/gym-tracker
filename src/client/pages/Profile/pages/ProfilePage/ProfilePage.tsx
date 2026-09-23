import s from "./styles.module.scss";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { BodyMap, useModalStack, useStore } from "../../../../components";
import {
  type MeasurementType,
  useQueryMeasurements,
  useQueryProfile,
} from "../../../../db";
import {
  ANCHOR_EXERCISES,
  computeMuscleLevels,
  queryRecentMuscleWork,
} from "../../../../domain";
import { pluralize } from "../../../../utils";
import { SEX_SUMMARY } from "../../../Onboarding/constants.ts";
import {
  AnchorSheet,
  BodyCard,
  LiftLadder,
  MeasureSheet,
  SexSheet,
} from "../../components";
import { ANONYMOUS_NAME, MEASURES, WORKOUT_FORMS } from "../../constants.ts";
import type { LiftRow } from "../../types.ts";
import { buildLiftRows, formatAgo, formatMeasure } from "../../utils.ts";

export function ProfilePage() {
  const store = useStore();
  const navigate = useNavigate();
  const { pushModal } = useModalStack();
  const profile = useQueryProfile(store);
  const weights = useQueryMeasurements(store, "weight");
  const heights = useQueryMeasurements(store, "height");
  const [now] = useState(() => Date.now());

  const [weight] = weights;
  const [height] = heights;

  const rows = useMemo(() => {
    if (!profile) return [];
    const bodyWeight = weight?.value ?? MEASURES.weight.fallback[profile.sex];
    return buildLiftRows(store, profile, bodyWeight, now);
  }, [store, profile, weight, now]);

  const recent = useMemo(() => queryRecentMuscleWork(store, now), [store, now]);
  const muscles = useMemo(() => computeMuscleLevels(recent.work), [recent]);

  const weightPoints = useMemo(
    () => weights.map((m) => ({ x: m.createdAt, y: m.value })).reverse(),
    [weights],
  );

  if (!profile) return null;

  const addHandler = (type: MeasurementType, latest: number | undefined) =>
    pushModal(MeasureSheet, {
      type,
      value: latest ?? MEASURES[type].fallback[profile.sex],
    });

  const liftHandler = ({ anchor, source }: LiftRow) => {
    if (source === "survey" || source === "default") {
      void pushModal(AnchorSheet, anchor);
    } else {
      navigate(`/exercises/${ANCHOR_EXERCISES[anchor]}`);
    }
  };

  return (
    <div className={s.root}>
      <div className={s.title}>{ANONYMOUS_NAME}</div>
      <button
        className={s.sex}
        onClick={() => pushModal(SexSheet, profile.sex)}
      >
        {SEX_SUMMARY[profile.sex]}
      </button>
      <div className={s.section}>
        <div className={s.sectionTitle}>Тело</div>
        <div className={s.cards}>
          <BodyCard
            label={MEASURES.weight.title}
            value={weight ? formatMeasure(weight.value, "weight") : "—"}
            meta={weight ? formatAgo(weight.createdAt, now) : "Нет записей"}
            points={weightPoints}
            onOpen={() => navigate("/profile/weight")}
            onAdd={() => addHandler("weight", weight?.value)}
          />
          <BodyCard
            label={MEASURES.height.title}
            value={height ? formatMeasure(height.value, "height") : "—"}
            meta={height ? formatAgo(height.createdAt, now) : "Нет записей"}
            onOpen={() => navigate("/profile/height")}
            onAdd={() => addHandler("height", height?.value)}
          />
        </div>
      </div>
      <div className={s.section}>
        <div className={s.sectionTitle}>Уровень силы</div>
        <LiftLadder rows={rows} onSelect={liftHandler} />
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
  );
}
