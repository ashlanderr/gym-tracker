import type { RecommendationParams, RecSetData } from "./types.ts";
import { buildRecommendations as periodizationRecommendations } from "./periodization";

export function buildRecommendations(
  params: RecommendationParams,
): RecSetData[] {
  return params.periodization ? periodizationRecommendations(params) : [];
}
