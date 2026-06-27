import { getOpenAI, MODELS } from "@/lib/openai";
import {
  buildTutorSystemPrompt,
  buildTutorKickoffPrompt,
} from "@/lib/tutorPrompts";
import { retrieve, formatContext } from "@/lib/retriever";

export const runtime = "nodejs";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { goal, level, project, milestone, messages, kickoff } = body || {};

  if (!goal) {
    return Response.json({ error: "Missing learning context." }, { status: 400 });
  }

  // RAG: retrieve relevant knowledge for the learner's latest question,
  // so the tutor's answer is grounded and citable.
  let context = "";
  let citations = [];
  if (!kickoff && Array.isArray(messages) && messages.length) {
    const lastUser = [...messages].reverse().find((m) => m?.role === "user");
    if (lastUser?.content) {
      const chunks = await retrieve(lastUser.content, 3);
      const formatted = formatContext(chunks);
      context = formatted.context;
      citations = formatted.citations;
    }
  }

  // Build the conversation. System prompt carries all teaching context.
  const system = buildTutorSystemPrompt({ goal, level, project, milestone, context });

  const chat = [{ role: "system", content: system }];

  if (kickoff) {
    // No learner message yet — ask the tutor to open the milestone.
    chat.push({ role: "user", content: buildTutorKickoffPrompt() });
  } else {
    // Append the real conversation history (already {role, content}).
    if (Array.isArray(messages)) {
      for (const m of messages) {
        if (
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
        ) {
          chat.push({ role: m.role, content: m.content.slice(0, 4000) });
        }
      }
    }
  }

  let openai;
  try {
    openai = getOpenAI();
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }

  try {
    const stream = await openai.chat.completions.create({
      model: MODELS.deep, // GPT-5.5 — the teaching quality matters here
      stream: true,
      messages: chat,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const token = chunk.choices?.[0]?.delta?.content || "";
            if (token) controller.enqueue(encoder.encode(token));
          }
        } catch {
          // stream ends; client handles partial gracefully
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Lumora-Citations": encodeURIComponent(JSON.stringify(citations)),
      },
    });
  } catch (err) {
    const detail = err?.error?.message || err?.message || "";
    const msg =
      err?.status === 401
        ? "Your OpenAI key was rejected. Check OPENAI_API_KEY in .env.local."
        : err?.status === 429
        ? "OpenAI rate limit or quota hit. Check your credit balance."
        : err?.status === 404 || /model/i.test(detail)
        ? `The model "${MODELS.deep}" wasn't accepted (${detail}). Set LUMORA_MODEL_DEEP in .env.local to a model you can access, then restart.`
        : `The tutor hit a problem: ${detail || "please try again."}`;
    return Response.json({ error: msg }, { status: err?.status || 500 });
  }
}
