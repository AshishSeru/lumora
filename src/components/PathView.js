"use client";

import { useState } from "react";
import TutorChat from "@/components/TutorChat";
import AvatarWelcome from "@/components/AvatarWelcome";

export default function PathView({ path, goal, level, onRestart }) {
  const [openIndex, setOpenIndex] = useState(0);
  const [tutorMilestone, setTutorMilestone] = useState(null);

  if (!path?.milestones?.length) return null;

  return (
    <div className="animate-fade-up">
      {/* mentor welcome (avatar or orb) */}
      <AvatarWelcome projectName={path.project?.name} />

      {/* header */}
      <div className="mb-10">
        <p className="text-ember-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
          Your path
        </p>
        <h1 className="font-display text-4xl sm:text-5xl text-espresso-900 leading-tight mb-4">
          {path.title}
        </h1>
        {path.estimatedDays ? (
          <p className="text-espresso-700">
            About{" "}
            <span className="text-espresso-900 font-medium">
              {path.estimatedDays} focused days
            </span>{" "}
            · {path.milestones.length} milestones
          </p>
        ) : null}
      </div>

      {/* the project */}
      {path.project ? (
        <div className="rounded-2xl border border-ember-400/40 bg-gradient-to-b from-ember-400/10 to-white p-6 sm:p-7 mb-10 shadow-[0_8px_28px_rgba(43,37,32,0.06)]">
          <p className="text-ember-500 text-xs font-medium tracking-[0.18em] uppercase mb-2">
            You will build
          </p>
          <h2 className="font-display text-2xl text-espresso-900 mb-2">
            {path.project.name}
          </h2>
          <p className="text-espresso-800 leading-relaxed mb-3">
            {path.project.description}
          </p>
          {path.project.outcome ? (
            <p className="text-sm text-espresso-700">
              <span className="text-espresso-700">By the end:</span>{" "}
              {path.project.outcome}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* milestones */}
      <div className="space-y-3">
        {path.milestones.map((m, i) => {
          const open = openIndex === i;
          return (
            <div
              key={i}
              className={`rounded-2xl border transition-colors ${
                open
                  ? "border-ember-400/60 bg-white shadow-[0_8px_24px_rgba(43,37,32,0.08)]"
                  : "border-cream-300 bg-white hover:border-ember-400/40 shadow-[0_4px_14px_rgba(43,37,32,0.04)]"
              }`}
            >
              <button
                onClick={() => setOpenIndex(open ? -1 : i)}
                className="w-full flex items-center gap-4 p-5 text-left"
              >
                <span
                  className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-display text-sm ${
                    open
                      ? "bg-ember-500 text-white"
                      : "bg-cream-200 text-ember-500"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex-1">
                  <span className="block text-espresso-900 font-semibold">
                    {m.title}
                  </span>
                </span>
                <span
                  className={`text-espresso-700 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>

              {open ? (
                <div className="px-5 pb-6 pl-[4.5rem] animate-fade-up">
                  {m.summary ? (
                    <p className="text-espresso-800 leading-relaxed mb-4">
                      {m.summary}
                    </p>
                  ) : null}

                  {m.buildTask ? (
                    <div className="mb-4">
                      <p className="text-ember-500 text-xs font-medium tracking-wide uppercase mb-1">
                        Build
                      </p>
                      <p className="text-espresso-900 text-sm leading-relaxed">
                        {m.buildTask}
                      </p>
                    </div>
                  ) : null}

                  {Array.isArray(m.concepts) && m.concepts.length ? (
                    <div className="mb-4">
                      <p className="text-espresso-700 text-xs font-medium tracking-wide uppercase mb-2">
                        Concepts
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {m.concepts.map((c, ci) => (
                          <span
                            key={ci}
                            className="text-xs text-espresso-800 border border-cream-300 rounded-full px-3 py-1"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {m.checkpoint ? (
                    <div className="rounded-xl bg-cream-100 border border-cream-300 p-4">
                      <p className="text-ember-500 text-xs font-medium tracking-wide uppercase mb-1">
                        Checkpoint
                      </p>
                      <p className="text-espresso-800 text-sm leading-relaxed">
                        {m.checkpoint}
                      </p>
                    </div>
                  ) : null}

                  <button
                    onClick={() => setTutorMilestone(m)}
                    className="mt-5 inline-flex items-center gap-2 bg-ember-500 hover:bg-ember-600 text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-colors"
                  >
                    <span className="relative inline-block w-3 h-3">
                      <span className="absolute inset-0 rounded-full bg-cream-50/30" />
                    </span>
                    Learn this with your mentor →
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <button
        onClick={onRestart}
        className="mt-10 text-espresso-800 hover:text-espresso-900 transition-colors"
      >
        ← Build a different path
      </button>

      {tutorMilestone ? (
        <TutorChat
          goal={goal}
          level={level}
          project={path.project}
          milestone={tutorMilestone}
          onClose={() => setTutorMilestone(null)}
        />
      ) : null}
    </div>
  );
}
