// ---------------------------------------------------------------------------
// Lumora's curated knowledge base.
//
// These are original, concise explainer notes written for Lumora (no
// copyrighted text), covering core tech/AI learning concepts. The RAG
// pipeline embeds these and retrieves the most relevant ones to ground the
// tutor's answers — so guidance is accurate and citable, not hallucinated.
//
// Each entry has a stable id, a title, a source label (shown as a citation),
// and the body text that gets embedded and retrieved.
// ---------------------------------------------------------------------------

export const KNOWLEDGE_BASE = [
  {
    id: "kb-llm-basics",
    title: "What a Large Language Model actually does",
    source: "Lumora Notes · LLM Basics",
    text: `A large language model (LLM) predicts the next token (a word or word-piece) given the text before it. It does not "look things up" — it generates likely continuations based on patterns learned during training. This is why LLMs can sound confident yet be wrong: they produce plausible text, not verified facts. Practical implications for builders: (1) always treat raw LLM output as a draft, not truth; (2) for factual tasks, ground the model with retrieved sources (RAG) instead of relying on its memory; (3) the model has a knowledge cutoff and cannot know events after it; (4) "temperature" controls randomness — lower is more deterministic, higher is more creative. Newer reasoning models may restrict temperature settings.`,
  },
  {
    id: "kb-rag-what",
    title: "Retrieval-Augmented Generation (RAG), explained simply",
    source: "Lumora Notes · RAG",
    text: `RAG means: before the model answers, you fetch relevant text from your own trusted sources and put it into the prompt, so the model answers FROM that text instead of from memory. The pipeline is: (1) chunk your documents into small passages; (2) embed each chunk into a vector (a list of numbers capturing meaning); (3) store the vectors; (4) at question time, embed the question and find the most similar chunks by cosine similarity; (5) pass those chunks to the LLM as context and ask it to answer using them, citing sources. RAG reduces hallucination, lets you use private or recent data the model never trained on, and makes answers citable. The quality of a RAG system depends heavily on chunking strategy and retrieval quality, not just the LLM.`,
  },
  {
    id: "kb-embeddings",
    title: "Embeddings and cosine similarity",
    source: "Lumora Notes · Embeddings",
    text: `An embedding turns text into a vector — a fixed-length list of numbers — such that texts with similar meaning have vectors that point in similar directions. To compare two embeddings you use cosine similarity: the cosine of the angle between the vectors, ranging from -1 (opposite) to 1 (identical meaning). To build search, you embed every document chunk once and store the vectors; then you embed the query and rank chunks by cosine similarity to it. This is "semantic search" — it matches meaning, not exact keywords, so a query about "cars" can match a passage about "automobiles". OpenAI's text-embedding-3-small model is a common, cheap choice for this.`,
  },
  {
    id: "kb-prompt-engineering",
    title: "Prompt engineering fundamentals",
    source: "Lumora Notes · Prompting",
    text: `A good prompt is clear, specific, and gives the model a role, a task, constraints, and the desired output format. Techniques that reliably help: (1) tell the model who it is and what it's doing ("You are a careful technical reviewer..."); (2) show examples of the input-output you want (few-shot); (3) ask for step-by-step reasoning for complex tasks; (4) specify the exact output format, including "respond only in JSON" when you'll parse it; (5) put the most important instructions at the start and end. Iterate: change one thing at a time and compare results. For structured output, use the API's JSON mode so the response is always valid JSON.`,
  },
  {
    id: "kb-api-keys",
    title: "Using API keys safely",
    source: "Lumora Notes · API Security",
    text: `An API key is a secret that authenticates your requests and is tied to billing — anyone with it can spend your money. Rules: (1) never put a key in frontend/browser code or commit it to git; (2) store keys in environment variables (e.g. a .env.local file) that is listed in .gitignore; (3) call the paid API only from your server/backend, so the key never reaches the user's browser; (4) if a key leaks, rotate (regenerate) it immediately; (5) set usage limits where the provider allows. In a Next.js app, this means calling the API from a route handler (server side) and reading the key from process.env, never exposing it in client components.`,
  },
  {
    id: "kb-nextjs-basics",
    title: "How a Next.js app is structured",
    source: "Lumora Notes · Next.js",
    text: `Next.js (App Router) organizes code under an app/ directory. A folder becomes a route; a page.js file in it is the page. Components are React by default "server components" unless you add "use client" at the top, which you need for interactivity (state, event handlers, browser APIs). API endpoints live in route.js files under app/api/.../ and run on the server — this is where you safely call paid APIs with secret keys. You deploy easily to Vercel (the company behind Next.js): push to GitHub, import the repo in Vercel, add your environment variables in the Vercel dashboard, and it builds and hosts automatically. Environment variables you set locally in .env.local must also be added in Vercel for production.`,
  },
  {
    id: "kb-streaming",
    title: "Why and how to stream LLM responses",
    source: "Lumora Notes · Streaming",
    text: `LLMs generate text token by token, which can take several seconds for a long answer. Streaming sends each token to the user as it's produced, so they see words appear immediately instead of staring at a spinner. This dramatically improves perceived speed and makes a chat feel alive. Technically: you request a streaming completion from the API, then forward each chunk to the browser using a ReadableStream; the client reads the stream and appends text as it arrives. The trade-off: you can't easily parse streamed output as structured data until it's complete, so for JSON you typically accumulate the full stream, then parse.`,
  },
  {
    id: "kb-chunking",
    title: "Chunking documents for RAG",
    source: "Lumora Notes · Chunking",
    text: `Chunking is splitting your source documents into passages small enough to embed and retrieve precisely, but large enough to carry meaning. If chunks are too big, retrieval returns lots of irrelevant text and dilutes the answer; too small, and you lose context. Common strategies: split by paragraphs or by a fixed number of characters/tokens (e.g. 300-800 tokens) with some overlap between consecutive chunks so ideas spanning a boundary aren't lost. Keep track of each chunk's source so you can cite it. Good chunking is one of the highest-leverage things you can do to improve a RAG system's answer quality.`,
  },
  {
    id: "kb-hallucination",
    title: "Hallucination and how to reduce it",
    source: "Lumora Notes · Reliability",
    text: `A hallucination is when an LLM states something false with confidence — an invented fact, citation, or API. It happens because the model generates plausible text, not verified truth. To reduce it: (1) ground the model with retrieved sources (RAG) and instruct it to answer only from those sources; (2) tell it explicitly to say "I don't know" when the context doesn't contain the answer; (3) ask for citations so claims are traceable; (4) lower temperature for factual tasks; (5) evaluate outputs against a known answer set to measure faithfulness. The single most effective fix for factual tasks is retrieval grounding plus an instruction to refuse when unsupported.`,
  },
  {
    id: "kb-eval",
    title: "Evaluating an AI application",
    source: "Lumora Notes · Evaluation",
    text: `You can't improve what you don't measure. For an LLM app, build a small "exam set" of representative inputs with expected qualities, and score outputs against them. Useful metrics: faithfulness (does the answer stick to the provided sources, with no invented facts?), relevance (does it actually address the question?), and groundedness (is every claim supported by retrieved context?). You can score manually for a small set, or use an LLM-as-judge to rate answers at scale. Track the score as you change prompts, models, or retrieval — that's how you prove an improvement instead of guessing. Showing real eval numbers is what separates a serious project from a demo.`,
  },
  {
    id: "kb-lumora-architecture",
    title: "Lumora's own architecture and the Slice build method",
    source: "Lumora Notes · Project Internals",
    text: `Lumora was built in eight numbered "Slices", each a vertical feature: Slice 1 skeleton and design system, Slice 2 the streaming path generator, Slice 3 the Socratic tutor, Slice 4 RAG grounding, Slice 5 voice plus the evaluation harness, Slice 6 the avatar welcome, Slice 7 the warm light theme and Vercel deployment, and Slice 8 final polish and demo. Lumora retrieves from a LOCAL vector index (embeddings stored in a generated file, searched in-memory with cosine similarity) rather than a hosted vector database, because at this curated corpus size that is simpler, free to run on Vercel, and needs no external service. The tutor runs on a frontier model for teaching quality while routine generation uses a smaller, cheaper model.`,
  },
  {
    id: "kb-lumora-fallbacks",
    title: "Lumora's graceful fallback design",
    source: "Lumora Notes · Project Internals",
    text: `Lumora is engineered so it never hard-fails during a demo, using layered fallbacks. If the vector index has not been built, the tutor still answers but runs ungrounded (no citations) instead of crashing. If server text-to-speech fails, voice falls back to the browser's built-in speech synthesis so the mentor never goes silent. If no D-ID avatar key is configured, the welcome shows Lumora's signature glowing orb instead of a talking head. API keys are read only on the server from environment variables and never reach the browser. These fallbacks are deliberate: the app degrades gracefully rather than breaking.`,
  },
  {
    id: "kb-lumora-design",
    title: "Lumora's name, theme, and design identity",
    source: "Lumora Notes · Project Internals",
    text: `The name "Lumora" comes from light and illumination — the idea of guiding a learner out of tutorial overload toward clarity. Its signature visual element is a glowing orb representing the mentor's presence, the "light" the learner moves toward. The interface uses a warm light theme: a cream background, deep espresso text, and burnt-orange accents, with a warm amber orb. The product's tagline is "Stop drowning in tutorials. Start building." Lumora deliberately embodies a learn-by-building philosophy: instead of listing videos, it turns a goal into one real project broken into milestones, each taught by the voice mentor.`,
  },
];
