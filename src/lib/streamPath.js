// Calls the streaming /api/path endpoint, accumulates tokens, and returns
// the parsed path object. onProgress receives the growing raw text so the UI
// can show a "thinking / writing" state live.
export async function streamPath({ goal, level, onProgress, signal }) {
  const res = await fetch("/api/path", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal, level }),
    signal,
  });

  if (!res.ok) {
    let message = "Could not generate your path.";
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {}
    throw new Error(message);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let raw = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    raw += decoder.decode(value, { stream: true });
    if (onProgress) onProgress(raw);
  }

  const parsed = safeParse(raw);
  if (!parsed) {
    throw new Error("Your mentor's reply came back garbled. Try again.");
  }
  if (parsed.error) {
    throw new Error(parsed.error);
  }
  return parsed;
}

// Tolerant JSON parse: handles stray code fences or trailing characters
// that can occasionally slip into a streamed response.
function safeParse(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {}
  const cleaned = text
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {}
  // last resort: grab the outermost {...}
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    try {
      return JSON.parse(cleaned.slice(first, last + 1));
    } catch {}
  }
  return null;
}
