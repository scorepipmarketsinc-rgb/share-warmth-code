import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Plane, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LISTINGS } from "@/lib/kairos-data";

const PACKAGES = [
  { id: "tp1", title: "Mara Sky & Savanna · 5 nights", location: "Nairobi → Maasai Mara", duration: "5 days · 4 nights", price: 2480, image: LISTINGS.find((l) => l.id === "t1")!.image, blurb: "Private safari, sundowners and a luxe tented camp.", listingId: "t1" },
  { id: "tp2", title: "Coastal Linen Retreat", location: "Diani Beach", duration: "4 days · 3 nights", price: 1690, image: LISTINGS.find((l) => l.id === "h2")!.image, blurb: "Slow mornings, ocean swims and curated dinners.", listingId: "h2" },
  { id: "tp3", title: "Skyline Weekend in Nairobi", location: "Nairobi", duration: "3 days · 2 nights", price: 980, image: LISTINGS.find((l) => l.id === "h1")!.image, blurb: "Loft suite, rooftop tour and chef-led dining.", listingId: "h1" },
  { id: "tp4", title: "Wild & Wellness · 7 nights", location: "Mara · Karen", duration: "7 days · 6 nights", price: 3950, image: LISTINGS.find((l) => l.id === "t1")!.image, blurb: "Game drives, yoga and forest spa rituals.", listingId: "t1" },
  { id: "tp5", title: "Founders' Escape", location: "Karen · Kilimani", duration: "5 days · 4 nights", price: 2180, image: LISTINGS.find((l) => l.id === "h3")!.image, blurb: "Deep work mornings, curated nights, private driver.", listingId: "h3" },
  { id: "tp6", title: "City Lights Weekend", location: "Nairobi CBD", duration: "2 days · 1 night", price: 540, image: LISTINGS.find((l) => l.id === "t2")!.image, blurb: "Skyline drive, rooftop dinner, nightlife access.", listingId: "t2" },
];

export default function Travel() {
  const navigate = useNavigate();
  return (
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto">
      <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-accent">
        <Plane className="w-3 h-3" /> Travel packages
      </div>
      <h1 className="font-display text-3xl md:text-5xl mt-1">Curated journeys, ready to book.</h1>
      <p className="text-sm text-muted-foreground mt-2 max-w-xl">
        Hand-built itineraries combining stays, tours and experiences. Pick a package — Kairos handles the rest.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PACKAGES.map((p, i) => (
          <motion.button
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/listing/${p.listingId}`)}
            className="group text-left rounded-2xl border border-border bg-card overflow-hidden hover:shadow-soft transition-all"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-background/90 backdrop-blur text-[10px] uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" /> {p.duration}
              </div>
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-foreground text-background text-xs font-medium tabular-nums">
                ${p.price.toLocaleString()}
              </div>
            </div>
            <div className="p-4 space-y-2">
              <div className="font-display text-lg leading-tight">{p.title}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" /> {p.location}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{p.blurb}</p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1 text-xs"><Star className="w-3 h-3 fill-accent text-accent" /> 4.9 · curated</div>
                <Button size="sm" variant="ghost" className="rounded-lg">View →</Button>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
