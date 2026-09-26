import type { PlayerAnswer, TraitMap } from "./types";
import { getAnswer } from "./questions";

export function accumulateTraits(answers: PlayerAnswer[]): TraitMap {
  const totals: TraitMap = {};

  for (const entry of answers) {
    const answer = getAnswer(entry.questionId, entry.answerId);
    if (!answer?.traits) continue;

    for (const [trait, value] of Object.entries(answer.traits)) {
      if (typeof value !== "number" || Number.isNaN(value)) continue;
      totals[trait] = (totals[trait] ?? 0) + value;
    }
  }

  return totals;
}

export function normalizeTraits(traits: TraitMap): TraitMap {
  const values = Object.values(traits);
  if (values.length === 0) return {};

  const magnitude = Math.sqrt(values.reduce((sum, v) => sum + v * v, 0));
  if (magnitude === 0) return { ...traits };

  const normalized: TraitMap = {};
  for (const [key, value] of Object.entries(traits)) {
    normalized[key] = value / magnitude;
  }
  return normalized;
}

export function topTraitLabels(traits: TraitMap, count = 3): string[] {
  return Object.entries(traits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([trait]) => formatTraitLabel(trait));
}

export function formatTraitLabel(trait: string): string {
  return trait.replace(/_/g, " ").toUpperCase();
}

/** Cosine similarity in [0, 1] after clamping negatives. */
export function cosineSimilarity(a: TraitMap, b: TraitMap): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const key of keys) {
    const av = a[key] ?? 0;
    const bv = b[key] ?? 0;
    dot += av * bv;
    magA += av * av;
    magB += bv * bv;
  }

  if (magA === 0 || magB === 0) return 0;
  const sim = dot / (Math.sqrt(magA) * Math.sqrt(magB));
  return Math.max(0, Math.min(1, sim));
}
