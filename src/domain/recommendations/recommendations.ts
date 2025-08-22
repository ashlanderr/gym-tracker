import type { RecommendationParams } from "./types.ts";
import {
  buildRecommendations as simpleRecommendations,
  computeNextProgression as simpleProgression,
} from "./simple";

export function buildRecommendations(params: RecommendationParams) {
  return simpleRecommendations(params);
}

export function computeNextProgression(params: RecommendationParams) {
  return simpleProgression(params);
}
