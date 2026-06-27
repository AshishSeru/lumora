import { getOpenAI } from "@/lib/openai";

// Load the prebuilt vector index (created by `npm run embed`). If it hasn't
// been built yet, retrieval is skipped gracefully and the tutor still works —
// just ungrounded. This keeps the app robust whether or not RAG is set up.
let INDEX = null;
let INDEX_TRIED = false;

async function loadIndex() {
  if (INDEX_TRIED) return INDEX;
  INDEX_TRIED = true;
  try {
    const mod = await import("@/lib/knowledgeIndex.js");
    INDEX = mod.INDEX || null;
  } catch {
    INDEX = null; // index not built yet — tutor runs ungrounded
  }
  return INDEX;
}

const EMBED_MODEL = "text-embedding-3-small";

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Returns the top-k most relevant knowledge entries for a query, each with a
// similarity score. Returns [] if the index isn't built or anything fails.
export async function retrieve(query, k = 3, minScore = 0.25) {
  const index = await loadIndex();
  if (!index || !index.length || !query) return [];

  let openai;
  try {
    openai = getOpenAI();
  } catch {
    return [];
  }

  let queryEmbedding;
  try {
    const res = await openai.embeddings.create({
      model: EMBED_MODEL,
      input: query,
    });
    queryEmbedding = res.data[0].embedding;
  } catch {
    return [];
  }

  const scored = index.map((entry) => ({
    id: entry.id,
    title: entry.title,
    source: entry.source,
    text: entry.text,
    score: cosineSimilarity(queryEmbedding, entry.embedding),
  }));

  return scored
    .filter((s) => s.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

// Formats retrieved chunks into a context block + a citation list for the
// tutor prompt.
export function formatContext(chunks) {
  if (!chunks.length) return { context: "", citations: [] };
  const context = chunks
    .map((c, i) => `[Source ${i + 1}: ${c.source}]\n${c.text}`)
    .join("\n\n");
  const citations = chunks.map((c, i) => ({
    n: i + 1,
    source: c.source,
    title: c.title,
  }));
  return { context, citations };
}
