import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp, Sparkles, MapPin, Star, Check, CreditCard, Loader2,
  Receipt, ExternalLink, Calendar, ChevronLeft, Lock, ShieldCheck, X, LayoutPanelLeft,
} from "lucide-react";
import { Listing } from "@/lib/kairos-data";
import { craftReply, findListings, parseQuery } from "@/lib/mock-ai";
import { useApp, uid } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ChatMsg = { id: string; role: "user" | "assistant"; content: string; ts: number };
type Stage = "idle" | "results" | "summary" | "payment" | "processing" | "receipt";

const QUICK = [
  "Find a hotel in Nairobi under $300",
  "Plan a Diani beach getaway",
  "Book a private chef for tonight",
  "VIP nightlife experience",
];

const Kairos = () => {
  const { createBooking } = useApp();
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: uid(),
      role: "assistant",
      content:
        "Welcome to Kairos. I'm your transaction assistant — tell me what you need (a hotel, an experience, a service) and I'll handle the search, booking, and payment in one flow.",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [results, setResults] = useState<Listing[]>([]);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [nights, setNights] = useState(3);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [card, setCard] = useState({ name: "Alex Mwangi", number: "4242 4242 4242 4242", exp: "12/27", cvc: "123" });

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, thinking]);

  const total = useMemo(() => (selected ? selected.price * nights : 0), [selected, nights]);

  const send = (text: string) => {
    const v = text.trim();
    if (!v) return;
    setInput("");
    const userMsg: ChatMsg = { id: uid(), role: "user", content: v, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setThinking(true);

    // Simulated GET /api/{category} call
    setTimeout(() => {
      const q = parseQuery(v);
      const found = findListings(q).slice(0, 4);
      // pad to 4 if fewer
      const padded = found.length >= 4 ? found.slice(0, 4) : findListings({}).slice(0, 4);
      const reply = craftReply(v, padded, q);
      setMessages((m) => [
        ...m,
        { id: uid(), role: "assistant", content: reply, ts: Date.now() },
      ]);
      setResults(padded);
      setSelected(null);
      setStage("results");
      setThinking(false);
    }, 750);
  };

  const handleSelect = (l: Listing) => {
    setSelected(l);
    setStage("summary");
    setMessages((m) => [
      ...m,
      {
        id: uid(),
        role: "assistant",
        content: `Great choice — **${l.title}** in ${l.location}. Review the summary on the right and continue to booking when ready.`,
        ts: Date.now(),
      },
    ]);
  };

  const handleContinueToBooking = () => {
    setStage("payment");
    setMessages((m) => [
      ...m,
      {
        id: uid(),
        role: "assistant",
        content: `Booking initialized. Securely complete payment of $${total.toLocaleString()} to confirm.`,
        ts: Date.now(),
      },
    ]);
  };

  const handlePay = () => {
    if (!selected) return;
    setStage("processing");
    setTimeout(() => {
      const b = createBooking(selected, nights, "chat");
      if (!b) {
        setStage("payment");
        return;
      }
      setBookingId(b.id);
      setStage("receipt");
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "assistant",
          content: `✅ Payment received. Booking **${b.id}** confirmed. Your receipt is on the right.`,
          ts: Date.now(),
        },
      ]);
      toast.success("Payment successful");
    }, 1600);
  };

  const reset = () => {
    setSelected(null);
    setResults([]);
    setStage("idle");
    setBookingId(null);
  };

  return (
    <div className="h-full flex bg-background">
      {/* LEFT — Chat */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center shadow-gold">
            <Sparkles className="w-4 h-4 text-accent-foreground" />
          </div>
          <div>
            <div className="font-display text-sm leading-none">Kairos Transaction Assistant</div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground mt-1">
              Search · Book · Pay
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-3", m.role === "user" && "justify-end")}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-gold flex items-center justify-center shrink-0 shadow-gold">
                    <Sparkles className="w-3.5 h-3.5 text-accent-foreground" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] px-4 py-2.5 text-sm leading-relaxed shadow-soft",
                    m.role === "user"
                      ? "rounded-2xl rounded-tr-sm bg-foreground text-background"
                      : "rounded-2xl rounded-tl-sm bg-card border border-border"
                  )}
                  dangerouslySetInnerHTML={{
                    __html: m.content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
                  }}
                />
              </motion.div>
            ))}
            {thinking && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
                  <Sparkles className="w-3.5 h-3.5 text-accent-foreground" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3 shadow-soft">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                        style={{ animationDelay: `${i * 120}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {messages.length === 1 && (
              <div className="pt-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                  Try
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-background">
          <div className="max-w-2xl mx-auto relative rounded-2xl border border-border bg-card shadow-soft focus-within:shadow-elevated transition-shadow">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask Kairos to find, book, and pay…"
              rows={1}
              className="resize-none border-0 bg-transparent rounded-2xl pr-14 py-4 px-4 focus-visible:ring-0 min-h-[56px] max-h-40"
            />
            <Button
              onClick={() => send(input)}
              size="icon"
              className="absolute right-2 bottom-2 h-10 w-10 rounded-xl bg-gradient-gold text-accent-foreground hover:opacity-90 shadow-gold"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* RIGHT — Dynamic results panel */}
      <div className="hidden md:flex w-[480px] lg:w-[540px] xl:w-[600px] shrink-0 flex-col bg-gradient-to-b from-background via-background to-muted/30 relative overflow-hidden">
        {/* futuristic backdrop */}
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="px-6 py-4 border-b border-border flex items-center justify-between relative">
          <div>
            <div className="font-display text-sm leading-none">Live Workspace</div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground mt-1">
              {stage === "idle" && "Awaiting query"}
              {stage === "results" && "Top matches"}
              {stage === "summary" && "Selection"}
              {stage === "payment" && "Secure payment"}
              {stage === "processing" && "Processing"}
              {stage === "receipt" && "Confirmed"}
            </div>
          </div>
          <StageIndicator stage={stage} />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin relative">
          <AnimatePresence mode="wait">
            {stage === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center px-10 py-12"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold mb-5">
                  <Sparkles className="w-7 h-7 text-accent-foreground" />
                </div>
                <div className="font-display text-2xl mb-2">
                  Your <span className="text-gradient-gold">live workspace</span>
                </div>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Search results, booking summaries and secure payment will appear here as you chat.
                </p>
              </motion.div>
            )}

            {stage === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-5 space-y-3"
              >
                <div className="text-xs text-muted-foreground px-1">
                  {results.length} top results · curated by Kairos
                </div>
                {results.map((l, i) => (
                  <ResultCard key={l.id} listing={l} index={i} onSelect={handleSelect} />
                ))}
              </motion.div>
            )}

            {stage === "summary" && selected && (
              <SummaryPanel
                key="summary"
                listing={selected}
                nights={nights}
                setNights={setNights}
                total={total}
                onBack={() => setStage("results")}
                onContinue={handleContinueToBooking}
              />
            )}

            {stage === "payment" && selected && (
              <PaymentPanel
                key="payment"
                listing={selected}
                total={total}
                card={card}
                setCard={setCard}
                onBack={() => setStage("summary")}
                onPay={handlePay}
              />
            )}

            {stage === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center"
              >
                <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
                <div className="font-display text-lg">Processing payment…</div>
                <div className="text-xs text-muted-foreground mt-1">Securing your booking</div>
              </motion.div>
            )}

            {stage === "receipt" && selected && bookingId && (
              <ReceiptPanel
                key="receipt"
                listing={selected}
                nights={nights}
                total={total}
                bookingId={bookingId}
                onNew={reset}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* ────── Sub-components ────── */

function StageIndicator({ stage }: { stage: Stage }) {
  const steps: Stage[] = ["results", "summary", "payment", "receipt"];
  const idx = steps.indexOf(stage === "processing" ? "payment" : stage);
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 rounded-full transition-all",
            i <= idx && stage !== "idle" ? "w-6 bg-accent" : "w-3 bg-muted"
          )}
        />
      ))}
    </div>
  );
}

function ResultCard({
  listing, index, onSelect,
}: { listing: Listing; index: number; onSelect: (l: Listing) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -2 }}
      className="group rounded-2xl bg-card border border-border shadow-soft hover:shadow-elevated transition-shadow overflow-hidden flex"
    >
      <div className="w-32 h-32 shrink-0 overflow-hidden bg-muted relative">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex-1 p-3 flex flex-col min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-display text-sm leading-tight truncate">{listing.title}</div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{listing.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5 text-[11px] shrink-0">
            <Star className="w-3 h-3 fill-accent text-accent" />
            <span className="font-medium">{listing.rating}</span>
          </div>
        </div>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <div className="font-semibold text-sm tabular-nums">${listing.price}</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5">per night</div>
          </div>
          <Button
            size="sm"
            onClick={() => onSelect(listing)}
            className="rounded-xl h-8 bg-foreground text-background hover:bg-foreground/90"
          >
            Select
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function SummaryPanel({
  listing, nights, setNights, total, onBack, onContinue,
}: {
  listing: Listing; nights: number; setNights: (n: number) => void;
  total: number; onBack: () => void; onContinue: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-5 space-y-4"
    >
      <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ChevronLeft className="w-3 h-3" /> Back to results
      </button>

      <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-elevated">
        <div className="aspect-[16/10] overflow-hidden bg-muted">
          <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
        </div>
        <div className="p-5 space-y-3">
          <div>
            <div className="font-display text-xl leading-tight">{listing.title}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              {listing.location}
              <span className="mx-1">·</span>
              <Star className="w-3 h-3 fill-accent text-accent" />
              {listing.rating} ({listing.reviewCount})
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{listing.shortDescription}</p>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Nights</div>
              <div className="flex items-center gap-2 mt-1">
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg" onClick={() => setNights(Math.max(1, nights - 1))}>−</Button>
                <span className="w-8 text-center font-medium tabular-nums">{nights}</span>
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg" onClick={() => setNights(nights + 1)}>+</Button>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="font-display text-2xl">${total.toLocaleString()}</div>
            </div>
          </div>

          <Button
            onClick={onContinue}
            className="w-full h-11 rounded-xl bg-gradient-gold text-accent-foreground hover:opacity-90 shadow-gold font-medium"
          >
            Continue to Booking
          </Button>
          <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
            <ShieldCheck className="w-3 h-3" /> Free cancellation up to 24h before
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PaymentPanel({
  listing, total, card, setCard, onBack, onPay,
}: {
  listing: Listing; total: number;
  card: { name: string; number: string; exp: string; cvc: string };
  setCard: (c: { name: string; number: string; exp: string; cvc: string }) => void;
  onBack: () => void; onPay: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-5 space-y-4"
    >
      <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ChevronLeft className="w-3 h-3" /> Back
      </button>

      <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3 shadow-soft">
        <img src={listing.image} alt="" className="w-14 h-14 rounded-xl object-cover" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{listing.title}</div>
          <div className="text-xs text-muted-foreground truncate">{listing.location}</div>
        </div>
        <div className="font-display text-lg">${total.toLocaleString()}</div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-elevated space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-display text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-accent" /> Pay securely
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Lock className="w-3 h-3" /> Stripe
          </div>
        </div>

        {/* Stylized card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-foreground via-foreground to-foreground/80 text-background p-5 shadow-elevated overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent/30 blur-2xl" />
          <div className="flex items-center justify-between relative">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-70">Kairos Pay</div>
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div className="mt-8 font-mono text-lg tracking-widest relative">{card.number}</div>
          <div className="mt-3 flex items-center justify-between text-[11px] relative">
            <div>
              <div className="opacity-60">Cardholder</div>
              <div className="uppercase tracking-wider">{card.name}</div>
            </div>
            <div>
              <div className="opacity-60">Expires</div>
              <div className="tracking-wider">{card.exp}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-[11px] text-muted-foreground">Card number</label>
            <Input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} className="rounded-xl mt-1" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">Expiry</label>
            <Input value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} className="rounded-xl mt-1" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">CVC</label>
            <Input value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} className="rounded-xl mt-1" />
          </div>
        </div>

        <Button onClick={onPay} className="w-full h-11 rounded-xl bg-gradient-gold text-accent-foreground hover:opacity-90 shadow-gold font-medium">
          Pay ${total.toLocaleString()}
        </Button>
        <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
          <Lock className="w-3 h-3" /> 256-bit encrypted · PCI compliant
        </div>
      </div>
    </motion.div>
  );
}

function ReceiptPanel({
  listing, nights, total, bookingId, onNew,
}: {
  listing: Listing; nights: number; total: number; bookingId: string; onNew: () => void;
}) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location)}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-5 space-y-4"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center"
      >
        <Check className="w-7 h-7 text-emerald-500" />
      </motion.div>
      <div className="text-center">
        <div className="font-display text-xl">Booking confirmed</div>
        <div className="text-xs text-muted-foreground mt-1">Confirmation sent to alex@kairos.ai</div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-elevated overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-accent" />
            <div className="font-display text-sm">Receipt</div>
          </div>
          <div className="text-[10px] tracking-widest text-muted-foreground">{bookingId}</div>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <img src={listing.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
            <div className="min-w-0">
              <div className="font-medium text-sm truncate">{listing.title}</div>
              <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {listing.location}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" /> {nights} night{nights > 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-1.5 text-sm">
            <Row label={`$${listing.price} × ${nights} nights`} value={`$${(listing.price * nights).toLocaleString()}`} />
            <Row label="Service fee" value="$0" />
            <Row label="Tax" value="Included" muted />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="font-display text-base">Total paid</div>
            <div className="font-display text-xl">${total.toLocaleString()}</div>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-accent" /> View on Google Maps
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => window.print()}>
              Print receipt
            </Button>
            <Button onClick={onNew} className="rounded-xl bg-foreground text-background hover:bg-foreground/90">
              New search
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className={cn("text-sm", muted ? "text-muted-foreground" : "")}>{label}</div>
      <div className={cn("text-sm tabular-nums", muted ? "text-muted-foreground" : "font-medium")}>{value}</div>
    </div>
  );
}

export default Kairos;
