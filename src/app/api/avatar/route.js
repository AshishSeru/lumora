export const runtime = "nodejs";

// Generates a short talking-head "welcome" video via D-ID, used once on the
// path screen as a wow-factor greeting. Entirely optional: if DID_API_KEY is
// not set (or D-ID fails), this returns a clear signal and the UI falls back
// to Lumora's glowing orb. Never blocks or breaks the core app.

const DID_BASE = "https://api.d-id.com";

// A neutral, friendly default presenter image (D-ID's public sample).
const DEFAULT_PRESENTER =
  process.env.DID_PRESENTER_URL ||
  "https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.png";

export async function POST(req) {
  if (!process.env.DID_API_KEY) {
    // No key configured — tell the client to use the orb fallback.
    return Response.json({ available: false }, { status: 200 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const text = (body?.text || "").toString().slice(0, 500).trim();
  if (!text) {
    return Response.json({ error: "No greeting text." }, { status: 400 });
  }

  const auth = `Basic ${process.env.DID_API_KEY}`;

  try {
    // 1) Create the talk
    const createRes = await fetch(`${DID_BASE}/talks`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_url: DEFAULT_PRESENTER,
        script: {
          type: "text",
          input: text,
          provider: { type: "microsoft", voice_id: "en-US-JennyNeural" },
        },
      }),
    });

    if (!createRes.ok) {
      const detail = await safeText(createRes);
      return Response.json(
        { available: false, error: `D-ID create failed: ${createRes.status} ${detail}` },
        { status: 200 }
      );
    }

    const created = await createRes.json();
    const id = created.id;
    if (!id) {
      return Response.json({ available: false }, { status: 200 });
    }

    // 2) Poll until the video is ready (cap the wait so we never hang)
    const maxAttempts = 20;
    for (let i = 0; i < maxAttempts; i++) {
      await sleep(1500);
      const getRes = await fetch(`${DID_BASE}/talks/${id}`, {
        headers: { Authorization: auth },
      });
      if (!getRes.ok) continue;
      const data = await getRes.json();
      if (data.status === "done" && data.result_url) {
        return Response.json({ available: true, videoUrl: data.result_url });
      }
      if (data.status === "error" || data.status === "rejected") {
        return Response.json({ available: false }, { status: 200 });
      }
    }

    // Timed out — fall back gracefully
    return Response.json({ available: false, error: "timeout" }, { status: 200 });
  } catch (err) {
    return Response.json(
      { available: false, error: err?.message || "avatar failed" },
      { status: 200 }
    );
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
async function safeText(res) {
  try {
    return (await res.text()).slice(0, 200);
  } catch {
    return "";
  }
}
