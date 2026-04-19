import { Star } from "lucide-react";

export function RatingStars({ rating, size = 12 }: { rating: number; size?: number }) {
  const full = Math.round(rating);
  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i < full ? "fill-accent text-accent" : "text-muted-foreground/40"}
        />
      ))}
    </div>
  );
}
