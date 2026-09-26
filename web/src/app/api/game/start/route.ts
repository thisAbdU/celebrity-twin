import { NextResponse } from "next/server";
import { TOTAL_QUESTIONS } from "@/lib/constants";
import { pickRandomQuestion, toPublicQuestion } from "@/lib/questions";

export async function POST() {
  const question = pickRandomQuestion();
  if (!question) {
    return NextResponse.json(
      { error: "No questions available" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    question: toPublicQuestion(question),
    totalQuestions: TOTAL_QUESTIONS,
    questionNumber: 1,
  });
}
