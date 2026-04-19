import listing1 from "@/assets/listing-1.jpg";
import listing2 from "@/assets/listing-2.jpg";
import listing3 from "@/assets/listing-3.jpg";
import trending1 from "@/assets/trending-1.jpg";
import trending2 from "@/assets/trending-2.jpg";

export type Listing = {
  id: string;
  title: string;
  location: string;
  price: number; // per night
  rating: number;
  image: string;
  description?: string;
};

export type ListingCardData = Listing;

export type ChatMessage =
  | { id: string; role: "user"; content: string; createdAt: number }
  | { id: string; role: "assistant"; content: string; createdAt: number; listings?: Listing[]; confirm?: { listing: Listing; nights: number; total: number }; receipt?: { listing: Listing; nights: number; total: number; date: string } };

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
};

export type Role = "client" | "agent";

export const SAMPLE_LISTINGS: Listing[] = [
  { id: "l1", title: "Luxury Suite in Juja", location: "Juja, Kenya", price: 300, rating: 4.8, image: listing1, description: "Floor-to-ceiling windows, king bed, skyline view." },
  { id: "l2", title: "Infinity Pool Villa", location: "Diani Beach", price: 520, rating: 4.9, image: listing2, description: "Private villa with infinity pool overlooking the ocean." },
  { id: "l3", title: "Linen & Oak Apartment", location: "Juja, Kenya", price: 180, rating: 4.7, image: listing3, description: "Calm, minimal apartment in a quiet neighborhood." },
];

export const TRENDING: Listing[] = [
  { id: "t1", title: "Skyline Rooftop Dinner", location: "Nairobi", price: 95, rating: 4.9, image: trending1, description: "Five-course tasting menu under the city lights." },
  { id: "t2", title: "Misty Forest Cabin", location: "Aberdare", price: 240, rating: 4.8, image: trending2, description: "Wood cabin retreat among pines and morning fog." },
];
