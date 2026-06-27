// ---------------------------------------------------------------------------
// Lumora's evaluation exam set.
//
// A curated set of representative learner questions covering the tutor's
// domain. Each has "mustInclude" key points a faithful answer should cover,
// and "context" describing the scenario. The eval runner (scripts/eval.mjs)
// scores the tutor's answers against these to measure quality, and compares
// grounded (RAG) vs ungrounded answers to prove retrieval helps.
// ---------------------------------------------------------------------------

export const EXAM_SET = [
  {
    id: "q1",
    question: "What is Retrieval-Augmented Generation and why does it reduce hallucination?",
    mustInclude: [
      "fetches/retrieves relevant text from trusted sources before answering",
      "the model answers from that text instead of memory",
      "reduces hallucination / makes answers citable",
    ],
    topic: "RAG",
  },
  {
    id: "q2",
    question: "How do embeddings let me search by meaning instead of keywords?",
    mustInclude: [
      "text is turned into a vector of numbers capturing meaning",
      "similar meaning = similar/close vectors",
      "compare with cosine similarity",
    ],
    topic: "Embeddings",
  },
  {
    id: "q3",
    question: "Where should I store my OpenAI API key in a Next.js app, and why?",
    mustInclude: [
      "in an environment variable / .env.local, not in client code",
      "gitignore it / never commit",
      "call the API server-side so the key never reaches the browser",
    ],
    topic: "API security",
  },
  {
    id: "q4",
    question: "What is chunking and why does chunk size matter for RAG quality?",
    mustInclude: [
      "splitting documents into smaller passages",
      "too big = irrelevant/diluted; too small = loses context",
      "often use overlap between chunks",
    ],
    topic: "Chunking",
  },
  {
    id: "q5",
    question: "Why would I stream an LLM response instead of waiting for the whole thing?",
    mustInclude: [
      "tokens are sent as generated",
      "improves perceived speed / feels responsive",
      "user sees words appear instead of a spinner",
    ],
    topic: "Streaming",
  },
  {
    id: "q6",
    question: "What does temperature do, and what should I use for a factual task?",
    mustInclude: [
      "controls randomness/creativity",
      "lower = more deterministic/focused",
      "use lower temperature for factual tasks",
    ],
    topic: "Prompting",
  },
  {
    id: "q7",
    question: "How can I measure whether my AI app's answers are actually good?",
    mustInclude: [
      "build a test/exam set of representative inputs",
      "score for faithfulness/relevance/groundedness",
      "track the score as you change things",
    ],
    topic: "Evaluation",
  },
  {
    id: "q8",
    question: "What actually is a large language model doing when it answers me?",
    mustInclude: [
      "predicts the next token/word from patterns",
      "does not look things up / generates plausible text",
      "can be confidently wrong",
    ],
    topic: "LLM basics",
  },
  {
    id: "q9",
    question: "Give me concrete ways to reduce hallucination in my app.",
    mustInclude: [
      "ground with retrieval/RAG and answer only from sources",
      "instruct it to say 'I don't know' when unsupported",
      "ask for citations / lower temperature",
    ],
    topic: "Reliability",
  },
  {
    id: "q10",
    question: "How do I take a Next.js app from my laptop to a live URL?",
    mustInclude: [
      "push to GitHub",
      "import the repo in Vercel",
      "add environment variables in the Vercel dashboard",
    ],
    topic: "Deployment",
  },
  {
    id: "q11",
    question: "What makes a server component different from a client component in Next.js?",
    mustInclude: [
      "client components need 'use client'",
      "client components allow interactivity/state/browser APIs",
      "server components run on the server by default",
    ],
    topic: "Next.js",
  },
  {
    id: "q12",
    question: "What are the key parts of a good prompt?",
    mustInclude: [
      "a role and a clear task",
      "constraints and desired output format",
      "examples / step-by-step for complex tasks",
    ],
    topic: "Prompting",
  },
  {
    id: "q13",
    question: "How does Lumora store and search its knowledge for RAG, and why was that choice made?",
    mustInclude: [
      "a local vector index / embeddings in a generated file (not a hosted vector DB)",
      "searched in-memory with cosine similarity",
      "simpler / free on Vercel / no external service at this corpus size",
    ],
    topic: "Lumora internals",
    outOfKnowledge: true,
  },
  {
    id: "q14",
    question: "What happens in Lumora if text-to-speech fails or no avatar key is set?",
    mustInclude: [
      "voice falls back to the browser's built-in speech synthesis",
      "the welcome shows the glowing orb instead of a talking head",
      "it degrades gracefully / never hard-fails",
    ],
    topic: "Lumora internals",
    outOfKnowledge: true,
  },
  {
    id: "q15",
    question: "Where does the name 'Lumora' come from and what is its signature visual element?",
    mustInclude: [
      "light / illumination (guiding learners out of overload)",
      "a glowing orb representing the mentor",
      "warm light theme / 'Stop drowning in tutorials. Start building.'",
    ],
    topic: "Lumora internals",
    outOfKnowledge: true,
  },
];
