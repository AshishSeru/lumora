// Client-side voice helpers for Lumora's tutor.

// ---- Text to speech ----
// Plays the mentor's text as audio. Returns an HTMLAudioElement so the caller
// can stop it. Falls back to the browser's built-in speech synthesis if the
// server TTS call fails, so voice never fully breaks.
export async function speak(text, { onEnd } = {}) {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error("tts failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => {
      URL.revokeObjectURL(url);
      if (onEnd) onEnd();
    };
    await audio.play();
    return audio;
  } catch {
    // Browser-native fallback (free, no API).
    return browserSpeak(text, onEnd);
  }
}

function browserSpeak(text, onEnd) {
  try {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return null;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    if (onEnd) utter.onend = onEnd;
    window.speechSynthesis.speak(utter);
    // Return a shim with a .pause()-like stop
    return {
      _native: true,
      pause() {
        window.speechSynthesis.cancel();
      },
    };
  } catch {
    if (onEnd) onEnd();
    return null;
  }
}

export function stopSpeaking(audio) {
  try {
    if (!audio) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }
    if (audio._native) {
      audio.pause();
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  } catch {}
}

// ---- Mic recording for speech to text ----
// Returns a recorder object with start() and stop(). stop() resolves to the
// transcribed text from the server (Whisper).
export function createRecorder() {
  let mediaRecorder = null;
  let chunks = [];
  let stream = null;

  return {
    async start() {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.start();
    },

    async stop() {
      return new Promise((resolve, reject) => {
        if (!mediaRecorder) {
          resolve("");
          return;
        }
        mediaRecorder.onstop = async () => {
          try {
            const blob = new Blob(chunks, { type: "audio/webm" });
            // release the mic
            if (stream) stream.getTracks().forEach((t) => t.stop());
            const form = new FormData();
            form.append("audio", blob, "speech.webm");
            const res = await fetch("/api/stt", { method: "POST", body: form });
            const data = await res.json();
            if (!res.ok) {
              reject(new Error(data?.error || "Transcription failed."));
              return;
            }
            resolve((data.text || "").trim());
          } catch (e) {
            reject(e);
          }
        };
        mediaRecorder.stop();
      });
    },
  };
}
