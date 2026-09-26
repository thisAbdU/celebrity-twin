"use client";

type Props = {
  onStart: () => void;
  onHowTo: () => void;
  onAbout: () => void;
};

export function StartScreen({ onStart, onHowTo, onAbout }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center animate-fade-in">
      <div className="blink-cursor text-[var(--green)] font-pixel text-[10px]">
        ▶ INSERT PLAYER
      </div>

      <h1 className="font-pixel text-[clamp(1.35rem,5vw,2rem)] leading-relaxed text-[var(--ink)]">
        CELEBRITY
        <br />
        <span className="text-[var(--dark-green)]">TWIN</span>
      </h1>

      <p className="font-pixel text-[10px] leading-6 text-[var(--dark-green)] sm:text-xs">
        &ldquo;WHO&apos;S YOUR
        <br />
        FAMOUS ALTER EGO?&rdquo;
      </p>

      <div className="mt-2 flex w-full max-w-xs flex-col gap-3">
        <button type="button" className="game-btn game-btn-primary" onClick={onStart}>
          START GAME
        </button>
        <button type="button" className="game-btn" onClick={onHowTo}>
          HOW TO PLAY
        </button>
        <button type="button" className="game-btn" onClick={onAbout}>
          ABOUT
        </button>
      </div>

      <div className="pixel-row mt-4" aria-hidden />
    </div>
  );
}
