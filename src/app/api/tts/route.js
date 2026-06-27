import { getOpenAI } from "@/lib/openai";

export const runtime = "nodejs";

// Turns the mentor's text into spoken audio. Uses ElevenLabs if a key is set
// (more natural voice), otherwise falls back to OpenAI TTS (always available
// since you already have that key). Returns audio bytes the browser can play.
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const text = (body?.text || "").toString().slice(0, 4000).trim();
  if (!text) {
    return Response.json({ error: "No text to speak." }, { status: 400 });
  }

  // Prefer ElevenLabs when configured.
  if (process.env.ELEVENLABS_API_KEY) {
    try {
      const audio = await elevenLabsTTS(text);
      return new Response(audio, {
        headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
      });
    } catch (e) {
      // fall through to OpenAI if ElevenLabs fails
    }
  }

  // OpenAI TTS fallback (default).
  try {
    const openai = getOpenAI();
    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: text,
    });
    const buffer = Buffer.from(await speech.arrayBuffer());
    return new Response(buffer, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch (err) {
    const detail = err?.error?.message || err?.message || "";
    return Response.json(
      { error: `Voice generation failed: ${detail || "try again."}` },
      { status: err?.status || 500 }
    );
  }
}

// Default ElevenLabs voice: "Rachel" (a warm, clear preset voice id).
const ELEVEN_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

async function elevenLabsTTS(text) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}
