"use client";

import type { PublicAnswer, PublicQuestion } from "@/lib/types";

type Props = {
  question: PublicQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswerId: string | null;
  disabled: boolean;
  onSelect: (answer: PublicAnswer) => void;
};

export function QuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswerId,
  disabled,
  onSelect,
}: Props) {
  const progress = `${String(questionNumber).padStart(2, "0")}/${String(totalQuestions).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-4 animate-slide-in">
      <header className="flex items-start justify-between gap-3 border-b-4 border-[var(--ink)] pb-3">
        <h2 className="font-pixel text-[10px] leading-4 text-[var(--dark-green)] sm:text-xs">
          CELEBRITY TWIN
        </h2>
        <div className="font-pixel text-[10px] text-[var(--accent)] sm:text-xs">
          ♥ {progress}
        </div>
      </header>

      <p className="font-body text-lg leading-snug text-[var(--ink)] sm:text-xl">
        {question.question}
      </p>

      <div className="mt-1 flex flex-col gap-2.5">
        {question.answers.map((answer) => {
          const selected = selectedAnswerId === answer.id;
          return (
            <button
              key={answer.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(answer)}
              className={`answer-btn text-left ${selected ? "answer-btn-selected" : ""}`}
            >
              <span className="answer-arrow font-pixel" aria-hidden>
                {selected ? "▶" : " "}
              </span>
              <span className="font-body text-base leading-snug sm:text-lg">
                {answer.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
