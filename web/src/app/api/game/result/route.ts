import { NextResponse } from "next/server";
import { matchCelebrity } from "@/lib/matching";
import type { PlayerAnswer } from "@/lib/types";

type Body = {
  answers?: PlayerAnswer[];
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const answers = Array.isArray(body.answers)
    ? body.answers.filter(
        (a) =>
          a &&
          typeof a.questionId === "string" &&
          typeof a.answerId === "string",
      )
    : [];

  if (answers.length === 0) {
    return NextResponse.json({ error: "No answers provided" }, { status: 400 });
  }

  const result = matchCelebrity(answers);
  if (!result) {
    return NextResponse.json(
      { error: "Could not calculate result" },
      { status: 500 },
    );
  }

  return NextResponse.json(result);
}
