// Mock KYC backend backed by localStorage. Replace with real API later.
export type KycStatus = "unverified" | "pending" | "approved" | "rejected";

export interface KycSubmission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: "client" | "agent" | "admin";
  fullName: string;
  idNumber: string;
  kraPin: string;
  phone: string;
  idFront: string; // data URL
  idBack: string;
  selfie: string;
  status: KycStatus;
  notes?: string;
  submittedAt: string;
  reviewedAt?: string;
}

const KEY = "kairos.kyc.v1";

function read(): KycSubmission[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(list: KycSubmission[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("kyc:changed"));
}

export async function listKyc(): Promise<KycSubmission[]> {
  await new Promise((r) => setTimeout(r, 250));
  return read().sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt));
}

export async function getMyKyc(userId: string): Promise<KycSubmission | null> {
  await new Promise((r) => setTimeout(r, 200));
  return read().find((k) => k.userId === userId) ?? null;
}

export async function submitKyc(
  payload: Omit<KycSubmission, "id" | "status" | "submittedAt">
): Promise<KycSubmission> {
  await new Promise((r) => setTimeout(r, 600));
  const list = read().filter((k) => k.userId !== payload.userId);
  const sub: KycSubmission = {
    ...payload,
    id: `kyc_${Date.now().toString(36)}`,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  write([sub, ...list]);
  return sub;
}

export async function reviewKyc(
  id: string,
  status: "approved" | "rejected",
  notes?: string
): Promise<KycSubmission | null> {
  await new Promise((r) => setTimeout(r, 350));
  const list = read();
  const idx = list.findIndex((k) => k.id === id);
  if (idx === -1) return null;
  list[idx] = {
    ...list[idx],
    status,
    notes,
    reviewedAt: new Date().toISOString(),
  };
  write(list);
  return list[idx];
}

export function statusFor(userId: string): KycStatus {
  return read().find((k) => k.userId === userId)?.status ?? "unverified";
}
