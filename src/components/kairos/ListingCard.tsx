import { motion } from "framer-motion";
import { Heart, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { CATEGORY_META, Listing } from "@/lib/kairos-data";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { RatingStars } from "./RatingStars";
import { cn } from "@/lib/utils";

interface Props {
  listing: Listing;
  onSelect?: (l: Listing) => void;
  compact?: boolean;
  showCategory?: boolean;
}

export function ListingCard({ listing, onSelect, compact, showCategory }: Props) {
  const { isFavorite, toggleFavorite } = useApp();
  const fav = isFavorite(listing.id);
  const meta = CATEGORY_META[listing.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="group rounded-2xl overflow-hidden bg-card border border-border shadow-soft hover:shadow-elevated transition-shadow flex flex-col"
    >
      <Link to={`/listing/${listing.id}`} className="block relative">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={listing.image}
            alt={listing.title}
            loading="lazy"
            width={1024}
            height={768}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          />
          {showCategory && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur text-[10px] font-medium uppercase tracking-wider">
              {meta.label}
            </div>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(listing.id);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform"
            aria-label="Save"
          >
            <Heart className={cn("w-4 h-4", fav ? "fill-destructive text-destructive" : "text-foreground")} />
          </button>
        </div>
      </Link>
      <div className={cn("flex-1 flex flex-col", compact ? "p-3" : "p-4")}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/listing/${listing.id}`}>
              <h4 className="font-display text-base leading-tight hover:underline underline-offset-4 truncate">
                {listing.title}
              </h4>
            </Link>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{listing.location}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-semibold">${listing.price}</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5">{meta.unit}</div>
          </div>
        </div>

        {!compact && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{listing.shortDescription}</p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <RatingStars rating={listing.rating} />
            <span className="text-xs text-muted-foreground">
              {listing.rating} · {listing.reviewCount}
            </span>
          </div>
          {onSelect ? (
            <Button
              onClick={() => onSelect(listing)}
              size="sm"
              className="bg-foreground text-background hover:bg-foreground/90 rounded-xl h-8"
            >
              Select
            </Button>
          ) : (
            <Link to={`/listing/${listing.id}`}>
              <Button size="sm" variant="ghost" className="rounded-xl h-8 text-xs">
                View details
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
