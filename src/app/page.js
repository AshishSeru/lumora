import Link from "next/link";
import NavBar from "@/components/NavBar";
import Orb from "@/components/Orb";

export default function Home() {
  return (
    <main className="min-h-screen">
      <NavBar />

      {/* ---------- HERO ---------- */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 sm:pt-24">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="animate-fade-up">
            <p className="text-ember-500 text-sm font-medium tracking-[0.2em] uppercase mb-5">
              Learn by building
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-espresso-900">
              Stop drowning
              <br />
              in tutorials.
              <br />
              <span className="text-ember-500">Start building.</span>
            </h1>
            <p className="mt-7 text-lg text-espresso-700 max-w-xl leading-relaxed">
              Tell Lumora what you want to learn. It builds you a
              personalized, project-based path — then a mentor talks you
              through every step, checks you understand, and adapts as you go.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/learn"
                className="bg-ember-500 hover:bg-ember-600 text-white font-semibold px-7 py-3.5 rounded-full transition-colors text-base"
              >
                Build my learning path
              </Link>
              <a
                href="#how"
                className="text-espresso-800 hover:text-espresso-900 px-2 py-3.5 transition-colors text-base"
              >
                See how it works →
              </a>
            </div>

            <p className="mt-6 text-sm text-espresso-600">
              Focused on tech &amp; AI skills. Free to try.
            </p>
          </div>

          {/* signature visual */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <Orb size={300} />
              <p className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap font-display italic text-espresso-700 text-sm">
                your mentor, ready
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl sm:text-4xl text-espresso-900 mb-3">
          Four steps from lost to launched
        </h2>
        <p className="text-espresso-700 mb-14 max-w-2xl">
          Lumora is the opposite of a playlist of videos. It is a guided
          path with a teacher attached.
        </p>

        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              n: "01",
              t: "Tell it your goal",
              d: "“I want to learn how to build AI apps.” Set your level — total beginner to rusty pro.",
            },
            {
              n: "02",
              t: "Get your path",
              d: "Lumora designs a day-by-day plan built around shipping one real project, not endless theory.",
            },
            {
              n: "03",
              t: "Learn out loud",
              d: "Your mentor explains each step aloud, answers questions, and asks you some back to check you’ve got it.",
            },
            {
              n: "04",
              t: "Adapt & advance",
              d: "Struggle with something? The path reshapes around it. Breeze through? It moves you forward.",
            },
          ].map((s) => (
            <li
              key={s.n}
              className="rounded-2xl border border-cream-300 bg-white p-6 backdrop-blur-sm hover:border-ember-400/50 transition-colors"
            >
              <div className="font-display text-ember-500 text-2xl mb-4">
                {s.n}
              </div>
              <h3 className="text-espresso-900 font-semibold text-lg mb-2">{s.t}</h3>
              <p className="text-espresso-700 text-sm leading-relaxed">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- WHY LUMORA ---------- */}
      <section id="why" className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-3xl border border-cream-300 bg-gradient-to-b from-cream-100 to-cream-50 p-10 sm:p-14">
          <h2 className="font-display text-3xl sm:text-4xl text-espresso-900 mb-10">
            Why it’s different
          </h2>
          <div className="grid sm:grid-cols-3 gap-10">
            {[
              {
                t: "Grounded, not guessing",
                d: "Answers are pulled from trusted, curated sources — so guidance is accurate and citable, not hallucinated.",
              },
              {
                t: "A mentor, not a chatbot",
                d: "A voice that teaches Socratically — it asks before it tells, so you actually understand instead of copy-pasting.",
              },
              {
                t: "Built around building",
                d: "Every path centers on one real project you finish. You leave with a skill and something to show.",
              },
            ].map((f) => (
              <div key={f.t}>
                <div className="w-10 h-10 rounded-full bg-ember-500/15 border border-ember-400/40 flex items-center justify-center mb-4">
                  <span className="w-2 h-2 rounded-full bg-ember-500" />
                </div>
                <h3 className="text-espresso-900 font-semibold text-lg mb-2">
                  {f.t}
                </h3>
                <p className="text-espresso-700 text-sm leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="flex justify-center mb-8">
          <Orb size={120} />
        </div>
        <h2 className="font-display text-4xl sm:text-5xl text-espresso-900 mb-5">
          What do you want to learn?
        </h2>
        <p className="text-espresso-700 mb-9 max-w-lg mx-auto">
          Two minutes to your personalized path. No account needed to start.
        </p>
        <Link
          href="/learn"
          className="inline-block bg-ember-500 hover:bg-ember-600 text-white font-semibold px-8 py-4 rounded-full transition-colors text-lg"
        >
          Begin
        </Link>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="border-t border-cream-300 mt-10">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-espresso-700">
          <span className="font-display text-espresso-900">Lumora</span>
          <span>Built for the DDS AI Application Building Challenge.</span>
        </div>
      </footer>
    </main>
  );
}
