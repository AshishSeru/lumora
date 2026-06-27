# Lumora 🌅

Your AI mentor for learning tech & AI by building.
Built for the Decoding Data Science — AI Application Building Challenge.

---

## ▶️ Run it locally (Slice 2 — the brain)

You need **Node.js 18.17+**. Then, in this folder:

```bash
npm install
cp .env.example .env.local      # then open .env.local and add your OpenAI key
npm run dev
```

Open **http://localhost:3000**, go to **Start learning**, enter a goal,
and Lumora generates a real, project-based path live.

**Slice 2 needs your OpenAI key.** Get one at https://platform.openai.com →
API keys. Put it in `.env.local` as `OPENAI_API_KEY=sk-...`. It is read
server-side only and never reaches the browser.

### Turn on grounding (RAG) — one-time step

Lumora's tutor can ground its answers in a curated knowledge base and cite
sources. To build the vector index (needs your OpenAI key in `.env.local`):

```bash
npm run embed
```

This embeds the knowledge base (`src/lib/knowledgeBase.js`) and writes
`src/lib/knowledgeIndex.js`. After this, the tutor shows "Grounded in"
citations when it uses a source. Re-run it any time you edit the knowledge
base. The app works fine without this step too — it just runs ungrounded.

### Measure quality (evaluation)

Lumora ships with a real evaluation harness. After embedding, run:

```bash
npm run eval
```

It asks the tutor all 12 exam-set questions twice — once grounded (RAG) and
once ungrounded — then uses an LLM-as-judge to score faithfulness, relevance,
and groundedness (1-5), printing a baseline comparison and writing
`eval/results.json`. This proves retrieval grounding improves answers with
numbers, not claims.

---

## 🧭 What's built so far

- **Landing page** (`/`) — hero, how-it-works, why-Lumora, with Lumora's
  signature glowing "mentor orb" and warm cream + burnt-orange visual identity.
- **Learn flow** (`/learn`) — capture the learner's goal + starting level,
  with suggestions and a confirmation screen. End-to-end flow works.
- **Design system** — custom Tailwind theme (cream/espresso/ember palette),
  Fraunces display + Inter body fonts, reduced-motion support.

## 🔜 What's next (the build plan)

| Slice | What we add | Keys needed |
|------|-------------|-------------|
| 1 ✅ | Skeleton: landing + learn flow + design | none |
| 2 ✅ | **Path generator** — real AI day-by-day plan | OpenAI |
| 3 ✅ | **The tutor** — Socratic chat mentor per step | OpenAI |
| 4 ✅ | **RAG** — grounded, citable answers | OpenAI |
| 5 ✅ | **Voice** — mentor speaks; you talk back | OpenAI (ElevenLabs optional) |
| 6 ✅ | **Avatar** — talking-head welcome (orb fallback) | D-ID optional (free trial) |
| 7 ✅ | **Theme redesign** (warm light) + **deploy** | OpenAI |
| 8 | **Polish + deploy** to Vercel | — |

## 🔑 Keys (for later slices)

Copy `.env.example` to `.env.local` and fill in keys as we reach each slice:

```bash
cp .env.example .env.local
```

Keys live **only** in `.env.local` (gitignored) and are used server-side.
Never commit them.

## 🗂 Structure

```
src/
  app/
    layout.js        # fonts + atmospheric background
    page.js          # landing page
    globals.css      # theme + aurora glow
    learn/page.js    # the learn route
    api/
      path/route.js  # streaming path generator (GPT-5.4-mini)
      tutor/route.js # streaming Socratic tutor (GPT-5.5)
  components/
    Orb.js           # signature glowing mentor light
    NavBar.js
    LearnClient.js   # goal capture flow
    PathView.js      # renders the path + opens the tutor
    TutorChat.js     # live Socratic mentor conversation
  lib/
    openai.js        # server-only OpenAI client + model config
    prompts.js       # path-generation prompt
    tutorPrompts.js  # the tutor's teaching prompt (Lumora's soul)
    streamPath.js    # client: stream + parse the path
    streamTutor.js   # client: stream the tutor's words
tailwind.config.js   # night/dawn design tokens
```

---

Made with care. Light over noise.
