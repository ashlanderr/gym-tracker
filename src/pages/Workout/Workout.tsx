import s from "./styles.module.scss";
import { MdAdd, MdCheck } from "react-icons/md";
import { clsx } from "clsx";

export function Workout() {
  const exercises = [
    {
      id: "1",
      name: "Жим лёжа (Штанга)",
      sets: [
        { number: "W", previous: "20 кг x 12", weight: 20, reps: 12 },
        { number: "W", previous: "30 кг x 12", weight: 30, reps: 12 },
        { number: "1", previous: "40 кг x 12", weight: 40, reps: 12 },
        { number: "2", previous: "40 кг x 12", weight: 45, reps: 10 },
        { number: "3", previous: "40 кг x 12", weight: 45, reps: 10 },
        { number: "4", previous: "40 кг x 12", weight: 40, reps: 12 },
      ],
    },
    {
      id: "2",
      name: "Вертикальная тяга узким хватом",
      sets: [
        { number: "W", previous: "30 кг x 12", weight: 30, reps: 12 },
        { number: "W", previous: "50 кг x 12", weight: 50, reps: 12 },
        { number: "1", previous: "70 кг x 8", weight: 70, reps: 10 },
        { number: "2", previous: "70 кг x 8", weight: 70, reps: 10 },
        { number: "3", previous: "70 кг x 8", weight: 70, reps: 10 },
        { number: "4", previous: "70 кг x 8", weight: 70, reps: 10 },
      ],
    },
  ];

  return (
    <div className={s.root}>
      <div className={s.toolbar}>
        <div className={s.pageTitle}>Тренировка</div>
        <button className={s.finishButton}>Закончить</button>
      </div>
      <div className={s.stats}>
        <div className={s.stat}>
          <div className={s.statName}>Время</div>
          <div className={clsx(s.statValue, s.accent)}>10s</div>
        </div>
        <div className={s.stat}>
          <div className={s.statName}>Объём</div>
          <div className={s.statValue}>0 кг</div>
        </div>
        <div className={s.stat}>
          <div className={s.statName}>Сеты</div>
          <div className={s.statValue}>0</div>
        </div>
      </div>
      <div className={s.exercises}>
        {exercises.map((exercise) => (
          <div className={s.exercise} key={exercise.id}>
            <div className={s.exerciseName}>{exercise.name}</div>
            <table className={s.sets}>
              <thead>
                <tr>
                  <th className={s.setNumHeader}>Подх.</th>
                  <th className={s.prevVolumeHeader}>Пред.</th>
                  <th className={s.currentWeightHeader}>КГ</th>
                  <th className={s.currentRepsHeader}>Повт.</th>
                  <th className={s.setCompletedHeader}>
                    <MdCheck />
                  </th>
                </tr>
              </thead>
              <tbody>
                {exercise.sets.map((set, index) => (
                  <tr key={index}>
                    <td className={s.setNumValue}>{set.number}</td>
                    <td className={s.prevVolumeValue}>{set.previous}</td>
                    <td className={s.currentWeightValue}>{set.weight}</td>
                    <td className={s.currentRepsValue}>{set.reps}</td>
                    <td className={s.setCompletedValue}>
                      <button>
                        <MdCheck />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className={s.addSetButton}>
              <MdAdd />
              Добавить сет
            </button>
          </div>
        ))}
        <button className={s.addExerciseButton}>
          <MdAdd />
          Добавить упражнение
        </button>
      </div>
    </div>
  );
}
