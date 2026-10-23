import s from "./styles.module.scss";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { PageHeader, useModalStack, useStore } from "../../../../components";
import { type MeasurementType, useQueryMeasurements } from "../../../../db";
import {
  AddMeasureTile,
  BodyTile,
  MeasureSheet,
  PickMeasureSheet,
} from "../../components";
import { MEASURES, MEASUREMENT_TYPES } from "../../constants.ts";
import {
  formatAgo,
  formatMeasure,
  groupByType,
  toPoints,
} from "../../utils.ts";

// A measurement is tracked once it has a record: only those are tiles, and
// the rest wait behind the add tile.
export function ProfilePage() {
  const store = useStore();
  const navigate = useNavigate();
  const { pushModal } = useModalStack();
  const measurements = useQueryMeasurements(store);
  const [now] = useState(() => Date.now());

  const groups = useMemo(() => groupByType(measurements), [measurements]);
  const tracked = MEASUREMENT_TYPES.filter((type) => groups[type].length > 0);
  const untracked = MEASUREMENT_TYPES.filter(
    (type) => groups[type].length === 0,
  );

  const recordHandler = (type: MeasurementType) =>
    pushModal(MeasureSheet, {
      type,
      value: groups[type][0]?.value ?? MEASURES[type].fallback,
      isFirst: groups[type].length === 0,
    });

  const pickHandler = async () => {
    const type = await pushModal(PickMeasureSheet, { types: untracked });
    if (type) await recordHandler(type);
  };

  return (
    <div className={s.root}>
      <PageHeader start title="Профиль" />
      <div className={s.section}>
        <div className={s.sectionTitle}>Тело</div>
        <div className={s.tiles}>
          {tracked.map((type) => {
            const [latest] = groups[type];
            return (
              <BodyTile
                key={type}
                label={MEASURES[type].title}
                value={formatMeasure(latest.value, type)}
                meta={formatAgo(latest.createdAt, now)}
                points={toPoints(groups[type])}
                onOpen={() => navigate(`/profile/${type}`)}
                onAdd={() => recordHandler(type)}
              />
            );
          })}
          {untracked.length > 0 && <AddMeasureTile onClick={pickHandler} />}
        </div>
      </div>
    </div>
  );
}
