import { Category, Listing, LISTINGS } from "./kairos-data";

const PRICE_RX = /\$?\s?(\d{2,6})(?:k)?/i;
const PLACE_RX = /\b(?:in|at|near|to)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/;

const CATEGORY_KEYWORDS: { cat: Category; words: string[] }[] = [
  { cat: "hotels", words: ["hotel", "stay", "room", "suite", "apartment", "loft", "boutique"] },
  { cat: "tours", words: ["tour", "safari", "trip", "travel", "getaway", "beach", "adventure"] },
  { cat: "lifestyle", words: ["dinner", "spa", "retreat", "nightlife", "experience", "wellness", "club"] },
  { cat: "services", words: ["chef", "chauffeur", "driver", "event", "planner", "service", "private"] },
];

export type ParsedQuery = { budget?: number; location?: string; category?: Category };

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
    const cap = text.match(/\b([A-Z][a-zA-Z]{2,})\b/);
    if (cap) out.location = cap[1];
  }
  const lower = text.toLowerCase();
  for (const { cat, words } of CATEGORY_KEYWORDS) {
    if (words.some((w) => lower.includes(w))) {
      out.category = cat;
      break;
    }
  }
  return out;
}

export function findListings(q: ParsedQuery, all: Listing[] = LISTINGS): Listing[] {
  let pool = all;
  if (q.category) pool = pool.filter((l) => l.category === q.category);
  if (q.location) {
    const loc = q.location.toLowerCase();
    const matched = pool.filter((l) => l.location.toLowerCase().includes(loc));
    if (matched.length) pool = matched;
  }
  if (q.budget) {
    const within = pool.filter((l) => l.price <= q.budget!);
    if (within.length) pool = within;
  }
  return pool.slice(0, 3);
}

export function craftReply(_text: string, results: Listing[], q: ParsedQuery): string {
  if (!results.length) {
    return "I couldn't find a perfect match yet — try a different city, category, or budget.";
  }
  const cat = q.category ? ` ${q.category}` : "";
  const where = q.location ? ` in ${q.location}` : "";
  const within = q.budget ? ` within your $${q.budget.toLocaleString()} budget` : "";
  return `I found some great${cat} options${where}${within}. Here are my top picks — tap **Select** to continue.`;
}
