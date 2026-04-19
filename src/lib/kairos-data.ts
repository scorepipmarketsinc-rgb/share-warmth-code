import hotel1 from "@/assets/hotel-1.jpg";
import hotel2 from "@/assets/hotel-2.jpg";
import hotel3 from "@/assets/hotel-3.jpg";
import tour1 from "@/assets/tour-1.jpg";
import tour2 from "@/assets/tour-2.jpg";
import tour3 from "@/assets/tour-3.jpg";
import lifestyle1 from "@/assets/lifestyle-1.jpg";
import lifestyle2 from "@/assets/lifestyle-2.jpg";
import lifestyle3 from "@/assets/lifestyle-3.jpg";
import service1 from "@/assets/service-1.jpg";
import service2 from "@/assets/service-2.jpg";
import service3 from "@/assets/service-3.jpg";

export type Category = "hotels" | "tours" | "lifestyle" | "services";

export const CATEGORY_META: Record<Category, { label: string; tagline: string; unit: string }> = {
  hotels: { label: "Hotels & Rooms", tagline: "Stays curated for taste.", unit: "/ night" },
  tours: { label: "Tours & Travel", tagline: "Journeys worth telling.", unit: "/ person" },
  lifestyle: { label: "Lifestyle", tagline: "Moments to remember.", unit: "/ experience" },
  services: { label: "Services", tagline: "On‑demand excellence.", unit: "/ session" },
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
};

export type Listing = {
  id: string;
  category: Category;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  gallery: string[];
  description: string;
  shortDescription: string;
  amenities: string[];
  highlights: string[];
  provider: { name: string; tagline: string; rating: number };
  reviews: Review[];
  status?: "active" | "pending" | "flagged";
};

export type Role = "client" | "agent" | "admin";

export type ChatMessage =
  | { id: string; role: "user"; content: string; createdAt: number }
  | {
      id: string;
      role: "assistant";
      content: string;
      createdAt: number;
      listings?: Listing[];
      confirm?: { listing: Listing; nights: number; total: number };
      receipt?: { bookingId: string; listing: Listing; nights: number; total: number; date: string };
    };

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
};

export type Booking = {
  id: string;
  listingId: string;
  category: Category;
  title: string;
  location: string;
  provider: string;
  total: number;
  nights: number;
  date: string;
  startISO: string;
  endISO: string;
  status: "upcoming" | "completed" | "cancelled";
  createdAt: number;
  customer: string;
  source: "chat" | "manual";
};

export type Transaction = {
  id: string;
  label: string;
  amount: number; // negative = debit, positive = credit
  date: string;
  type: "booking" | "topup" | "refund";
};

const r = (id: string, author: string, rating: number, text: string, date: string): Review => ({
  id, author, rating, text, date,
});

export const LISTINGS: Listing[] = [
  // ── HOTELS
  {
    id: "h1",
    category: "hotels",
    title: "The Ivory Skyline Suite",
    location: "Westlands, Nairobi",
    price: 320,
    rating: 4.9,
    reviewCount: 218,
    image: hotel1,
    gallery: [hotel1, hotel3, hotel2],
    shortDescription: "Floor-to-ceiling skyline views, king bed, suite-only floor.",
    description:
      "Perched on the 32nd floor, the Ivory Skyline Suite blends warm walnut, brushed brass and silk linens. Wake to a sweeping skyline, work from the bay-window desk, and unwind with the in-suite spa bath.",
    amenities: ["King bed", "Skyline view", "Spa bath", "Espresso bar", "Rainfall shower", "Wi‑Fi 1 Gbps"],
    highlights: ["24h concierge", "Private elevator", "Late checkout"],
    provider: { name: "Ivory Collection", tagline: "Modern luxury hospitality", rating: 4.9 },
    reviews: [
      r("rh1", "Amelia R.", 5, "Honestly the most beautiful suite I've stayed in. The view at sunset is unreal.", "2 weeks ago"),
      r("rh2", "Daniel K.", 5, "Quiet, fast Wi‑Fi, and the espresso bar is a lovely touch.", "1 month ago"),
      r("rh3", "Priya S.", 4, "Loved everything; only wish breakfast was included.", "1 month ago"),
    ],
  },
  {
    id: "h2",
    category: "hotels",
    title: "Linen & Oak Boutique Stay",
    location: "Karen, Nairobi",
    price: 185,
    rating: 4.8,
    reviewCount: 142,
    image: hotel2,
    gallery: [hotel2, hotel1, hotel3],
    shortDescription: "Calm, light-filled boutique room with rattan and linen.",
    description:
      "A quiet boutique room steps from leafy Karen. Designed around natural materials—rattan, linen, oak—and morning light through sheer curtains.",
    amenities: ["Queen bed", "Garden view", "Yoga mat", "Filter coffee", "Wi‑Fi"],
    highlights: ["Plant-filled", "Locally sourced breakfast", "Bicycle rental"],
    provider: { name: "Linen & Oak", tagline: "Slow-living boutique stays", rating: 4.8 },
    reviews: [
      r("rh4", "Joan M.", 5, "Felt like a retreat. Sleep was incredible.", "3 days ago"),
      r("rh5", "Mark O.", 5, "Hosts thought of every detail.", "3 weeks ago"),
    ],
  },
  {
    id: "h3",
    category: "hotels",
    title: "Skyline Loft Apartment",
    location: "Kilimani, Nairobi",
    price: 240,
    rating: 4.7,
    reviewCount: 96,
    image: hotel3,
    gallery: [hotel3, hotel1, hotel2],
    shortDescription: "Designer loft with full skyline windows and home office.",
    description:
      "Open-plan loft with dark oak floors, designer furniture and a sweeping panorama. Ideal for longer stays or a working escape.",
    amenities: ["Workstation", "Full kitchen", "Smart TV", "Washer/dryer", "Skyline view"],
    highlights: ["Self check-in", "Pet-friendly", "Long-stay discount"],
    provider: { name: "Skyline Lofts", tagline: "Urban living, elevated", rating: 4.7 },
    reviews: [
      r("rh6", "Sara T.", 5, "The view at night sold me.", "1 week ago"),
      r("rh7", "Ben A.", 4, "Great workspace, comfortable bed.", "1 month ago"),
    ],
  },

  // ── TOURS
  {
    id: "t1",
    category: "tours",
    title: "Maasai Mara Golden Hour Safari",
    location: "Maasai Mara",
    price: 480,
    rating: 4.9,
    reviewCount: 312,
    image: tour1,
    gallery: [tour1, tour3, tour2],
    shortDescription: "Private 4×4 game drive ending under an orange Mara sky.",
    description:
      "A guided private game drive through the Mara plains timed to golden hour. Spot elephants, lions and giraffes, and finish with sundowners on the savanna.",
    amenities: ["Private 4×4", "Expert guide", "Sundowner drinks", "Snacks", "Photography stops"],
    highlights: ["Big Five sightings", "Sunset finale", "Small group"],
    provider: { name: "Mara Wild Co.", tagline: "Conservation-led safaris", rating: 4.9 },
    reviews: [
      r("rt1", "Hiroshi N.", 5, "Once-in-a-lifetime. Our guide was a wildlife encyclopedia.", "5 days ago"),
      r("rt2", "Lina P.", 5, "Incredible photos, incredible memories.", "2 weeks ago"),
    ],
  },
  {
    id: "t2",
    category: "tours",
    title: "Nairobi by Night City Tour",
    location: "Nairobi CBD",
    price: 95,
    rating: 4.7,
    reviewCount: 184,
    image: tour2,
    gallery: [tour2, tour1, tour3],
    shortDescription: "Skyline drive, rooftop stop, and street food crawl.",
    description:
      "See Nairobi the way locals love it: a skyline drive, a rooftop sundowner, and a curated street food crawl through the city's most loved spots.",
    amenities: ["Private driver", "Local guide", "3 food stops", "Rooftop drink"],
    highlights: ["Hidden viewpoints", "Live music stop", "3 hours"],
    provider: { name: "City Pulse Tours", tagline: "Nairobi after dark", rating: 4.7 },
    reviews: [
      r("rt3", "Greta V.", 5, "Best way to fall in love with Nairobi.", "1 week ago"),
    ],
  },
  {
    id: "t3",
    category: "tours",
    title: "Diani Beach Coastal Getaway",
    location: "Diani Beach",
    price: 560,
    rating: 4.8,
    reviewCount: 228,
    image: tour3,
    gallery: [tour3, tour1, tour2],
    shortDescription: "Three days on Diani's white sand with snorkel and dhow.",
    description:
      "Three days on the Indian Ocean coast: snorkeling at Kisite, a sunset dhow sail, and slow mornings on white sand.",
    amenities: ["Beach transfer", "Snorkel gear", "Dhow sail", "Daily breakfast"],
    highlights: ["Kisite Marine Park", "Sunset dhow", "Private beach access"],
    provider: { name: "Coast & Co.", tagline: "Coastal escapes done well", rating: 4.8 },
    reviews: [
      r("rt4", "Ravi M.", 5, "Pure paradise. The dhow at sunset was magical.", "3 weeks ago"),
    ],
  },

  // ── LIFESTYLE
  {
    id: "l1",
    category: "lifestyle",
    title: "Skyline Rooftop Tasting Dinner",
    location: "Nairobi",
    price: 145,
    rating: 4.9,
    reviewCount: 174,
    image: lifestyle1,
    gallery: [lifestyle1, lifestyle3, lifestyle2],
    shortDescription: "Five-course tasting menu under the city lights.",
    description:
      "A five-course tasting menu by a guest chef, served on a candle-lit rooftop with the skyline as your backdrop. Wine pairing optional.",
    amenities: ["5 courses", "Sommelier", "Candle-lit", "Live jazz", "Vegetarian option"],
    highlights: ["Smart casual dress", "7pm seating", "2.5 hrs"],
    provider: { name: "Atlas Rooftop", tagline: "Skyline dining series", rating: 4.9 },
    reviews: [
      r("rl1", "Eva H.", 5, "The food, the lights, the music — perfect anniversary.", "10 days ago"),
    ],
  },
  {
    id: "l2",
    category: "lifestyle",
    title: "Mountain Wellness Retreat",
    location: "Aberdare Range",
    price: 320,
    rating: 4.8,
    reviewCount: 88,
    image: lifestyle2,
    gallery: [lifestyle2, lifestyle1, lifestyle3],
    shortDescription: "Half-day infinity pool, sauna, and sound bath.",
    description:
      "Reset with a half-day wellness ritual: infinity pool, eucalyptus sauna, guided sound bath, and a plant-based lunch overlooking the valley.",
    amenities: ["Infinity pool", "Sauna", "Sound bath", "Plant-based lunch", "Robe & sandals"],
    highlights: ["Adults only", "5 hours", "Quiet zone"],
    provider: { name: "Stillpoint Retreats", tagline: "Wellness by design", rating: 4.8 },
    reviews: [
      r("rl2", "Nia O.", 5, "Walked out a different person.", "2 weeks ago"),
    ],
  },
  {
    id: "l3",
    category: "lifestyle",
    title: "VIP Nightlife Access",
    location: "Westlands, Nairobi",
    price: 180,
    rating: 4.6,
    reviewCount: 132,
    image: lifestyle3,
    gallery: [lifestyle3, lifestyle1, lifestyle2],
    shortDescription: "Skip-the-line VIP table at the city's top venues.",
    description:
      "Skip-the-line VIP table reservation across three top venues, with bottle service and a private host for the night.",
    amenities: ["VIP table", "Bottle service", "Host", "Skip the line", "Multi-venue"],
    highlights: ["Dress code: smart", "21+", "Until 3am"],
    provider: { name: "Noir Hosts", tagline: "Curated nightlife access", rating: 4.6 },
    reviews: [
      r("rl3", "Tomas L.", 5, "Treated like a celebrity all night.", "1 week ago"),
    ],
  },

  // ── SERVICES
  {
    id: "s1",
    category: "services",
    title: "Private Chef Experience",
    location: "Your residence · Nairobi",
    price: 220,
    rating: 4.9,
    reviewCount: 154,
    image: service1,
    gallery: [service1, service3, service2],
    shortDescription: "A trained chef cooks a 4‑course tasting in your kitchen.",
    description:
      "A trained chef arrives with seasonal ingredients and cooks a four-course tasting menu in your kitchen, including service and clean-up.",
    amenities: ["4 courses", "Groceries included", "Clean-up", "Dietary tailoring", "Up to 6 guests"],
    highlights: ["Pairing add-on", "Kid menu", "Vegan menu"],
    provider: { name: "Chef Atlas", tagline: "Private dining, in your home", rating: 4.9 },
    reviews: [
      r("rs1", "Maya K.", 5, "Restaurant-quality without leaving home.", "1 week ago"),
    ],
  },
  {
    id: "s2",
    category: "services",
    title: "Executive Chauffeur (8h)",
    location: "Nairobi metro",
    price: 260,
    rating: 4.8,
    reviewCount: 96,
    image: service2,
    gallery: [service2, service1, service3],
    shortDescription: "Black sedan with professional chauffeur for a full day.",
    description:
      "A discreet, suited chauffeur and a black executive sedan at your disposal for eight hours. Airport runs, business meetings, evenings out.",
    amenities: ["Black sedan", "Suited chauffeur", "Bottled water", "Wi‑Fi hotspot", "Phone chargers"],
    highlights: ["Airport ready", "On-call dispatcher", "Multi-stop"],
    provider: { name: "Onyx Chauffeur", tagline: "Discreet executive transport", rating: 4.8 },
    reviews: [
      r("rs2", "James W.", 5, "Punctual, polite, and the car was immaculate.", "5 days ago"),
    ],
  },
  {
    id: "s3",
    category: "services",
    title: "Signature Event Planner",
    location: "Nationwide",
    price: 1200,
    rating: 4.9,
    reviewCount: 64,
    image: service3,
    gallery: [service3, service1, service2],
    shortDescription: "End-to-end planning for celebrations up to 80 guests.",
    description:
      "An award-winning planner takes the brief and runs the entire event: design, vendors, on-the-day coordination — for celebrations up to 80 guests.",
    amenities: ["Design board", "Vendor booking", "On-day coordination", "Florals", "Lighting"],
    highlights: ["Turnkey", "Vendor network", "Milestone updates"],
    provider: { name: "Maison Events", tagline: "Signature celebrations", rating: 4.9 },
    reviews: [
      r("rs3", "Aisha B.", 5, "Our wedding was flawless. Worth every shilling.", "2 months ago"),
    ],
  },
];

export const TRENDING: Listing[] = [LISTINGS[0], LISTINGS[3], LISTINGS[6]];

export const getListing = (id: string) => LISTINGS.find((l) => l.id === id);
export const getRelated = (l: Listing, n = 3) =>
  LISTINGS.filter((x) => x.id !== l.id && x.category === l.category).slice(0, n);

// Mock user for admin/user dashboards
export const MOCK_USER = { name: "Alex Mwangi", email: "alex@kairos.ai" };
