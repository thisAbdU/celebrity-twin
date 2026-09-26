import { readFileSync } from "fs";
import path from "path";
import type { AnswerOption, PlayerAnswer, PublicQuestion, Question } from "./types";

let cachedQuestions: Question[] | null = null;

function questionsPath(): string {
  return path.join(process.cwd(), "data", "generated_questions.json");
}

export function loadQuestions(): Question[] {
  if (cachedQuestions) return cachedQuestions;

  try {
    const raw = readFileSync(questionsPath(), "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      console.error("[questions] expected array");
      cachedQuestions = [];
      return cachedQuestions;
    }

    cachedQuestions = parsed
      .filter(isValidQuestion)
      .map((q) => ({
        ...q,
        answers: q.answers.map((answer, index) => ({
          ...answer,
          // Normalize IDs — generator batches sometimes reused answer prefixes
          id: `${q.id}_a${index + 1}`,
        })),
      }));
    return cachedQuestions;
  } catch (error) {
    console.error("[questions] failed to load", error);
    cachedQuestions = [];
    return cachedQuestions;
  }
}

function isValidQuestion(value: unknown): value is Question {
  if (!value || typeof value !== "object") return false;
  const q = value as Partial<Question>;
  if (typeof q.id !== "string" || typeof q.question !== "string") return false;
  if (!Array.isArray(q.answers) || q.answers.length < 2) return false;
  return q.answers.every(
    (a) =>
      a &&
      typeof a.id === "string" &&
      typeof a.text === "string" &&
      a.traits &&
      typeof a.traits === "object",
  );
}

export function toPublicQuestion(question: Question): PublicQuestion {
  return {
    id: question.id,
    question: question.question,
    answers: question.answers.map((a) => ({ id: a.id, text: a.text })),
  };
}

export function getQuestionById(id: string): Question | undefined {
  return loadQuestions().find((q) => q.id === id);
}

export function getAnswer(
  questionId: string,
  answerId: string,
): AnswerOption | undefined {
  const question = getQuestionById(questionId);
  return question?.answers.find((a) => a.id === answerId);
}

export function pickRandomQuestion(excludeIds: string[] = []): Question | null {
  const pool = loadQuestions().filter((q) => !excludeIds.includes(q.id));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

export function buildCandidateSet(
  askedQuestionIds: string[],
  size: number,
): Question[] {
  const remaining = loadQuestions().filter(
    (q) => !askedQuestionIds.includes(q.id),
  );
  if (remaining.length <= size) return remaining;

  const shuffled = [...remaining];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = tmp;
  }
  return shuffled.slice(0, size);
}

export function resolveAnswerTexts(answers: PlayerAnswer[]): string[] {
  const lines: string[] = [];
  for (const entry of answers) {
    const answer = getAnswer(entry.questionId, entry.answerId);
    const question = getQuestionById(entry.questionId);
    if (!answer || !question) continue;
    lines.push(`${question.question} → ${answer.text}`);
  }
  return lines;
}
