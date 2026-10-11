import type { RecommendationParams, RecSetData } from "./types.ts";
import { buildRecommendations as simpleRecommendations } from "./simple";

export function buildRecommendations(
  params: RecommendationParams,
): RecSetData[] {
  return simpleRecommendations(params);
}
