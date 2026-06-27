import OpenAI from "openai";

// Server-only OpenAI client. The key is read from the environment and
// never reaches the browser. Throws a clear error if it's missing.
let client = null;

export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not set. Copy .env.example to .env.local and add your key."
    );
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

// Central model config so we can tune cost/quality in one place.
// Overridable via .env.local without touching code, in case OpenAI
// renames a model or you want to try another.
export const MODELS = {
  // Cost-efficient workhorse: path generation and routine structured tasks.
  fast: process.env.LUMORA_MODEL_FAST || "gpt-5.4-mini",
  // Frontier model: the tutor's live teaching and reasoning (Slice 3).
  deep: process.env.LUMORA_MODEL_DEEP || "gpt-5.5",
};
