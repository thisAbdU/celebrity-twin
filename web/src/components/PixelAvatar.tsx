"use client";

const AVATAR_GLYPH: Record<string, string> = {
  hoodie: "◆",
  strong: "■",
  star: "★",
  rocket: "▲",
  crown: "♛",
  calm: "○",
  trophy: "▼",
  artist: "♫",
  host: "♥",
  smile: "☺",
  voice: "♪",
  rock: "⚡",
  gymnast: "✦",
  poet: "✧",
  spark: "✶",
  nature: "♣",
};

type Props = {
  avatar: string;
  name: string;
};

export function PixelAvatar({ avatar, name }: Props) {
  const glyph = AVATAR_GLYPH[avatar] ?? "★";

  return (
    <div
      className="pixel-avatar mx-auto flex h-24 w-24 items-center justify-center"
      aria-label={`${name} avatar`}
    >
      <span className="font-pixel text-3xl text-[var(--accent)]">{glyph}</span>
    </div>
  );
}
