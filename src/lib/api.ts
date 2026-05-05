// Lightweight API client. Tries real backend first, falls back to localStorage
// so the Lovable preview keeps working when the backend isn't reachable.
export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE || "http://localhost:5000/api";

const TIMEOUT_MS = 3500;

async function withTimeout<T>(p: Promise<T>, ms = TIMEOUT_MS): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);
}

export async function apiFetch<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await withTimeout(
    fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
      credentials: "include",
      ...init,
    })
  );
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as T;
}

// -------- localStorage fallback store --------
function readKey<T>(k: string, fallback: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeKey<T>(k: string, v: T) {
  localStorage.setItem(k, JSON.stringify(v));
  window.dispatchEvent(new CustomEvent("kairos:db", { detail: { key: k } }));
}

export const localDb = {
  read: readKey,
  write: writeKey,
};

export function genId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}
