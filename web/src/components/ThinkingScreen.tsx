"use client";

const MESSAGES = [
  "THINKING...",
  "CHOOSING YOUR NEXT QUESTION...",
  "THE GAME MASTER IS THINKING...",
];

type Props = {
  messageIndex?: number;
};

export function ThinkingScreen({ messageIndex = 0 }: Props) {
  const message = MESSAGES[messageIndex % MESSAGES.length]!;

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-6 text-center animate-fade-in">
      <div className="thinking-dots" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <p className="font-pixel text-[10px] leading-6 text-[var(--dark-green)] sm:text-xs">
        {message}
      </p>
      <div className="blink-cursor font-pixel text-xs text-[var(--green)]">█</div>
    </div>
  );
}
