import type { MuscleType } from "../db/exercises.ts";

export const MUSCLES_TRANSLATION: Record<MuscleType, string> = {
  chest: "Грудь",
  biceps: "Бицепсы",
  lats: "Широчайшие",
  triceps: "Трицепсы",
  shoulders: "Плечи",
  forearms: "Предплечья",
  upper_back: "Верх спины",
};
