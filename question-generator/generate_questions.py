import json
import os
import re
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq


BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent

load_dotenv(ROOT_DIR / ".env")
load_dotenv(BASE_DIR / ".env")

PROMPT_FILE = BASE_DIR / "celebrities_prompt.txt"
OUTPUT_FILE = BASE_DIR / "generated_celebrities.json"

# Free-tier Groq TPM is ~8000 (prompt + completion). Keep batches small.
BATCH_SIZE = int(os.getenv("CELEBRITY_BATCH_SIZE", "5"))
MAX_COMPLETION_TOKENS = int(os.getenv("CELEBRITY_MAX_TOKENS", "3500"))

CELEBRITY_ID_RE = re.compile(r"^celebrity_(\d+)$")


def load_prompt() -> str:
    return (
        PROMPT_FILE.read_text(encoding="utf-8")
        .replace("{{BATCH_SIZE}}", str(BATCH_SIZE))
    )


def load_existing() -> list:
    if not OUTPUT_FILE.exists():
        return []

    raw = OUTPUT_FILE.read_text(encoding="utf-8").strip()
    if not raw:
        return []

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        print("⚠️ Existing celebrities file is invalid; starting fresh.")
        return []

    if isinstance(data, list):
        return data

    print("⚠️ Existing celebrities file is not a JSON array; starting fresh.")
    return []


def next_max_id(existing: list) -> int:
    max_id = 0
    for celebrity in existing:
        celebrity_id = celebrity.get("id", "")
        match = CELEBRITY_ID_RE.match(celebrity_id)
        if match:
            max_id = max(max_id, int(match.group(1)))
    return max_id


def extract_celebrities(payload: object) -> list | None:
    if isinstance(payload, dict):
        celebrities = payload.get("celebrities")
        if isinstance(celebrities, list):
            return celebrities
        print('❌ Expected JSON object with a "celebrities" array.')
        return None

    if isinstance(payload, list):
        return payload

    print("❌ Expected a JSON object or array.")
    return None


def save_to_file(content: str) -> None:
    try:
        payload = json.loads(content)
    except json.JSONDecodeError as e:
        print("❌ Groq returned invalid JSON.")
        print(e)
        return

    new_celebrities = extract_celebrities(payload)
    if new_celebrities is None:
        return

    if not new_celebrities:
        print("❌ Groq returned an empty celebrities list.")
        return

    existing = load_existing()
    max_id = next_max_id(existing)

    for index, celebrity in enumerate(new_celebrities, start=1):
        celebrity["id"] = f"celebrity_{max_id + index:03d}"

    all_celebrities = existing + new_celebrities

    OUTPUT_FILE.write_text(
        json.dumps(all_celebrities, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    first_id = new_celebrities[0]["id"]
    last_id = new_celebrities[-1]["id"]
    print(f"✅ Added {len(new_celebrities)} celebrities ({first_id} → {last_id}).")
    print(f"📚 Total celebrities: {len(all_celebrities)}")
    print(f"📁 Saved to: {OUTPUT_FILE}")


def main():
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is missing. Add it to celebrity-twin/.env"
        )

    prompt = load_prompt()

    print(f"🤖 Generating {BATCH_SIZE} celebrities with Groq...")

    client = Groq(api_key=api_key)

    response = client.chat.completions.create(
        model="meta-llama/llama-prompt-guard-2-22m",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.8,
        max_completion_tokens=MAX_COMPLETION_TOKENS,
    )

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError(
            "Groq returned an empty response "
            "(try a smaller CELEBRITY_BATCH_SIZE or higher CELEBRITY_MAX_TOKENS)."
        )

    save_to_file(content)


if __name__ == "__main__":
    main()
