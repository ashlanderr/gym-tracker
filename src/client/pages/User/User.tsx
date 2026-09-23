import { useStore } from "../../components";
import {
  addMeasurement,
  useQueryLatestMeasurement,
  generateId,
} from "../../db";
import { useState } from "react";
import { useAccountId } from "../../account";
import { trpc } from "../../api";
import s from "./styles.module.scss";
import { useNavigate } from "react-router";
import { MdArrowBack } from "react-icons/md";

export function User() {
  const store = useStore();
  const accountId = useAccountId();
  const navigate = useNavigate();
  const weight = useQueryLatestMeasurement(store, "weight", null)?.value;
  const height = useQueryLatestMeasurement(store, "height", null)?.value;
  const me = trpc.me.useQuery();

  const [weightInput, setWeightInput] = useState<string | null>(null);
  const [heightInput, setHeightInput] = useState<string | null>(null);
  const canSave = weightInput !== null || heightInput !== null;

  const parseValue = (value: string | null, defaultValue: number): number => {
    if (!value) return defaultValue;
    const num = Number.parseFloat(value);
    if (Number.isNaN(num)) return defaultValue;
    if (num < 0) return defaultValue;
    return num;
  };

  const weightBlurHandler = () => {
    if (weightInput !== null) {
      setWeightInput(parseValue(weightInput, weight ?? 0).toFixed(1));
    }
  };

  const heightBlurHandler = () => {
    if (heightInput !== null) {
      setHeightInput(parseValue(heightInput, height ?? 0).toFixed(0));
    }
  };

  const saveHandler = () => {
    const createdAt = Date.now();
    const inputs = [
      { type: "weight", input: weightInput, value: weight },
      { type: "height", input: heightInput, value: height },
    ] as const;
    for (const { type, input, value } of inputs) {
      if (input === null) continue;
      addMeasurement(store, {
        id: generateId(),
        user: accountId,
        type,
        value: parseValue(input, value ?? 0),
        createdAt,
      });
    }
    setWeightInput(null);
    setHeightInput(null);
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
            value={weightInput ?? weight?.toFixed(1) ?? ""}
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
            value={heightInput ?? height?.toFixed(0) ?? ""}
            placeholder="0"
            onChange={(e) => setHeightInput(e.target.value)}
            onBlur={heightBlurHandler}
          />
          <label className={s.fieldLabel}>см</label>
        </div>
        <div className={s.field}>
          <label className={s.fieldLabel}>Аккаунт</label>
          <div className={s.fieldValue}>
            {me.data ? me.data.id : "нет связи с сервером"}
          </div>
        </div>
      </div>
    </div>
  );
}
