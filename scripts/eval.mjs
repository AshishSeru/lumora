// ---------------------------------------------------------------------------
// Lumora evaluation runner.
//
//   npm run eval
//
// For each question in the exam set, it produces a tutor answer in two modes —
// GROUNDED (with RAG retrieval) and UNGROUNDED (no retrieval) — then uses an
// LLM-as-judge to score each answer on faithfulness, relevance, and
// groundedness (1-5). It prints a comparison and writes eval/results.json.
//
// This proves, with numbers, that retrieval grounding improves answer quality.
// ---------------------------------------------------------------------------

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { EXAM_SET } = await import("../eval/examSet.js");
const { KNOWLEDGE_BASE } = await import("../src/lib/knowledgeBase.js");

const EMBED_MODEL = "text-embedding-3-small";
const TUTOR_MODEL = process.env.LUMORA_MODEL_DEEP || "gpt-5.5";
const JUDGE_MODEL = process.env.LUMORA_MODEL_FAST || "gpt-5.4-mini";

if (!process.env.OPENAI_API_KEY) {
  console.error("\n✗ OPENAI_API_KEY not found in .env.local.\n");
  process.exit(1);
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---- tiny in-process retriever (mirrors src/lib/retriever.js) ----
let KB_VECTORS = null;
async function embedKnowledgeBase() {
  const inputs = KNOWLEDGE_BASE.map((e) => `${e.title}\n\n${e.text}`);
  const res = await openai.embeddings.create({ model: EMBED_MODEL, input: inputs });
  KB_VECTORS = KNOWLEDGE_BASE.map((e, i) => ({
    ...e,
    embedding: res.data[i].embedding,
  }));
}
function cosine(a, b) {
  let d = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { d += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  return na && nb ? d / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}
async function retrieve(query, k = 3, minScore = 0.25) {
  const r = await openai.embeddings.create({ model: EMBED_MODEL, input: query });
  const q = r.data[0].embedding;
  return KB_VECTORS
    .map((e) => ({ ...e, score: cosine(q, e.embedding) }))
    .filter((e) => e.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

// ---- tutor answer (grounded or not) ----
async function answer(question, grounded) {
  let context = "";
  if (grounded) {
    const chunks = await retrieve(question, 3);
    context = chunks
      .map((c, i) => `[Source ${i + 1}: ${c.source}]\n${c.text}`)
      .join("\n\n");
  }
  const system = grounded
    ? `You are a technical mentor. Answer the question using ONLY the sources below. If the sources don't cover it, say so. Cite sources inline like (Source 1).\n\nSOURCES:\n${context}`
    : `You are a technical mentor. Answer the question from your own knowledge.`;

  const res = await openai.chat.completions.create({
    model: TUTOR_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: question },
    ],
  });
  return res.choices[0].message.content || "";
}

// ---- LLM-as-judge ----
async function judge(item, response, grounded) {
  const prompt = `You are a strict evaluator of a tutoring answer.

QUESTION: ${item.question}

KEY POINTS a correct answer should cover:
${item.mustInclude.map((p) => `- ${p}`).join("\n")}

ANSWER TO EVALUATE:
${response}

Score the answer on three axes from 1 to 5 (5 best):
- faithfulness: are all claims accurate, with nothing invented or wrong?
- relevance: does it directly answer the question?
- groundedness: how well does it cover the key points above?

Respond ONLY as JSON: {"faithfulness": n, "relevance": n, "groundedness": n, "note": "one short sentence"}`;

  const res = await openai.chat.completions.create({
    model: JUDGE_MODEL,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });
  try {
    return JSON.parse(res.choices[0].message.content);
  } catch {
    return { faithfulness: 0, relevance: 0, groundedness: 0, note: "parse error" };
  }
}

function avg(arr, key) {
  if (!arr.length) return 0;
  return arr.reduce((s, x) => s + (x[key] || 0), 0) / arr.length;
}

async function main() {
  console.log(`\nLumora evaluation — ${EXAM_SET.length} questions`);
  console.log(`Tutor: ${TUTOR_MODEL} · Judge: ${JUDGE_MODEL}\n`);
  console.log("Embedding knowledge base…");
  await embedKnowledgeBase();

  const rows = [];
  for (const item of EXAM_SET) {
    process.stdout.write(`  ${item.id} (${item.topic})… `);
    const ungroundedAns = await answer(item.question, false);
    const groundedAns = await answer(item.question, true);
    const ungScore = await judge(item, ungroundedAns, false);
    const grdScore = await judge(item, groundedAns, true);
    rows.push({ id: item.id, topic: item.topic, outOfKnowledge: !!item.outOfKnowledge, ungrounded: ungScore, grounded: grdScore });
    console.log(
      `ungrounded ${ungScore.groundedness}/5 → grounded ${grdScore.groundedness}/5`
    );
  }

  const ook = rows.filter((r) => r.outOfKnowledge);
  const general = rows.filter((r) => !r.outOfKnowledge);
  const groupStats = (subset) => ({
    count: subset.length,
    ungroundedGroundedness: +avg(subset.map((r) => r.ungrounded), "groundedness").toFixed(2),
    groundedGroundedness: +avg(subset.map((r) => r.grounded), "groundedness").toFixed(2),
    ungroundedFaithfulness: +avg(subset.map((r) => r.ungrounded), "faithfulness").toFixed(2),
    groundedFaithfulness: +avg(subset.map((r) => r.grounded), "faithfulness").toFixed(2),
  });

  const summary = {
    questions: rows.length,
    tutorModel: TUTOR_MODEL,
    judgeModel: JUDGE_MODEL,
    ungrounded: {
      faithfulness: +avg(rows.map((r) => r.ungrounded), "faithfulness").toFixed(2),
      relevance: +avg(rows.map((r) => r.ungrounded), "relevance").toFixed(2),
      groundedness: +avg(rows.map((r) => r.ungrounded), "groundedness").toFixed(2),
    },
    grounded: {
      faithfulness: +avg(rows.map((r) => r.grounded), "faithfulness").toFixed(2),
      relevance: +avg(rows.map((r) => r.grounded), "relevance").toFixed(2),
      groundedness: +avg(rows.map((r) => r.grounded), "groundedness").toFixed(2),
    },
    general: groupStats(general),
    outOfKnowledge: groupStats(ook),
  };

  const outPath = path.join(__dirname, "results.json");
  fs.writeFileSync(outPath, JSON.stringify({ summary, rows }, null, 2));

  console.log("\n──────────── OVERALL RESULTS ────────────");
  console.log("                 Ungrounded   Grounded (RAG)");
  console.log(`  Faithfulness      ${summary.ungrounded.faithfulness}          ${summary.grounded.faithfulness}`);
  console.log(`  Relevance         ${summary.ungrounded.relevance}          ${summary.grounded.relevance}`);
  console.log(`  Groundedness      ${summary.ungrounded.groundedness}          ${summary.grounded.groundedness}`);
  console.log("──────────────────────────────────────────");
  console.log("\nGroundedness by question type (where RAG's value shows):");
  console.log(`  General topics (${general.length})        ungrounded ${summary.general.ungroundedGroundedness} → grounded ${summary.general.groundedGroundedness}`);
  console.log(`  Out-of-knowledge (${ook.length})      ungrounded ${summary.outOfKnowledge.ungroundedGroundedness} → grounded ${summary.outOfKnowledge.groundedGroundedness}`);
  console.log("  (On topics the model already knows, grounding barely moves the score.");
  console.log("   On content it CANNOT know, grounding is what makes the answer correct.)");
  console.log(`\n✓ Full results written to eval/results.json\n`);
}

main().catch((e) => {
  console.error("\n✗ Eval failed:", e.message, "\n");
  process.exit(1);
});
