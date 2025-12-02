import type { RecommendationParams, RecSetData } from "./types.ts";
import { buildRecommendations as periodizationRecommendations } from "./periodization";
import { buildRecommendations as doubleProgressionRecommendations } from "./double-progression";

export function buildRecommendations(
  params: RecommendationParams,
): RecSetData[] {
  return params.periodization
    ? periodizationRecommendations(params)
    : doubleProgressionRecommendations(params);
}
