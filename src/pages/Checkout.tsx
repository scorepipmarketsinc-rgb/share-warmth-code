import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MapPin,
  Receipt,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ---------- Mock backend ----------
type Intent = { clientSecret: string; bookingId: string; amount: number; type: string };

async function createPaymentIntent(body: {
  bookingId: string;
  amount: number;
  type: string;
}): Promise<Intent> {
  // POST /api/payments/create-intent
  await new Promise((r) => setTimeout(r, 700));
  return {
    clientSecret: `pi_mock_${Math.random().toString(36).slice(2, 10)}_secret_${Math.random()
      .toString(36)
      .slice(2, 12)}`,
    bookingId: body.bookingId,
    amount: body.amount,
    type: body.type,
  };
}

async function confirmPayment(payload: { clientSecret: string; bookingId: string }) {
  // POST /api/payments/confirm
  await new Promise((r) => setTimeout(r, 900));
  return {
    status: "succeeded",
    receiptUrl: `https://receipts.kairos.ai/${payload.bookingId}`,
    bookingRef: `KAI-${payload.bookingId.slice(-6).toUpperCase()}`,
    paidAt: new Date().toISOString(),
  };
}

// Simulated stripe.confirmCardPayment
async function stripeConfirmCardPayment(
  clientSecret: string,
  card: { number: string; exp: string; cvc: string; name: string; email: string }
): Promise<{ paymentIntent?: { id: string; status: string }; error?: { message: string } }> {
  await new Promise((r) => setTimeout(r, 1400));
  const digits = card.number.replace(/\s/g, "");
  if (digits === "4000000000000002") return { error: { message: "Your card was declined." } };
  if (digits === "4000000000009995")
    return { error: { message: "Your card has insufficient funds." } };
  if (digits !== "4242424242424242")
    return { error: { message: "Use the Stripe test card 4242 4242 4242 4242." } };
  if (!/^\d{2}\/\d{2}$/.test(card.exp)) return { error: { message: "Invalid expiry (MM/YY)." } };
  if (!/^\d{3,4}$/.test(card.cvc)) return { error: { message: "Invalid CVC." } };
  if (!card.name.trim()) return { error: { message: "Cardholder name required." } };
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(card.email))
    return { error: { message: "Valid email required for receipt." } };
  return { paymentIntent: { id: clientSecret.split("_secret_")[0], status: "succeeded" } };
}

// ---------- Helpers ----------
const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

function formatCardNumber(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}
function formatExp(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  if (d.length < 3) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

// ---------- Page ----------
type Stage = "form" | "processing" | "success" | "error";

export default function Checkout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = params.get("bookingId") ?? `bk_${Date.now()}`;
  const amount = Number(params.get("amount") ?? 480);
  const type = (params.get("type") ?? "property") as "property" | "hotel" | "experience";
  const title = params.get("title") ?? "Aurora Sky Villa — Penthouse Suite";
  const location = params.get("location") ?? "Dubai Marina, UAE";
  const image =
    params.get("image") ??
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80&auto=format&fit=crop";
  const lat = params.get("lat") ?? "25.0805";
  const lng = params.get("lng") ?? "55.1403";

  const breakdown = useMemo(() => {
    const total = amount;
    const platformFee = +(total * 0.15).toFixed(2);
    const hostPayout = +(total * 0.85).toFixed(2);
    return { total, platformFee, hostPayout };
  }, [amount]);

  const [intent, setIntent] = useState<Intent | null>(null);
  const [stage, setStage] = useState<Stage>("form");
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    receiptUrl: string;
    bookingRef: string;
    paidAt: string;
  } | null>(null);

  const [card, setCard] = useState({
    number: "",
    exp: "",
    cvc: "",
    name: "",
    email: "",
  });

  // Create intent on mount
  useEffect(() => {
    let alive = true;
    createPaymentIntent({ bookingId, amount, type })
      .then((i) => alive && setIntent(i))
      .catch(() => alive && setError("Could not initialize payment. Please retry."));
    return () => {
      alive = false;
    };
  }, [bookingId, amount, type]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent) return;
    setError(null);
    setStage("processing");
    try {
      const res = await stripeConfirmCardPayment(intent.clientSecret, card);
      if (res.error) {
        setError(res.error.message);
        setStage("error");
        toast.error(res.error.message);
        return;
      }
      const conf = await confirmPayment({
        clientSecret: intent.clientSecret,
        bookingId: intent.bookingId,
      });
      setReceipt({
        receiptUrl: conf.receiptUrl,
        bookingRef: conf.bookingRef,
        paidAt: conf.paidAt,
      });
      setStage("success");
      toast.success("Payment successful");
    } catch {
      setError("Network error. Please try again.");
      setStage("error");
    }
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-background">
      {/* Futuristic backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-32 h-[420px] w-[420px] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1.2fr_1fr] lg:px-8 lg:py-12">
        {/* LEFT — Payment surface */}
        <div className="order-2 lg:order-1">
          <AnimatePresence mode="wait">
            {stage === "success" && receipt ? (
              <SuccessPanel
                key="success"
                receipt={receipt}
                amount={breakdown.total}
                title={title}
                location={location}
                mapsUrl={mapsUrl}
                onDone={() => navigate("/dashboard")}
              />
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-2xl backdrop-blur-xl sm:p-7"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <h1 className="text-base font-semibold tracking-tight sm:text-lg">
                        Secure checkout
                      </h1>
                      <p className="text-xs text-muted-foreground">
                        Powered by Stripe · Test mode
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="gap-1 text-[10px]">
                    <Lock className="h-3 w-3" /> 256-bit TLS
                  </Badge>
                </div>

                <form onSubmit={handlePay} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Cardholder name">
                      <Input
                        autoComplete="cc-name"
                        placeholder="Jane Doe"
                        value={card.name}
                        onChange={(e) => setCard({ ...card, name: e.target.value })}
                        required
                      />
                    </Field>
                    <Field label="Email for receipt">
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="you@email.com"
                        value={card.email}
                        onChange={(e) => setCard({ ...card, email: e.target.value })}
                        required
                      />
                    </Field>
                  </div>

                  <Field label="Card number">
                    <div className="relative">
                      <Input
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="4242 4242 4242 4242"
                        value={card.number}
                        onChange={(e) =>
                          setCard({ ...card, number: formatCardNumber(e.target.value) })
                        }
                        className="pr-16"
                        required
                      />
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        VISA
                      </div>
                    </div>
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Expiry">
                      <Input
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        placeholder="MM/YY"
                        value={card.exp}
                        onChange={(e) => setCard({ ...card, exp: formatExp(e.target.value) })}
                        required
                      />
                    </Field>
                    <Field label="CVC">
                      <Input
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder="123"
                        maxLength={4}
                        value={card.cvc}
                        onChange={(e) =>
                          setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })
                        }
                        required
                      />
                    </Field>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={!intent || stage === "processing"}
                    className="h-12 w-full gap-2 text-base font-semibold"
                    size="lg"
                  >
                    {stage === "processing" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing payment…
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" /> Pay {fmt(breakdown.total)}
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    PCI-DSS compliant · Your card details never touch our servers
                  </div>

                  {!intent && !error && (
                    <p className="text-center text-xs text-muted-foreground">
                      <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
                      Initializing secure session…
                    </p>
                  )}
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT — Order summary */}
        <aside className="order-1 lg:order-2">
          <div className="sticky top-6 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-xl backdrop-blur-xl">
              <div className="relative h-40 w-full overflow-hidden">
                <img src={image} alt={title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                <Badge className="absolute left-3 top-3 gap-1 capitalize">
                  <Sparkles className="h-3 w-3" /> {type}
                </Badge>
              </div>
              <div className="space-y-3 p-5">
                <div>
                  <h2 className="text-base font-semibold leading-tight">{title}</h2>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {location}
                  </p>
                </div>
                <Separator />
                <Row label="Subtotal" value={fmt(breakdown.total)} />
                <Row
                  label="Platform fee (15%)"
                  value={fmt(breakdown.platformFee)}
                  muted
                />
                <Row label="Host payout (85%)" value={fmt(breakdown.hostPayout)} muted />
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total due</span>
                  <span className="text-2xl font-bold tracking-tight">
                    {fmt(breakdown.total)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Booking ID · <span className="font-mono">{bookingId}</span>
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/50 p-4 text-xs text-muted-foreground backdrop-blur">
              <p className="mb-1 font-medium text-foreground">Test mode</p>
              Use card{" "}
              <span className="font-mono text-foreground">4242 4242 4242 4242</span>, any
              future expiry and any CVC.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ---------- Pieces ----------
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={muted ? "text-muted-foreground" : "font-medium"}>{value}</span>
    </div>
  );
}

function SuccessPanel({
  receipt,
  amount,
  title,
  location,
  mapsUrl,
  onDone,
}: {
  receipt: { receiptUrl: string; bookingRef: string; paidAt: string };
  amount: number;
  title: string;
  location: string;
  mapsUrl: string;
  onDone: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
    >
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary"
        >
          <CheckCircle2 className="h-9 w-9" />
        </motion.div>
        <h2 className="text-2xl font-bold tracking-tight">Payment successful</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A receipt has been sent to your email.
        </p>
      </div>

      <div className="mt-6 space-y-3 rounded-xl border border-border/60 bg-background/40 p-4">
        <Row label="Booking reference" value={receipt.bookingRef} />
        <Row label="Amount paid" value={fmt(amount)} />
        <Row
          label="Paid at"
          value={new Date(receipt.paidAt).toLocaleString()}
          muted
        />
        <Separator />
        <div className="text-sm">
          <p className="font-medium">{title}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {location}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <Button asChild variant="outline" className="gap-2">
          <a href={mapsUrl} target="_blank" rel="noreferrer">
            <MapPin className="h-4 w-4" /> View directions
          </a>
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <a href={receipt.receiptUrl} target="_blank" rel="noreferrer">
            <Receipt className="h-4 w-4" /> View receipt
          </a>
        </Button>
      </div>

      <Button onClick={onDone} className="mt-3 w-full gap-2" size="lg">
        Go to my bookings <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}
