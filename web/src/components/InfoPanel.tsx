"use client";

import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
  onBack: () => void;
};

export function InfoPanel({ title, children, onBack }: Props) {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <h2 className="font-pixel text-sm text-[var(--dark-green)]">{title}</h2>
      <div className="font-body text-base leading-relaxed text-[var(--ink)]">
        {children}
      </div>
      <button type="button" className="game-btn mt-2 self-start" onClick={onBack}>
        ◀ BACK
      </button>
    </div>
  );
}
