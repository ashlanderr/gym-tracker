import { useStore } from "../../components";
import {
  addMeasurement,
  useQueryLatestMeasurement,
  generateId,
  useQueryPeriodizationByUser,
  type PeriodizationData,
  addPeriodization,
  deletePeriodization,
} from "../../db";
import { useState } from "react";
import { useUser } from "../../firebase/auth.ts";
import s from "./styles.module.scss";
import { useNavigate } from "react-router";
import { MdArrowBack } from "react-icons/md";

export function User() {
  const store = useStore();
  const user = useUser();
  const navigate = useNavigate();
  const measurement = useQueryLatestMeasurement(store, null);
  const period = useQueryPeriodizationByUser(store, user.uid);

  const [weightInput, setWeightInput] = useState<string | null>(null);
  const [heightInput, setHeightInput] = useState<string | null>(null);
  const [periodInput, setPeriodInput] = useState<string | null>(null);
  const canSave =
    weightInput !== null || heightInput !== null || periodInput !== null;

  const parseValue = (value: string | null, defaultValue: number): number => {
    if (!value) return defaultValue;
    const num = Number.parseFloat(value);
    if (Number.isNaN(num)) return defaultValue;
    if (num < 0) return defaultValue;
    return num;
  };

  const weightBlurHandler = () => {
    if (weightInput !== null) {
      setWeightInput(
        parseValue(weightInput, measurement?.weight ?? 0).toFixed(1),
      );
    }
  };

  const heightBlurHandler = () => {
    if (heightInput !== null) {
      setHeightInput(
        parseValue(heightInput, measurement?.height ?? 0).toFixed(0),
      );
    }
  };

  const periodBlurHandler = () => {
    if (periodInput !== null) {
      const newPeriod = periodFromString(periodInput);
      setPeriodInput(periodToString(newPeriod));
    }
  };

  const saveHandler = () => {
    if (weightInput !== null || heightInput !== null) {
      addMeasurement(store, {
        id: generateId(),
        user: user.uid,
        weight: parseValue(weightInput, measurement?.weight ?? 0),
        height: parseValue(heightInput, measurement?.height ?? 0),
        createdAt: Date.now(),
      });
    }
    if (periodInput !== null) {
      const newPeriod = periodFromString(periodInput);
      if (newPeriod !== null) {
        addPeriodization(store, {
          id: period?.id ?? generateId(),
          user: user.uid,
          ...newPeriod,
        });
      } else if (period) {
        deletePeriodization(store, period);
      }
    }
    setWeightInput(null);
    setHeightInput(null);
    setPeriodInput(null);
  };

  return (
    <div className={s.root}>
      <div className={s.toolbar}>
        <button
          className={s.backButton}
          onClick={() => navigate("/", { replace: true })}
        >
          <MdArrowBack />
        </button>
        <div className={s.pageTitle}>Пользователь</div>
        <button
          className={s.saveButton}
          disabled={!canSave}
          onClick={saveHandler}
        >
          Сохранить
        </button>
      </div>
      <div className={s.body}>
        <div className={s.field}>
          <label className={s.fieldLabel}>Масса тела</label>
          <input
            className={s.fieldInput}
            value={weightInput ?? measurement?.weight?.toFixed(1)}
            placeholder="0.0"
            onChange={(e) => setWeightInput(e.target.value)}
            onBlur={weightBlurHandler}
          />
          <label className={s.fieldLabel}>кг</label>
        </div>
        <div className={s.field}>
          <label className={s.fieldLabel}>Рост</label>
          <input
            className={s.fieldInput}
            value={heightInput ?? measurement?.height?.toFixed(0)}
            placeholder="0"
            onChange={(e) => setHeightInput(e.target.value)}
            onBlur={heightBlurHandler}
          />
          <label className={s.fieldLabel}>см</label>
        </div>
        <div className={s.field}>
          <label className={s.fieldLabel}>Периодизация</label>
          <input
            className={s.fieldInput}
            value={periodInput ?? periodToString(period)}
            placeholder="L, M, H"
            onChange={(e) => setPeriodInput(e.target.value)}
            onBlur={periodBlurHandler}
          />
          <label className={s.fieldLabel}></label>
        </div>
      </div>
    </div>
  );
}

function periodToString(period: PeriodizationData | null): string {
  return period ? `${period.light}, ${period.medium}, ${period.heavy}` : "";
}

function periodFromString(str: string): PeriodizationData | null {
  const [light, medium, heavy] = str
    .split(",")
    .map((p) => Number.parseInt(p.trim(), 10));

  if (!Number.isNaN(heavy) && !Number.isNaN(medium) && !Number.isNaN(light)) {
    return { heavy, medium, light, counter: 0 };
  } else {
    return null;
  }
}
