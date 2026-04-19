import { Listing, SAMPLE_LISTINGS } from "./kairos-data";

const PRICE_RX = /\$?\s?(\d{2,6})(?:k)?/i;
const PLACE_RX = /\b(?:in|at|near)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/;

export type ParsedQuery = { budget?: number; location?: string };

export function parseQuery(text: string): ParsedQuery {
  const out: ParsedQuery = {};
  const m = text.match(PRICE_RX);
  if (m) {
    let n = parseInt(m[1], 10);
    if (/k/i.test(m[0])) n *= 1000;
    out.budget = n;
  }
  const p = text.match(PLACE_RX);
  if (p) out.location = p[1];
  else {
    // fallback: first capitalized word
    const cap = text.match(/\b([A-Z][a-zA-Z]{2,})\b/);
    if (cap) out.location = cap[1];
  }
  return out;
}

export function findListings(q: ParsedQuery, all: Listing[] = SAMPLE_LISTINGS): Listing[] {
  let pool = all;
  if (q.location) {
    const loc = q.location.toLowerCase();
    const matched = all.filter((l) => l.location.toLowerCase().includes(loc));
    if (matched.length) pool = matched;
  }
  // Show up to 3
  return pool.slice(0, 3);
}

export function craftReply(text: string, results: Listing[], q: ParsedQuery): string {
  if (!results.length) return "I couldn't find a perfect match yet — try a different city or budget.";
  const where = q.location ? ` in ${q.location}` : "";
  const within = q.budget ? ` within your $${q.budget.toLocaleString()} budget` : "";
  return `I found some great options${where}${within}. Here are my top picks — tap **Select** on any one to continue.`;
}
