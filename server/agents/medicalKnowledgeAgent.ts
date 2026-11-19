import { KNOWLEDGE_BASE } from '../data/knowledgeBase.ts';
import type { KnowledgeChunk } from './types.ts';

export function retrieveMedicalKnowledge(query: string, maxChunks = 3): KnowledgeChunk[] {
  const normalized = query.toLowerCase();
  const tokens = normalized
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const scored = KNOWLEDGE_BASE.map((chunk) => {
    let score = 0;

    for (const kw of chunk.keywords) {
      if (normalized.includes(kw)) {
        score += kw.includes(' ') ? 5 : 3;
      }
    }

    const haystack = `${chunk.topic} ${chunk.title} ${chunk.summary} ${chunk.facts.join(' ')}`.toLowerCase();
    for (const token of tokens) {
      if (haystack.includes(token)) {
        score += 1;
      }
    }

    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const top = scored.filter((item) => item.score > 0).slice(0, maxChunks);
  if (top.length === 0) {
    return KNOWLEDGE_BASE.slice(0, 2);
  }
  return top.map((item) => item.chunk);
}
