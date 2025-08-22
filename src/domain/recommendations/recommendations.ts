import type { RecommendationParams, RecSetData } from "./types.ts";
import {
  buildRecommendations as simpleRecommendations,
  computeNextProgression as simpleProgression,
} from "./simple";
import { buildRecommendations as periodizationRecommendations } from "./periodization";

export function buildRecommendations(
  params: RecommendationParams,
): RecSetData[] {
  if (params.periodization) {
    return periodizationRecommendations(params);
  } else {
    return simpleRecommendations(params).map((s) => ({
      ...s,
      reps: s.reps !== undefined ? { min: s.reps, max: s.reps } : undefined,
    }));
  }
}

export function computeNextProgression(params: RecommendationParams) {
  return simpleProgression(params);
}
