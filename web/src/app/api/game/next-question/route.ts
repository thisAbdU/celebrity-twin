import { NextResponse } from "next/server";
import { CANDIDATE_SET_SIZE, TOTAL_QUESTIONS } from "@/lib/constants";
import { selectNextQuestionWithJev } from "@/lib/jev";
import {
  buildCandidateSet,
  getQuestionById,
  toPublicQuestion,
} from "@/lib/questions";
import type { PlayerAnswer } from "@/lib/types";

type Body = {
  askedQuestionIds?: string[];
  answers?: PlayerAnswer[];
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const askedQuestionIds = Array.isArray(body.askedQuestionIds)
    ? body.askedQuestionIds.filter((id) => typeof id === "string")
    : [];
  const answers = Array.isArray(body.answers)
    ? body.answers.filter(
        (a) =>
          a &&
          typeof a.questionId === "string" &&
          typeof a.answerId === "string",
      )
    : [];

  if (answers.length >= TOTAL_QUESTIONS) {
    return NextResponse.json({
      done: true,
      question: null,
      totalQuestions: TOTAL_QUESTIONS,
      questionNumber: TOTAL_QUESTIONS,
    });
  }

  const candidates = buildCandidateSet(askedQuestionIds, CANDIDATE_SET_SIZE);
  if (candidates.length === 0) {
    return NextResponse.json({
      done: true,
      question: null,
      totalQuestions: TOTAL_QUESTIONS,
      questionNumber: answers.length,
    });
  }

  let selectedId = await selectNextQuestionWithJev(answers, candidates);

  if (!selectedId || !candidates.some((c) => c.id === selectedId)) {
    selectedId =
      candidates[Math.floor(Math.random() * candidates.length)]?.id ?? null;
  }

  const question = selectedId ? getQuestionById(selectedId) : null;
  if (!question) {
    const fallback = candidates[0]!;
    return NextResponse.json({
      done: false,
      question: toPublicQuestion(fallback),
      totalQuestions: TOTAL_QUESTIONS,
      questionNumber: answers.length + 1,
    });
  }

  return NextResponse.json({
    done: false,
    question: toPublicQuestion(question),
    totalQuestions: TOTAL_QUESTIONS,
    questionNumber: answers.length + 1,
  });
}
