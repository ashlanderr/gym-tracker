import { useQueryWorkoutsByUser } from "../../db/workouts.ts";
import { Link } from "react-router";

export function Home() {
  const workouts = useQueryWorkoutsByUser("3H0tvAlGqw9auk0mUum3");

  return (
    <div>
      {workouts.map((workout) => (
        <div key={workout.id}>
          <Link to={`/workouts/${workout.id}`}>{workout.name}</Link>
        </div>
      ))}
    </div>
  );
}
