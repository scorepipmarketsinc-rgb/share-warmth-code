import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, CreditCard, Heart, MessageSquare, Receipt as ReceiptIcon, TrendingUp, User, Wallet } from "lucide-react";
import { useApp } from "@/lib/store";
import { LISTINGS, getListing } from "@/lib/kairos-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/kairos/ListingCard";
import { ReceiptCard } from "@/components/kairos/ReceiptCard";
import { cn } from "@/lib/utils";

const fmt = (n: number) => `$${n.toLocaleString()}`;

const Stat = ({ label, value, icon: Icon, accent }: { label: string; value: string; icon: any; accent?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "rounded-2xl p-5 border",
      accent ? "bg-gradient-ink text-primary-foreground border-transparent" : "bg-card border-border"
    )}
  >
    <div className="flex items-center justify-between">
      <div className="text-[10px] uppercase tracking-wider opacity-70">{label}</div>
      <Icon className={cn("w-4 h-4", accent ? "text-accent" : "text-muted-foreground")} />
    </div>
    <div className="font-display text-3xl mt-2">{value}</div>
  </motion.div>
);

const Dashboard = () => {
  const { wallet, addFunds, bookings, favorites, transactions, conversations } = useApp();
  const [tab, setTab] = useState("overview");
  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const recommended = LISTINGS.slice(0, 3);

  return (
    <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Account</div>
          <h1 className="font-display text-3xl md:text-4xl mt-1">Welcome back, Alex</h1>
        </div>
        <Link to="/discover">
          <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90">
            Browse experiences
          </Button>
        </Link>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList className="bg-muted rounded-xl p-1 h-auto flex-wrap">
          {["overview", "bookings", "saved", "wallet", "receipts", "messages", "profile"].map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-lg capitalize text-xs md:text-sm px-3 py-2">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Wallet" value={fmt(wallet)} icon={Wallet} accent />
            <Stat label="Bookings" value={String(bookings.length)} icon={Calendar} />
            <Stat label="Upcoming" value={String(upcoming.length)} icon={TrendingUp} />
            <Stat label="Saved" value={String(favorites.length)} icon={Heart} />
          </div>
          <section>
            <h2 className="font-display text-xl mb-3">Recent bookings</h2>
            {bookings.length === 0 ? (
              <Empty msg="No bookings yet — explore experiences in Discover." />
            ) : (
              <div className="space-y-3">{bookings.slice(0, 3).map((b) => <BookingRow key={b.id} b={b} />)}</div>
            )}
          </section>
          <section>
            <h2 className="font-display text-xl mb-3">Recommended for you</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommended.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          </section>
        </TabsContent>

        {/* Bookings */}
        <TabsContent value="bookings" className="mt-6 space-y-3">
          {bookings.length === 0 ? <Empty msg="Your bookings will appear here." /> :
            bookings.map((b) => <BookingRow key={b.id} b={b} />)
          }
        </TabsContent>

        {/* Saved */}
        <TabsContent value="saved" className="mt-6">
          {favorites.length === 0 ? (
            <Empty msg="Tap the heart on any listing to save it for later." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {favorites.map((id) => {
                const l = getListing(id);
                return l ? <ListingCard key={id} listing={l} /> : null;
              })}
            </div>
          )}
        </TabsContent>

        {/* Wallet */}
        <TabsContent value="wallet" className="mt-6 space-y-6">
          <div className="rounded-3xl bg-gradient-ink text-primary-foreground p-8 flex items-center justify-between">
            <div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-accent">Wallet balance</div>
              <div className="font-display text-5xl mt-2">{fmt(wallet)}</div>
              <div className="text-xs text-primary-foreground/60 mt-1">Available to spend instantly</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => addFunds(500)} variant="outline" className="rounded-xl bg-background text-foreground border-0 hover:bg-background/90">+ $500</Button>
              <Button onClick={() => addFunds(1000)} className="rounded-xl bg-gradient-gold text-accent-foreground hover:opacity-90 shadow-gold">+ $1,000</Button>
            </div>
          </div>
          <section>
            <h2 className="font-display text-xl mb-3">Recent transactions</h2>
            <div className="rounded-2xl border border-border bg-card divide-y divide-border">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center",
                      t.amount < 0 ? "bg-destructive/10 text-destructive" : "bg-accent-soft text-accent-foreground")}>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{t.label}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {t.type} · {new Date(t.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={cn("font-display text-lg tabular-nums", t.amount < 0 ? "text-destructive" : "")}>
                    {t.amount < 0 ? "-" : "+"}{fmt(Math.abs(t.amount))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </TabsContent>

        {/* Receipts */}
        <TabsContent value="receipts" className="mt-6 space-y-4">
          {bookings.length === 0 ? <Empty msg="Receipts appear here after each booking." /> :
            <div className="grid md:grid-cols-2 gap-4 print-receipts">
              {bookings.map((b) => <ReceiptCard key={b.id} booking={b} />)}
            </div>
          }
        </TabsContent>

        {/* Messages */}
        <TabsContent value="messages" className="mt-6 space-y-2">
          {conversations.map((c) => (
            <Link key={c.id} to="/" className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 hover:shadow-soft transition-shadow">
              <MessageSquare className="w-4 h-4 mt-1 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{c.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {c.messages[c.messages.length - 1]?.content}
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground">
                {new Date(c.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </div>
            </Link>
          ))}
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile" className="mt-6 max-w-xl">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center">
                <User className="w-7 h-7 text-accent-foreground" />
              </div>
              <div>
                <div className="font-display text-xl">Alex Mwangi</div>
                <div className="text-sm text-muted-foreground">alex@kairos.ai</div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <Field label="Currency" value="USD" />
              <Field label="Language" value="English" />
              <Field label="Timezone" value="EAT" />
              <Field label="Member since" value="2024" />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-muted/40 px-3 py-2">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    <div>{value}</div>
  </div>
);

const Empty = ({ msg }: { msg: string }) => (
  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
    <ReceiptIcon className="w-5 h-5 mx-auto mb-2 text-accent" />
    {msg}
  </div>
);

const BookingRow = ({ b }: { b: any }) => (
  <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-12 h-12 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
        <Calendar className="w-5 h-5 text-accent" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{b.title}</div>
        <div className="text-xs text-muted-foreground truncate">{b.location} · {b.date}</div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <span className={cn(
        "text-[10px] uppercase tracking-wider px-2 py-1 rounded-full",
        b.status === "upcoming" ? "bg-accent-soft text-accent-foreground" : "bg-muted text-muted-foreground"
      )}>{b.status}</span>
      <span className="font-display text-lg tabular-nums">${b.total.toLocaleString()}</span>
      <Link to={`/listing/${b.listingId}`}>
        <Button size="sm" variant="ghost" className="rounded-xl">View</Button>
      </Link>
    </div>
  </div>
);

export default Dashboard;
