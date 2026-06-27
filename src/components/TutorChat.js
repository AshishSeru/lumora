"use client";

import { useState, useRef, useEffect } from "react";
import { streamTutor } from "@/lib/streamTutor";
import { speak, stopSpeaking, createRecorder } from "@/lib/voice";

export default function TutorChat({ goal, level, project, milestone, onClose }) {
  const [messages, setMessages] = useState([]); // {role, content}
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [voiceOn, setVoiceOn] = useState(true); // auto-speak mentor replies
  const [speaking, setSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);
  const startedRef = useRef(false);
  const audioRef = useRef(null);
  const recorderRef = useRef(null);

  // Auto-scroll to the newest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  // Clean up any audio when the panel closes
  useEffect(() => {
    return () => stopSpeaking(audioRef.current);
  }, []);

  // Speak a piece of text aloud (used for mentor replies)
  async function speakText(text) {
    if (!text) return;
    stopSpeaking(audioRef.current);
    setSpeaking(true);
    audioRef.current = await speak(text, { onEnd: () => setSpeaking(false) });
  }

  function toggleStopSpeaking() {
    stopSpeaking(audioRef.current);
    setSpeaking(false);
  }

  // Kick off: the mentor greets and opens the milestone once on mount
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    runKickoff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runKickoff() {
    setStreaming(true);
    setError("");
    setMessages([{ role: "assistant", content: "" }]);
    abortRef.current = new AbortController();
    try {
      const result = await streamTutor({
        goal,
        level,
        project,
        milestone,
        messages: [],
        kickoff: true,
        signal: abortRef.current.signal,
        onToken: (full) =>
          setMessages([{ role: "assistant", content: full }]),
      });
      if (voiceOn && result?.text) speakText(result.text);
    } catch (e) {
      if (e.name !== "AbortError") {
        setError(e.message);
        setMessages([]);
      }
    } finally {
      setStreaming(false);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);
    setError("");
    abortRef.current = new AbortController();

    try {
      const { text: text2, citations } = await streamTutor({
        goal,
        level,
        project,
        milestone,
        messages: nextMessages,
        signal: abortRef.current.signal,
        onToken: (full) =>
          setMessages([...nextMessages, { role: "assistant", content: full }]),
      });
      // attach citations to the final assistant message
      if (citations && citations.length) {
        setMessages((cur) => {
          const copy = [...cur];
          const last = copy[copy.length - 1];
          if (last && last.role === "assistant") {
            copy[copy.length - 1] = { ...last, citations };
          }
          return copy;
        });
      }
      if (voiceOn && text2) speakText(text2);
    } catch (e) {
      if (e.name !== "AbortError") {
        setError(e.message);
        // drop the empty assistant bubble
        setMessages(nextMessages);
      }
    } finally {
      setStreaming(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  async function toggleMic() {
    if (recording) {
      // stop and transcribe
      setRecording(false);
      setTranscribing(true);
      try {
        const text = await recorderRef.current.stop();
        if (text) setInput((cur) => (cur ? cur + " " + text : text));
      } catch (e) {
        setError(e.message || "Could not capture audio.");
      } finally {
        setTranscribing(false);
        recorderRef.current = null;
      }
    } else {
      // start recording
      try {
        toggleStopSpeaking(); // don't record over the mentor's voice
        recorderRef.current = createRecorder();
        await recorderRef.current.start();
        setRecording(true);
        setError("");
      } catch (e) {
        setError("Microphone access was blocked. Allow mic permission to talk.");
        recorderRef.current = null;
      }
    }
  }

  function retryKickoff() {
    startedRef.current = false;
    setError("");
    runKickoff();
    startedRef.current = true;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-espresso-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* panel */}
      <div className="relative w-full sm:max-w-2xl h-[85vh] sm:h-[80vh] bg-white border border-cream-300 sm:rounded-3xl rounded-t-3xl flex flex-col overflow-hidden shadow-2xl animate-fade-up">
        {/* header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-cream-300">
          <span className="relative inline-block w-9 h-9 flex-shrink-0">
            <span className="absolute inset-0 rounded-full bg-ember-500 blur-[5px] opacity-70 animate-pulse-glow" />
            <span className="absolute inset-1.5 rounded-full bg-gradient-to-br from-ember-400 to-amber-400" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-espresso-900 font-semibold text-sm truncate">
              {milestone?.title || "Your mentor"}
            </p>
            <p className="text-espresso-700 text-xs">
              {speaking ? "speaking…" : "Lumora · your mentor"}
            </p>
          </div>
          <button
            onClick={() => {
              if (voiceOn) toggleStopSpeaking();
              setVoiceOn((v) => !v);
            }}
            className={`transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-200 ${
              voiceOn ? "text-ember-500" : "text-espresso-700"
            }`}
            aria-label={voiceOn ? "Mute mentor voice" : "Unmute mentor voice"}
            title={voiceOn ? "Voice on" : "Voice off"}
          >
            {voiceOn ? "🔊" : "🔈"}
          </button>
          <button
            onClick={onClose}
            className="text-espresso-700 hover:text-espresso-900 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-200"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {messages.map((m, i) => (
            <Bubble
              key={i}
              role={m.role}
              content={m.content}
              citations={m.citations}
              onSpeak={() => speakText(m.content)}
              streaming={streaming && i === messages.length - 1 && m.role === "assistant"}
            />
          ))}

          {error ? (
            <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
              {error}
              <button
                onClick={retryKickoff}
                className="block mt-2 text-ember-500 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : null}
        </div>

        {/* checkpoint hint */}
        {milestone?.checkpoint ? (
          <div className="px-5 py-2 border-t border-cream-300">
            <p className="text-xs text-espresso-700">
              <span className="text-ember-500">Checkpoint:</span>{" "}
              {milestone.checkpoint}
            </p>
          </div>
        ) : null}

        {/* input */}
        <div className="px-4 py-3 border-t border-cream-300 flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything, or answer your mentor…"
            rows={1}
            className="flex-1 resize-none bg-cream-100 border border-cream-300 focus:border-ember-400/70 focus:outline-none rounded-2xl text-espresso-900 placeholder:text-espresso-600 px-4 py-3 text-sm max-h-32"
          />
          <button
            onClick={toggleMic}
            disabled={transcribing || streaming}
            className={`flex-shrink-0 w-11 h-11 rounded-full transition-colors flex items-center justify-center border disabled:opacity-40 disabled:cursor-not-allowed ${
              recording
                ? "bg-red-500/20 border-red-400/50 text-red-300 animate-pulse-glow"
                : "bg-cream-100 border-cream-300 text-espresso-900 hover:border-ember-400/60"
            }`}
            aria-label={recording ? "Stop recording" : "Talk to your mentor"}
            title={recording ? "Stop & send" : "Hold a thought? Tap to talk"}
          >
            {transcribing ? "…" : recording ? "■" : "🎤"}
          </button>
          <button
            onClick={send}
            disabled={!input.trim() || streaming}
            className="flex-shrink-0 bg-ember-500 enabled:hover:bg-ember-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold w-11 h-11 rounded-full transition-colors flex items-center justify-center"
            aria-label="Send"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, content, citations, onSpeak, streaming }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`group max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-ember-500 text-white"
            : "bg-cream-100 text-espresso-900 border border-cream-300"
        }`}
      >
        {content || (streaming ? <Thinking /> : "")}
        {streaming && content ? (
          <span className="inline-block w-1.5 h-4 ml-0.5 bg-ember-500 align-middle animate-pulse-glow" />
        ) : null}

        {!isUser && content && !streaming ? (
          <button
            onClick={onSpeak}
            className="ml-2 text-espresso-700 hover:text-ember-500 transition-colors text-xs align-middle"
            aria-label="Play this aloud"
            title="Play aloud"
          >
            🔊
          </button>
        ) : null}

        {!isUser && citations && citations.length ? (
          <div className="mt-3 pt-3 border-t border-cream-300 flex flex-wrap gap-1.5">
            <span className="text-[10px] uppercase tracking-wide text-espresso-600 w-full mb-0.5">
              Grounded in
            </span>
            {citations.map((c) => (
              <span
                key={c.n}
                className="text-[11px] text-ember-500 bg-ember-400/12 border border-ember-400/30 rounded-full px-2 py-0.5"
                title={c.title}
              >
                {c.n}. {c.source}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Thinking() {
  return (
    <span className="inline-flex gap-1 items-center text-espresso-700">
      <span className="w-1.5 h-1.5 rounded-full bg-espresso-600 animate-pulse-glow" />
      <span
        className="w-1.5 h-1.5 rounded-full bg-espresso-600 animate-pulse-glow"
        style={{ animationDelay: "0.2s" }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-espresso-600 animate-pulse-glow"
        style={{ animationDelay: "0.4s" }}
      />
    </span>
  );
}
