# Celebrity Twin

Retro handheld personality game. Answer ~7 situations, unlock a playful Celebrity Twin.

## Run

```bash
cd web
cp .env.example .env.local   # optional: add JEV_API_KEY
npm install
npm run dev
```

Open http://localhost:3000

## Environment

| Variable | Required | Notes |
|---|---|---|
| `JEV_API_KEY` | No | TypeSafe / Jev API key. If missing, next-question selection falls back to random candidates. |
| `TYPESAFE_API_KEY` | No | Accepted as an alias for `JEV_API_KEY`. |
| `JEV_MODEL` | No | Defaults to `jev-latest`. |

Never use `NEXT_PUBLIC_*` for these keys.

## Architecture

Browser → Next.js API routes → Jev (optional) + local JSON.

- Questions: `web/data/generated_questions.json` (copied from `question-generator/`, not regenerated)
- Celebrities: `web/data/celebrities.json`
- Trait scoring + celebrity match: deterministic, server-side
- Jev: only selects the next question ID from a candidate set

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve production build
