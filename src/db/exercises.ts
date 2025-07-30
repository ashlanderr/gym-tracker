import { firestore, useFirestoreDocument } from "./db.ts";
import { doc } from "firebase/firestore";

export interface Exercise {
  id: number;
  name: string;
  muscles: string[];
}

export function useQueryExerciseById(id: string): Exercise | undefined {
  return useFirestoreDocument({
    query: () => doc(firestore, "exercises", id),
    deps: [id],
  });
}
