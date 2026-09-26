"use client";

import { PixelAvatar } from "./PixelAvatar";
import type { GameResult } from "@/lib/types";

type Props = {
  result: GameResult;
  onPlayAgain: () => void;
};

export function ResultScreen({ result, onPlayAgain }: Props) {
  return (
    <div className="flex flex-col gap-5 animate-reveal text-center">
      <h2 className="font-pixel text-xs leading-6 text-[var(--dark-green)] sm:text-sm">
        YOUR CELEBRITY TWIN
      </h2>

      <PixelAvatar avatar={result.celebrity.avatar} name={result.celebrity.name} />

      <div>
        <h3 className="font-pixel text-sm leading-7 text-[var(--ink)] sm:text-base">
          {result.celebrity.name.toUpperCase()}
        </h3>
        <p className="mx-auto mt-2 max-w-md font-body text-base leading-relaxed text-[var(--ink)]">
          Your personality has a lot in common with{" "}
          <span className="font-semibold">{result.celebrity.name}</span>.
        </p>
        <p className="mt-1 font-body text-sm text-[var(--dark-green)]">
          {result.celebrity.description}
        </p>
      </div>

      <div className="font-pixel text-xl text-[var(--accent)] sm:text-2xl">
        {result.matchPercent}% MATCH
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {result.topTraits.map((trait) => (
          <span key={trait} className="trait-chip font-pixel">
            {trait}
          </span>
        ))}
      </div>

      <ul className="mx-auto mt-1 w-full max-w-md space-y-2 text-left">
        {result.reasons.map((reason) => (
          <li
            key={reason}
            className="border-l-4 border-[var(--green)] pl-3 font-body text-sm leading-relaxed text-[var(--ink)] sm:text-base"
          >
            {reason}
          </li>
        ))}
      </ul>

      <p className="font-body text-xs text-[var(--dark-green)]">
        Just a playful game match — not a scientific reading.
      </p>

      <button
        type="button"
        className="game-btn game-btn-primary mx-auto mt-2"
        onClick={onPlayAgain}
      >
        PLAY AGAIN
      </button>
    </div>
  );
}
