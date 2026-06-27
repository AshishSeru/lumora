import { getOpenAI } from "@/lib/openai";

export const runtime = "nodejs";

// Transcribes recorded audio (from the browser mic) into text using Whisper,
// so the learner can talk to their mentor instead of typing.
export async function POST(req) {
  let openai;
  try {
    openai = getOpenAI();
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }

  try {
    const form = await req.formData();
    const file = form.get("audio");
    if (!file) {
      return Response.json({ error: "No audio received." }, { status: 400 });
    }

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
    });

    return Response.json({ text: transcription.text || "" });
  } catch (err) {
    const detail = err?.error?.message || err?.message || "";
    return Response.json(
      { error: `Could not transcribe: ${detail || "try again."}` },
      { status: err?.status || 500 }
    );
  }
}
