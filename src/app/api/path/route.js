import { getOpenAI, MODELS } from "@/lib/openai";
import {
  buildPathSystemPrompt,
  buildPathUserPrompt,
} from "@/lib/prompts";

export const runtime = "nodejs";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const goal = (body?.goal || "").toString().trim();
  const level = (body?.level || "beginner").toString();

  if (!goal) {
    return Response.json(
      { error: "Please describe what you want to learn." },
      { status: 400 }
    );
  }
  if (goal.length > 500) {
    return Response.json(
      { error: "That goal is a bit long — try keeping it under 500 characters." },
      { status: 400 }
    );
  }

  let openai;
  try {
    openai = getOpenAI();
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }

  try {
    const stream = await openai.chat.completions.create({
      model: MODELS.fast,
      // Note: GPT-5 series only supports the default temperature (1),
      // so we don't set it. JSON mode keeps output strictly structured.
      response_format: { type: "json_object" },
      stream: true,
      messages: [
        { role: "system", content: buildPathSystemPrompt() },
        { role: "user", content: buildPathUserPrompt({ goal, level }) },
      ],
    });

    // Pass the raw token stream straight to the client. The client
    // accumulates it and parses the final JSON once complete.
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const token = chunk.choices?.[0]?.delta?.content || "";
            if (token) controller.enqueue(encoder.encode(token));
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({ error: "Stream interrupted." })
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (err) {
    const detail = err?.error?.message || err?.message || "";
    const msg =
      err?.status === 401
        ? "Your OpenAI key was rejected. Check OPENAI_API_KEY in .env.local."
        : err?.status === 429
        ? "OpenAI rate limit or quota hit. Check your credit balance at platform.openai.com."
        : err?.status === 404 || /model/i.test(detail)
        ? `The model "${MODELS.fast}" wasn't accepted (${detail}). Set LUMORA_MODEL_FAST in .env.local to a model your account can access, then restart.`
        : err?.status === 400
        ? `OpenAI rejected the request: ${detail}`
        : "Something went wrong generating your path. Please try again.";
    return Response.json({ error: msg }, { status: err?.status || 500 });
  }
}
