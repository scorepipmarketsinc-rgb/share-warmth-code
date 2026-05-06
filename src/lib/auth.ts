// Lightweight client auth state. Uses localStorage; tries real backend.
import { apiFetch } from "./api";
import type { Role } from "./kairos-data";

const KEY = "kairos.auth.user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  token?: string;
}

export function getUser(): AuthUser | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}

export function setUser(u: AuthUser | null) {
  if (u) localStorage.setItem(KEY, JSON.stringify(u));
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("auth:changed"));
}

export function isAuthed() {
  return !!getUser();
}

const roleFromEmail = (email: string): Role => {
  const e = email.toLowerCase();
  if (e.includes("admin")) return "admin";
  if (e.includes("agent") || e.includes("host")) return "agent";
  return "client";
};

export async function login(email: string, password: string): Promise<AuthUser> {
  try {
    const u = await apiFetch<AuthUser>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(u);
    return u;
  } catch {
    const u: AuthUser = {
      id: `u_${Date.now().toString(36)}`,
      name: email.split("@")[0],
      email,
      role: roleFromEmail(email),
    };
    setUser(u);
    return u;
  }
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthUser> {
  try {
    const u = await apiFetch<AuthUser>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setUser(u);
    return u;
  } catch {
    const u: AuthUser = {
      id: `u_${Date.now().toString(36)}`,
      name,
      email,
      role: roleFromEmail(email),
    };
    setUser(u);
    return u;
  }
}

export function logout() {
  setUser(null);
}
