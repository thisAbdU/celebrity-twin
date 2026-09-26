import { JEV_TIMEOUT_MS } from "./constants";
import type { PlayerAnswer, Question } from "./types";
import { summarizeAnswersForPrompt } from "./matching";

/** TypeSafe System One evaluation endpoint (Jev). */
const SYSTEMONE_URL = "https://api.typesafe.ai/v1/systemone";

type SystemOneChoiceAnswer = {
  type: "choice";
  choice: string;
  confidence?: number;
  probabilities?: Record<string, number>;
};

type SystemOneResponse = {
  model?: string;
  answers?: {
    next_question?: SystemOneChoiceAnswer;
  };
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
};

function getApiKey(): string | undefined {
  // Official env var from TypeSafe docs / SDK; JEV_API_KEY kept as alias.
  return process.env.TYPESAFE_API_KEY || process.env.JEV_API_KEY;
}

/**
 * Ask Jev (TypeSafe System One) to pick the most informative next question ID.
 *
 * Uses a Choice question: candidate question IDs are the criteria keys.
 * Returns null on any failure — caller must fall back (e.g. random candidate).
 */
export async function selectNextQuestionWithJev(
  answers: PlayerAnswer[],
  candidates: Question[],
): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn(
      "[jev] missing TYPESAFE_API_KEY (or JEV_API_KEY) — using fallback",
    );
    return null;
  }

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0]!.id;

  // Choice criteria: option id → short rubric (max 255 options per TypeSafe docs).
  const criteria: Record<string, string> = {};
  for (const q of candidates) {
    criteria[q.id] = q.question;
  }

  // State = material to evaluate. Questions = judgments about that material.
  const previousAnswers =
    summarizeAnswersForPrompt(answers) ||
    "No prior answers yet (first adaptive selection).";

  const body = {
    state: {
      game: "Celebrity Twin — a playful personality/behavior matching game (not a scientific assessment).",
      previous_answers: previousAnswers,
      selection_goal:
        "Pick the candidate that would reveal the most useful NEW personality or behavior information given previous_answers.",
    },
    model: process.env.JEV_MODEL || "jev-latest",
    questions: {
      next_question: {
        type: "choice",
        instructions:
          "Given previous_answers, which candidate question would reveal the most useful additional information about this player's personality and behavior? Choose exactly one option.",
        criteria,
      },
    },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), JEV_TIMEOUT_MS);

  try {
    const response = await fetch(SYSTEMONE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("[jev] http error", response.status, text.slice(0, 400));
      return null;
    }

    const data = (await response.json()) as SystemOneResponse;
    const answer = data.answers?.next_question;

    if (!answer || answer.type !== "choice" || typeof answer.choice !== "string") {
      console.error("[jev] invalid response shape", data);
      return null;
    }

    const validIds = new Set(candidates.map((c) => c.id));
    if (!validIds.has(answer.choice)) {
      console.error("[jev] unknown question id", answer.choice);
      return null;
    }

    return answer.choice;
  } catch (error) {
    console.error("[jev] request failed", error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
