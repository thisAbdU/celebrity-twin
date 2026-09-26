"use client";

import { useState } from "react";
import { TOTAL_QUESTIONS } from "@/lib/constants";
import type {
  GamePhase,
  GameResult,
  PlayerAnswer,
  PublicAnswer,
  PublicQuestion,
} from "@/lib/types";
import { StartScreen } from "./StartScreen";
import { InfoPanel } from "./InfoPanel";
import { QuestionScreen } from "./QuestionScreen";
import { ThinkingScreen } from "./ThinkingScreen";
import { ResultScreen } from "./ResultScreen";

export function GameApp() {
  const [phase, setPhase] = useState<GamePhase>("start");
  const [question, setQuestion] = useState<PublicQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(TOTAL_QUESTIONS);
  const [answers, setAnswers] = useState<PlayerAnswer[]>([]);
  const [askedQuestionIds, setAskedQuestionIds] = useState<string[]>([]);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [thinkMsg, setThinkMsg] = useState(0);

  function resetToStart() {
    setPhase("start");
    setQuestion(null);
    setQuestionNumber(1);
    setAnswers([]);
    setAskedQuestionIds([]);
    setSelectedAnswerId(null);
    setResult(null);
  }

  async function startGame() {
    setPhase("loading");
    setAnswers([]);
    setAskedQuestionIds([]);
    setSelectedAnswerId(null);
    setResult(null);

    try {
      const res = await fetch("/api/game/start", { method: "POST" });
      if (!res.ok) throw new Error("start failed");
      const data = (await res.json()) as {
        question: PublicQuestion;
        totalQuestions: number;
        questionNumber: number;
      };
      setQuestion(data.question);
      setTotalQuestions(data.totalQuestions ?? TOTAL_QUESTIONS);
      setQuestionNumber(data.questionNumber ?? 1);
      setAskedQuestionIds([data.question.id]);
      setPhase("question");
    } catch (error) {
      console.error(error);
      // Still keep the player in the game flow
      setPhase("start");
    }
  }

  async function handleSelect(answer: PublicAnswer) {
    if (!question || phase !== "question") return;

    setSelectedAnswerId(answer.id);
    setPhase("selected");

    const nextAnswers: PlayerAnswer[] = [
      ...answers,
      { questionId: question.id, answerId: answer.id },
    ];
    setAnswers(nextAnswers);

    await wait(380);

    if (nextAnswers.length >= totalQuestions) {
      setPhase("thinking");
      setThinkMsg(0);
      await fetchResult(nextAnswers);
      return;
    }

    setPhase("thinking");
    setThinkMsg(nextAnswers.length % 3);
    await fetchNextQuestion(nextAnswers, [...askedQuestionIds]);
  }

  async function fetchNextQuestion(
    currentAnswers: PlayerAnswer[],
    askedIds: string[],
  ) {
    try {
      const res = await fetch("/api/game/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          askedQuestionIds: askedIds,
          answers: currentAnswers,
        }),
      });

      if (!res.ok) throw new Error("next-question failed");

      const data = (await res.json()) as {
        done?: boolean;
        question: PublicQuestion | null;
        questionNumber?: number;
        totalQuestions?: number;
      };

      if (data.done || !data.question) {
        await fetchResult(currentAnswers);
        return;
      }

      setQuestion(data.question);
      setQuestionNumber(data.questionNumber ?? currentAnswers.length + 1);
      if (data.totalQuestions) setTotalQuestions(data.totalQuestions);
      setAskedQuestionIds([...askedIds, data.question.id]);
      setSelectedAnswerId(null);
      setPhase("question");
    } catch (error) {
      console.error(error);
      // Soft recovery: try to finish with what we have
      if (currentAnswers.length > 0) {
        await fetchResult(currentAnswers);
      } else {
        setPhase("start");
      }
    }
  }

  async function fetchResult(currentAnswers: PlayerAnswer[]) {
    try {
      const res = await fetch("/api/game/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: currentAnswers }),
      });
      if (!res.ok) throw new Error("result failed");
      const data = (await res.json()) as GameResult;
      setResult(data);
      setPhase("result");
    } catch (error) {
      console.error(error);
      setPhase("start");
    }
  }

  return (
    <div className="game-shell">
      <div className="game-bezel">
        <div className="game-screen">
          {phase === "start" && (
            <StartScreen
              onStart={startGame}
              onHowTo={() => setPhase("howto")}
              onAbout={() => setPhase("about")}
            />
          )}

          {phase === "howto" && (
            <InfoPanel title="HOW TO PLAY" onBack={() => setPhase("start")}>
              <p>
                Answer {TOTAL_QUESTIONS} quirky situation questions. There are no
                wrong answers — just pick what feels most like you.
              </p>
              <p className="mt-3">
                The game master picks each next question based on what you&apos;ve
                already said. At the end, you unlock your Celebrity Twin.
              </p>
            </InfoPanel>
          )}

          {phase === "about" && (
            <InfoPanel title="ABOUT" onBack={() => setPhase("start")}>
              <p>
                Celebrity Twin is a retro personality game. Matches are playful
                vibes based on your choices — not looks, and not science.
              </p>
              <p className="mt-3">
                Press START, answer honestly (or chaotically), and meet your
                famous alter ego.
              </p>
            </InfoPanel>
          )}

          {(phase === "loading" || phase === "thinking") && (
            <ThinkingScreen messageIndex={thinkMsg} />
          )}

          {(phase === "question" || phase === "selected") && question && (
            <QuestionScreen
              question={question}
              questionNumber={questionNumber}
              totalQuestions={totalQuestions}
              selectedAnswerId={selectedAnswerId}
              disabled={phase === "selected"}
              onSelect={handleSelect}
            />
          )}

          {phase === "result" && result && (
            <ResultScreen result={result} onPlayAgain={resetToStart} />
          )}
        </div>
      </div>
      <p className="mt-3 text-center font-pixel text-[8px] tracking-widest text-[var(--dark-green)] opacity-70">
        CELEBRITY TWIN · HANDHELD EDITION
      </p>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
