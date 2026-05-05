import { apiFetch, genId, localDb } from "./api";

export type ListingType =
  | "property"
  | "hotel"
  | "experience"
  | "lifestyle"
  | "travel";

export type ListingStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "inactive";

export interface BaseListing {
  id: string;
  type: ListingType;
  ownerId: string;
  ownerName: string;
  title: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  images: string[]; // data URLs
  documents: { name: string; url: string }[];
  data: Record<string, any>;
  views?: number;
  bookings?: number;
  adminNote?: string;
}

const LS_KEY = "kairos.listings.v1";

const ENDPOINTS: Record<ListingType, string> = {
  property: "/properties",
  hotel: "/hotels",
  experience: "/experiences",
  lifestyle: "/services/lifestyle",
  travel: "/services/travel",
};

function readAll(): BaseListing[] {
  return localDb.read<BaseListing[]>(LS_KEY, []);
}
function writeAll(list: BaseListing[]) {
  localDb.write(LS_KEY, list);
}

export async function createListing(
  type: ListingType,
  payload: {
    ownerId: string;
    ownerName: string;
    title: string;
    images: string[];
    documents: { name: string; url: string }[];
    data: Record<string, any>;
  }
): Promise<BaseListing> {
  const body = {
    ...payload,
    type,
    status: "pending_approval" as ListingStatus,
  };

  // Try real backend first
  try {
    const res = await apiFetch<BaseListing>(ENDPOINTS[type], {
      method: "POST",
      body: JSON.stringify(body),
    });
    // also persist locally so dashboards reflect it offline
    const list = readAll();
    writeAll([res, ...list]);
    return res;
  } catch {
    // fallback
    const now = new Date().toISOString();
    const item: BaseListing = {
      id: genId("lst"),
      type,
      ownerId: payload.ownerId,
      ownerName: payload.ownerName,
      title: payload.title,
      status: "pending_approval",
      createdAt: now,
      updatedAt: now,
      images: payload.images,
      documents: payload.documents,
      data: payload.data,
      views: 0,
      bookings: 0,
    };
    writeAll([item, ...readAll()]);
    return item;
  }
}

export async function myListings(ownerId: string): Promise<BaseListing[]> {
  try {
    return await apiFetch<BaseListing[]>("/users/my-listings");
  } catch {
    return readAll().filter((l) => l.ownerId === ownerId);
  }
}

export async function pendingListings(): Promise<BaseListing[]> {
  try {
    return await apiFetch<BaseListing[]>("/admin/approvals");
  } catch {
    return readAll().filter((l) => l.status === "pending_approval");
  }
}

export async function reviewListing(
  type: ListingType,
  id: string,
  action: "approve" | "reject" | "request-changes",
  note?: string
): Promise<BaseListing | null> {
  try {
    return await apiFetch<BaseListing>(
      `/admin/approvals/${type}/${id}/${action}`,
      {
        method: "PATCH",
        body: JSON.stringify({ note }),
      }
    );
  } catch {
    const list = readAll();
    const idx = list.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      status:
        action === "approve"
          ? "approved"
          : action === "reject"
          ? "rejected"
          : "draft",
      adminNote: note,
      updatedAt: new Date().toISOString(),
    };
    writeAll(list);
    return list[idx];
  }
}

export const TYPE_META: Record<
  ListingType,
  { label: string; verification: "kyc" | "kyb" | "either" }
> = {
  property: { label: "Property", verification: "either" },
  hotel: { label: "Hotel / Room", verification: "kyb" },
  experience: { label: "Experience", verification: "either" },
  lifestyle: { label: "Lifestyle Service", verification: "either" },
  travel: { label: "Travel Package", verification: "kyb" },
};
