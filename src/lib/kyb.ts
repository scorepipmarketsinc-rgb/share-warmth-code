import { apiFetch, genId, localDb } from "./api";

export type KybStatus =
  | "not_started"
  | "pending"
  | "verified"
  | "rejected"
  | "needs_more_info";

export interface KybSubmission {
  id: string;
  userId: string;
  businessName: string;
  registrationNumber: string;
  taxNumber: string;
  email: string;
  phone: string;
  address: string;
  certificate: string;
  permit: string;
  taxDoc: string;
  directorId: string;
  status: KybStatus;
  submittedAt: string;
  reviewedAt?: string;
  notes?: string;
}

const KEY = "kairos.kyb.v1";

export async function getMyKyb(userId: string): Promise<KybSubmission | null> {
  try {
    return await apiFetch<KybSubmission>(`/kyb/me`);
  } catch {
    const list = localDb.read<KybSubmission[]>(KEY, []);
    return list.find((k) => k.userId === userId) ?? null;
  }
}

export async function listKyb(): Promise<KybSubmission[]> {
  try {
    return await apiFetch<KybSubmission[]>("/admin/kyb");
  } catch {
    return localDb
      .read<KybSubmission[]>(KEY, [])
      .sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt));
  }
}

export async function reviewKyb(
  id: string,
  status: "verified" | "rejected",
  notes?: string
): Promise<KybSubmission | null> {
  try {
    return await apiFetch<KybSubmission>(`/admin/kyb/${id}/${status}`, {
      method: "PATCH",
      body: JSON.stringify({ notes }),
    });
  } catch {
    const list = localDb.read<KybSubmission[]>(KEY, []);
    const idx = list.findIndex((k) => k.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], status, notes, reviewedAt: new Date().toISOString() };
    localDb.write(KEY, list);
    return list[idx];
  }
}

export async function submitKyb(
  payload: Omit<KybSubmission, "id" | "status" | "submittedAt">
): Promise<KybSubmission> {
  const body = { ...payload, status: "pending" as KybStatus };
  try {
    return await apiFetch<KybSubmission>("/kyb/submit", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch {
    const list = localDb
      .read<KybSubmission[]>(KEY, [])
      .filter((k) => k.userId !== payload.userId);
    const sub: KybSubmission = {
      ...payload,
      id: genId("kyb"),
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    localDb.write(KEY, [sub, ...list]);
    return sub;
  }
}
