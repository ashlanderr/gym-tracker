import s from "./styles.module.scss";
import { ExerciseCrossFade } from "../../../../../../components";
import type { MuscleType } from "../../../../../../db";
import {
  EQUIPMENT_TRANSLATION,
  MUSCLES_TRANSLATION,
} from "../../../../../constants.ts";
import { AlternativeRow } from "../AlternativeRow";
import type { TechniqueTabProps } from "./types.ts";

export function TechniqueTab({ exercise, onReplace }: TechniqueTabProps) {
  const facts = [
    { label: "Основные", value: listMuscles(exercise.primaryMuscles) },
    { label: "Дополнительные", value: listMuscles(exercise.secondaryMuscles) },
    {
      label: "Оборудование",
      value: exercise.equipment
        .map((e) => EQUIPMENT_TRANSLATION[e].toLowerCase())
        .join(", "),
    },
  ].filter((fact) => fact.value);

  return (
    <>
      {exercise.asset?.type === "cross-fade" && (
        <ExerciseCrossFade
          className={s.animation}
          startUrl={exercise.asset.startUrl}
          endUrl={exercise.asset.endUrl}
        />
      )}
      <div className={s.name}>{exercise.name}</div>
      <div className={s.facts}>
        {facts.map(({ label, value }) => (
          <div key={label}>
            {label}: <b>{value}</b>
          </div>
        ))}
      </div>
      {exercise.instructions.length !== 0 && (
        <ol className={s.cues}>
          {exercise.instructions.map((cue, i) => (
            <li className={s.cue} key={cue}>
              <span className={s.cueNumber}>{i + 1}</span>
              <span>{cue}</span>
            </li>
          ))}
        </ol>
      )}
      {exercise.alternatives.length !== 0 && (
        <>
          <div className={s.section}>Похожие упражнения</div>
          <div className={s.alternatives}>
            {exercise.alternatives.map((alternative) => (
              <AlternativeRow
                key={alternative.id}
                alternative={alternative}
                onReplace={onReplace}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function listMuscles(muscles: MuscleType[]): string {
  return muscles.map((m) => MUSCLES_TRANSLATION[m].toLowerCase()).join(", ");
}
