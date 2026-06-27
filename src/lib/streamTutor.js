// Streams a tutor reply. Calls onToken for each chunk so the UI can render
// the mentor's words as they arrive (like real speech). Returns the full text.
export async function streamTutor({
  goal,
  level,
  project,
  milestone,
  messages,
  kickoff = false,
  onToken,
  signal,
}) {
  const res = await fetch("/api/tutor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal, level, project, milestone, messages, kickoff }),
    signal,
  });

  if (!res.ok) {
    let message = "The tutor couldn't respond.";
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {}
    throw new Error(message);
  }

  // Citations (if any) come back in a header as the tutor grounds its answer.
  let citations = [];
  try {
    const raw = res.headers.get("X-Lumora-Citations");
    if (raw) citations = JSON.parse(decodeURIComponent(raw));
  } catch {}

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    full += chunk;
    if (onToken) onToken(full);
  }

  return { text: full.trim(), citations };
}
