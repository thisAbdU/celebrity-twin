import { loadCelebrities } from "./celebrities";
import {
  accumulateTraits,
  cosineSimilarity,
  normalizeTraits,
  topTraitLabels,
} from "./traits";
import { getAnswer, getQuestionById } from "./questions";
import type { GameResult, PlayerAnswer } from "./types";

export function matchCelebrity(answers: PlayerAnswer[]): GameResult | null {
  const celebrities = loadCelebrities();
  if (celebrities.length === 0) return null;

  const playerTraits = accumulateTraits(answers);
  const normalizedPlayer = normalizeTraits(playerTraits);

  let best = celebrities[0]!;
  let bestScore = -1;

  for (const celebrity of celebrities) {
    const score = cosineSimilarity(
      normalizedPlayer,
      normalizeTraits(celebrity.traits),
    );
    if (score > bestScore) {
      bestScore = score;
      best = celebrity;
    }
  }

  const matchPercent = Math.round(55 + bestScore * 40);

  return {
    celebrity: {
      id: best.id,
      name: best.name,
      description: best.description,
      avatar: best.avatar,
    },
    matchPercent: Math.max(60, Math.min(98, matchPercent)),
    topTraits: topTraitLabels(playerTraits, 3),
    reasons: buildReasons(answers, 3),
  };
}

function buildReasons(answers: PlayerAnswer[], count: number): string[] {
  const reasons: string[] = [];

  for (const entry of answers) {
    const answer = getAnswer(entry.questionId, entry.answerId);
    if (!answer) continue;

    const reason = playfulReason(answer.text);
    if (reason && !reasons.includes(reason)) {
      reasons.push(reason);
    }
    if (reasons.length >= count) break;
  }

  while (reasons.length < Math.min(count, 2)) {
    reasons.push("You make choices that feel like you — not like a template.");
  }

  return reasons.slice(0, count);
}

function playfulReason(answerText: string): string {
  const cleaned = answerText.trim().replace(/\s+/g, " ");
  if (cleaned.length === 0) return "";

  const lower = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
  const trimmed =
    lower.length > 90 ? `${lower.slice(0, 87).trimEnd()}…` : lower;

  if (/^(pick|leave|turn|ignore|grab|suggest|offer|decline|go|stay|ask|join|accept|work|finish)/i.test(cleaned)) {
    return `You'd ${trimmed}${/[.!?]$/.test(trimmed) ? "" : "."}`;
  }

  return `Your vibe says: "${trimmed}${/[.!?]$/.test(trimmed) ? "" : "."}"`;
}

export function summarizeAnswersForPrompt(answers: PlayerAnswer[]): string {
  return answers
    .map((entry) => {
      const q = getQuestionById(entry.questionId);
      const a = getAnswer(entry.questionId, entry.answerId);
      if (!q || !a) return null;
      return `- ${entry.questionId}: "${q.question}" → ${entry.answerId}: "${a.text}"`;
    })
    .filter(Boolean)
    .join("\n");
}
