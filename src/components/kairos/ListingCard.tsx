import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";
import { Listing } from "@/lib/kairos-data";
import { Button } from "@/components/ui/button";

interface Props {
  listing: Listing;
  onSelect?: (l: Listing) => void;
  compact?: boolean;
}

export function ListingCard({ listing, onSelect, compact }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="group rounded-2xl overflow-hidden bg-card border border-border shadow-soft hover:shadow-elevated transition-shadow"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={listing.image}
          alt={listing.title}
          loading="lazy"
          width={1024}
          height={768}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur text-xs font-medium flex items-center gap-1">
          <Star className="w-3 h-3 fill-accent text-accent" />
          {listing.rating}
        </div>
      </div>
      <div className={compact ? "p-3" : "p-4"}>
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-display text-base leading-tight">{listing.title}</h4>
          <div className="text-right shrink-0">
            <div className="font-semibold">${listing.price}</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5">/ night</div>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {listing.location}
        </div>
        {onSelect && (
          <Button
            onClick={() => onSelect(listing)}
            size="sm"
            className="mt-3 w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl"
          >
            Select
          </Button>
        )}
      </div>
    </motion.div>
  );
}
