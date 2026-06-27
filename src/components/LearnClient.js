"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Orb from "@/components/Orb";
import PathView from "@/components/PathView";
import { streamPath } from "@/lib/streamPath";

const LEVELS = [
  { id: "beginner", label: "Total beginner", hint: "New to this entirely" },
  { id: "some", label: "Some basics", hint: "I know a little" },
  { id: "rusty", label: "Rusty pro", hint: "Done it before, need a refresh" },
];

const SUGGESTIONS = [
  "Build an AI chatbot with the OpenAI API",
  "Learn Retrieval-Augmented Generation (RAG)",
  "Build and deploy a full-stack app with Next.js",
  "Get started with prompt engineering",
];

const STATES = { FORM: "form", LOADING: "loading", DONE: "done", ERROR: "error" };

export default function LearnClient() {
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("beginner");
  const [state, setState] = useState(STATES.FORM);
  const [path, setPath] = useState(null);
  const [error, setError] = useState("");
  const [tokens, setTokens] = useState(0);
  const abortRef = useRef(null);

  async function handleSubmit() {
    if (!goal.trim()) return;
    setState(STATES.LOADING);
    setError("");
    setTokens(0);
    abortRef.current = new AbortController();
    try {
      const result = await streamPath({
        goal: goal.trim(),
        level,
        signal: abortRef.current.signal,
        onProgress: (raw) => setTokens(raw.length),
      });
      setPath(result);
      setState(STATES.DONE);
    } catch (e) {
      if (e.name === "AbortError") return;
      setError(e.message || "Something went wrong.");
      setState(STATES.ERROR);
    }
  }

  function reset() {
    if (abortRef.current) abortRef.current.abort();
    setState(STATES.FORM);
    setPath(null);
    setError("");
  }

  // ---------- LOADING ----------
  if (state === STATES.LOADING) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="flex justify-center mb-8">
          <Orb size={150} />
        </div>
        <h1 className="font-display text-3xl text-espresso-900 mb-3">
          Designing your path…
        </h1>
        <p className="text-espresso-700 mb-2">
          Your mentor is shaping a project around “{goal}”.
        </p>
        <p className="text-espresso-600 text-sm tabular-nums">
          {tokens > 0 ? `thinking · ${tokens} characters written` : "thinking…"}
        </p>
        <button
          onClick={reset}
          className="mt-10 text-espresso-700 hover:text-espresso-900 transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    );
  }

  // ---------- DONE ----------
  if (state === STATES.DONE && path) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <PathView path={path} goal={goal} level={level} onRestart={reset} />
      </div>
    );
  }

  // ---------- ERROR ----------
  if (state === STATES.ERROR) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="flex justify-center mb-8 opacity-50">
          <Orb size={120} />
        </div>
        <h1 className="font-display text-3xl text-espresso-900 mb-3">
          Your path didn’t come through
        </h1>
        <p className="text-espresso-700 mb-8">{error}</p>
        <button
          onClick={() => setState(STATES.FORM)}
          className="bg-ember-500 hover:bg-ember-600 text-white font-semibold px-7 py-3 rounded-full transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // ---------- FORM ----------
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <Link href="/" className="text-espresso-700 hover:text-espresso-900 transition-colors text-sm">
        ← Back
      </Link>

      <div className="mt-8 mb-10">
        <h1 className="font-display text-4xl sm:text-5xl text-espresso-900 leading-tight mb-4">
          What do you want
          <br />
          to learn?
        </h1>
        <p className="text-espresso-700 text-lg">
          Be as specific as you like. Lumora will shape a path around it.
        </p>
      </div>

      <textarea
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="e.g. I want to build an AI app that answers questions about my documents"
        rows={3}
        maxLength={500}
        className="w-full rounded-2xl bg-white border border-cream-300 focus:border-ember-400/70 focus:outline-none focus:ring-2 focus:ring-ember-400/30 text-espresso-900 placeholder:text-espresso-600 p-5 text-lg resize-none transition-colors"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setGoal(s)}
            className="text-xs text-espresso-700 hover:text-espresso-900 border border-cream-300 hover:border-ember-400/50 rounded-full px-3 py-1.5 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-10">
        <p className="text-espresso-900 font-medium mb-3">Where are you starting?</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLevel(l.id)}
              className={`text-left rounded-xl border p-4 transition-colors ${
                level === l.id
                  ? "border-ember-500/70 bg-ember-500/10"
                  : "border-cream-300 bg-cream-100 hover:border-cream-300"
              }`}
            >
              <div className="text-espresso-900 font-medium text-sm">{l.label}</div>
              <div className="text-espresso-700 text-xs mt-1">{l.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!goal.trim()}
        className="mt-10 w-full bg-ember-500 enabled:hover:bg-ember-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-full transition-colors text-lg"
      >
        Build my path
      </button>
    </div>
  );
}
