import type { RecommendationParams, RecSetData } from "./types.ts";
import { buildRecommendations as periodizationRecommendations } from "./periodization";
import { buildRecommendations as simpleRecommendations } from "./simple";

export function buildRecommendations(
  params: RecommendationParams,
): RecSetData[] {
  return params.periodization
    ? periodizationRecommendations(params)
    : simpleRecommendations(params);
}
