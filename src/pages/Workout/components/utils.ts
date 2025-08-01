export function volumeToOneRepMax(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

export function oneRepMaxToWeight(oneRepMax: number, reps: number): number {
  return oneRepMax / (1 + reps / 30);
}

export function oneRepMaxToReps(oneRepMax: number, weight: number): number {
  return (oneRepMax / weight - 1) * 30;
}
