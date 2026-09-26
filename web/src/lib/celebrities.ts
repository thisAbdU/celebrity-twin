import { readFileSync } from "fs";
import path from "path";
import type { Celebrity } from "./types";

let cached: Celebrity[] | null = null;

export function loadCelebrities(): Celebrity[] {
  if (cached) return cached;

  try {
    const raw = readFileSync(
      path.join(process.cwd(), "data", "celebrities.json"),
      "utf-8",
    );
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      console.error("[celebrities] expected array");
      cached = [];
      return cached;
    }

    cached = parsed.filter(isValidCelebrity);
    return cached;
  } catch (error) {
    console.error("[celebrities] failed to load", error);
    cached = [];
    return cached;
  }
}

function isValidCelebrity(value: unknown): value is Celebrity {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<Celebrity>;
  return (
    typeof c.id === "string" &&
    typeof c.name === "string" &&
    typeof c.description === "string" &&
    typeof c.avatar === "string" &&
    !!c.traits &&
    typeof c.traits === "object"
  );
}
