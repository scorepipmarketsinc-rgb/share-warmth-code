import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, CheckCircle2, Heart, MapPin, MessageSquare, Share2, Sparkles } from "lucide-react";
import { CATEGORY_META, getListing, getRelated } from "@/lib/kairos-data";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RatingStars } from "@/components/kairos/RatingStars";
import { ListingCard } from "@/components/kairos/ListingCard";
import { ReceiptCard } from "@/components/kairos/ReceiptCard";
import { Booking } from "@/lib/kairos-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const listing = id ? getListing(id) : undefined;
  const { isFavorite, toggleFavorite, createBooking } = useApp();
  const [activeImg, setActiveImg] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [nights, setNights] = useState(3);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  const related = useMemo(() => (listing ? getRelated(listing) : []), [listing]);

  if (!listing) {
    return (
      <div className="p-12 text-center">
        <p className="text-muted-foreground">Listing not found.</p>
        <Link to="/discover" className="text-accent underline mt-2 inline-block">Back to Discover</Link>
      </div>
    );
  }

  const meta = CATEGORY_META[listing.category];
  const fav = isFavorite(listing.id);
  const total = listing.price * nights;

  const handleConfirm = () => {
    const b = createBooking(listing, nights, "manual");
    if (b) {
      setConfirmed(b);
    }
  };

  const closeAndReset = () => {
    setBookingOpen(false);
    setTimeout(() => setConfirmed(null), 300);
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{meta.label}</div>
          <h1 className="font-display text-3xl md:text-4xl mt-1">{listing.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm">
            <RatingStars rating={listing.rating} />
            <span className="font-medium">{listing.rating}</span>
            <span className="text-muted-foreground">· {listing.reviewCount} reviews</span>
            <span className="text-muted-foreground">·</span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" /> {listing.location}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => toast("Link copied")}>
            <Share2 className="w-4 h-4 mr-1.5" /> Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleFavorite(listing.id)}
            className="rounded-xl"
          >
            <Heart className={cn("w-4 h-4 mr-1.5", fav && "fill-destructive text-destructive")} />
            {fav ? "Saved" : "Save"}
          </Button>
        </div>
      </div>

      {/* Gallery */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 grid grid-cols-4 gap-3 rounded-3xl overflow-hidden"
      >
        <div className="col-span-4 md:col-span-3 aspect-[16/10] md:aspect-[16/9] overflow-hidden bg-muted">
          <img
            src={listing.gallery[activeImg]}
            alt={listing.title}
            className="w-full h-full object-cover"
            width={1024}
            height={768}
          />
        </div>
        <div className="col-span-4 md:col-span-1 grid grid-cols-3 md:grid-cols-1 gap-3">
          {listing.gallery.map((g, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={cn(
                "aspect-square overflow-hidden rounded-xl bg-muted ring-2 transition-all",
                activeImg === i ? "ring-accent" : "ring-transparent hover:opacity-90"
              )}
            >
              <img src={g} alt="" loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Body */}
      <div className="mt-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Provider */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center font-display text-accent-foreground">
                {listing.provider.name[0]}
              </div>
              <div>
                <div className="font-medium text-sm">Hosted by {listing.provider.name}</div>
                <div className="text-xs text-muted-foreground">{listing.provider.tagline} · ★ {listing.provider.rating}</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="rounded-xl">
              <MessageSquare className="w-4 h-4 mr-1.5" /> Contact
            </Button>
          </div>

          <section>
            <h2 className="font-display text-xl">About this experience</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">{listing.description}</p>
          </section>

          <section>
            <h2 className="font-display text-xl mb-3">What's included</h2>
            <div className="grid grid-cols-2 gap-2">
              {listing.amenities.map((a) => (
                <div key={a} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl mb-3">Highlights</h2>
            <div className="flex flex-wrap gap-2">
              {listing.highlights.map((h) => (
                <span key={h} className="text-xs px-3 py-1.5 rounded-full bg-accent-soft border border-border">
                  {h}
                </span>
              ))}
            </div>
          </section>

          {/* Map */}
          <section>
            <h2 className="font-display text-xl mb-3">Location</h2>
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="aspect-[16/9] bg-gradient-to-br from-muted via-accent-soft to-muted relative flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 30% 40%, hsl(var(--accent)/0.4), transparent 40%), radial-gradient(circle at 70% 60%, hsl(var(--primary)/0.2), transparent 50%)",
                  }}
                />
                <div className="relative text-center">
                  <MapPin className="w-7 h-7 text-accent mx-auto" />
                  <div className="text-sm mt-1">{listing.location}</div>
                  <div className="text-xs text-muted-foreground">Map view placeholder</div>
                </div>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section>
            <div className="flex items-end justify-between mb-3">
              <h2 className="font-display text-xl">Guest reviews</h2>
              <div className="text-sm text-muted-foreground">{listing.reviewCount} total</div>
            </div>
            <div className="space-y-3">
              {listing.reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{r.author}</div>
                    <div className="flex items-center gap-2">
                      <RatingStars rating={r.rating} />
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Booking sticky */}
        <aside>
          <div className="sticky top-20 rounded-2xl border border-border bg-card p-5 shadow-elevated">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="font-display text-3xl">${listing.price}</span>
                <span className="text-xs text-muted-foreground ml-1">{meta.unit}</span>
              </div>
              <div className="text-xs text-muted-foreground">★ {listing.rating} · {listing.reviewCount}</div>
            </div>

            <div className="mt-4 rounded-xl border border-border p-3">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {listing.category === "hotels" ? "Nights" : "Quantity"}
              </label>
              <div className="flex items-center justify-between mt-1">
                <button onClick={() => setNights((n) => Math.max(1, n - 1))} className="w-8 h-8 rounded-full border border-border hover:bg-muted">−</button>
                <span className="font-display text-xl tabular-nums">{nights}</span>
                <button onClick={() => setNights((n) => n + 1)} className="w-8 h-8 rounded-full border border-border hover:bg-muted">+</button>
              </div>
            </div>

            <div className="mt-3 text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between"><span>${listing.price} × {nights}</span><span>${total.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Service fee</span><span>$0</span></div>
              <div className="flex justify-between font-medium text-foreground border-t border-border pt-2 mt-2">
                <span>Total</span><span className="font-display text-lg">${total.toLocaleString()}</span>
              </div>
            </div>

            <Button
              onClick={() => setBookingOpen(true)}
              className="w-full mt-4 bg-gradient-gold text-accent-foreground hover:opacity-90 rounded-xl shadow-gold h-11"
            >
              <Calendar className="w-4 h-4 mr-1.5" /> Book Now
            </Button>
            <Button variant="outline" className="w-full mt-2 rounded-xl">
              <Sparkles className="w-4 h-4 mr-1.5" /> Ask Kairos about this
            </Button>
          </div>
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl mb-4">You might also love</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {related.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      {/* Booking dialog */}
      <Dialog open={bookingOpen} onOpenChange={(o) => { if (!o) closeAndReset(); else setBookingOpen(true); }}>
        <DialogContent className="rounded-3xl max-w-md">
          {!confirmed ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Confirm your booking</DialogTitle>
                <DialogDescription>Review and confirm to charge your wallet.</DialogDescription>
              </DialogHeader>
              <div className="rounded-2xl border border-border p-4 mt-2 space-y-2 text-sm">
                <Row label="Experience" value={listing.title} />
                <Row label="Provider" value={listing.provider.name} />
                <Row label="Quantity" value={String(nights)} />
                <div className="border-t border-border pt-2 mt-2 flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-display text-lg">${total.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="ghost" className="rounded-xl flex-1" onClick={() => setBookingOpen(false)}>Cancel</Button>
                <Button onClick={handleConfirm} className="rounded-xl flex-1 bg-foreground text-background hover:bg-foreground/90">
                  Confirm booking
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">You're booked.</DialogTitle>
                <DialogDescription>Receipt is ready — print or save as PDF.</DialogDescription>
              </DialogHeader>
              <ReceiptCard booking={confirmed} />
              <div className="flex gap-2 mt-2 no-print">
                <Button variant="outline" className="rounded-xl flex-1" onClick={closeAndReset}>Close</Button>
                <Link to="/dashboard" className="flex-1">
                  <Button className="rounded-xl w-full bg-foreground text-background hover:bg-foreground/90">View dashboard</Button>
                </Link>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

export default ListingDetail;
