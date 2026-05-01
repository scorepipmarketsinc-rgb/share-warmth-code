import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell, Calendar, CheckCircle2, Heart, MapPin, Receipt as ReceiptIcon,
  Sparkles, Star, TrendingUp, User, Wallet, Mail, Globe, Clock, BadgeCheck,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { LISTINGS, getListing, MOCK_USER } from "@/lib/kairos-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ListingCard } from "@/components/kairos/ListingCard";
import { cn } from "@/lib/utils";

const fmt = (n: number) => `$${n.toLocaleString()}`;

/* ────── Mock notifications (GET /api/notifications) ────── */
type Notif = {
  id: string;
  type: "booking" | "message" | "promo" | "system";
  title: string;
  body: string;
  time: string;
  unread?: boolean;
};

const MOCK_NOTIFS: Notif[] = [
  { id: "n1", type: "booking", title: "Booking confirmed", body: "Your stay at The Ivory Skyline Suite is locked in.", time: "2h ago", unread: true },
  { id: "n2", type: "message", title: "Kairos found 3 new picks", body: "Based on your Diani search — view recommendations.", time: "5h ago", unread: true },
  { id: "n3", type: "promo", title: "Weekend offer", body: "10% off lifestyle experiences this Friday.", time: "Yesterday" },
  { id: "n4", type: "system", title: "Welcome to Kairos", body: "Your account is ready. Add funds to start booking.", time: "2 days ago" },
];

const Dashboard = () => {
  const { wallet, bookings, favorites, transactions } = useApp();
  const [tab, setTab] = useState("overview");
  const upcoming = useMemo(() => bookings.filter((b) => b.status === "upcoming"), [bookings]);
  const recommended = LISTINGS.slice(0, 3);
  const savedListings = favorites.map(getListing).filter(Boolean) as ReturnType<typeof getListing>[];

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-6xl mx-auto">
      {/* Hero header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">My account</div>
          <h1 className="font-display text-3xl md:text-4xl mt-1">
            Welcome back, <span className="text-gradient-gold">Alex</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Here's everything happening in your Kairos space.</p>
        </div>
        <Link to="/discover">
          <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90">
            Browse experiences
          </Button>
        </Link>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList className="bg-muted rounded-xl p-1 h-auto flex-wrap gap-0.5 w-full md:w-auto">
          {[
            { id: "overview", label: "Overview" },
            { id: "bookings", label: "Bookings" },
            { id: "saved", label: "Saved" },
            { id: "notifications", label: "Notifications" },
            { id: "profile", label: "Profile" },
          ].map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="rounded-lg text-xs md:text-sm px-3 py-2 flex-1 md:flex-none">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ─────────── OVERVIEW ─────────── */}
        <TabsContent value="overview" className="mt-6 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Stat label="Wallet" value={fmt(wallet)} icon={Wallet} accent />
            <Stat label="Upcoming" value={String(upcoming.length)} icon={TrendingUp} />
            <Stat label="Total bookings" value={String(bookings.length)} icon={Calendar} />
            <Stat label="Saved" value={String(favorites.length)} icon={Heart} />
          </div>

          {/* Upcoming bookings */}
          <section>
            <SectionHead title="Upcoming bookings" hint={`${upcoming.length} scheduled`} />
            {upcoming.length === 0 ? (
              <Empty
                icon={Calendar}
                title="No bookings yet"
                msg="Your upcoming reservations will appear here."
                cta={<Link to="/kairos"><Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90 mt-3">Plan with Kairos AI</Button></Link>}
              />
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {upcoming.slice(0, 4).map((b) => <BookingCard key={b.id} b={b} />)}
              </div>
            )}
          </section>

          {/* Saved listings preview */}
          <section>
            <SectionHead title="Saved listings" hint={`${savedListings.length} items`} action={
              savedListings.length > 0 && (
                <button onClick={() => setTab("saved")} className="text-xs text-muted-foreground hover:text-foreground">View all →</button>
              )
            } />
            {savedListings.length === 0 ? (
              <Empty icon={Heart} title="Nothing saved yet" msg="Tap the heart on any listing to save it for later." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedListings.slice(0, 3).map((l) => l && <ListingCard key={l.id} listing={l} />)}
              </div>
            )}
          </section>

          {/* Recent activity */}
          <section>
            <SectionHead title="Recent activity" hint="Last 7 days" />
            <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
              {transactions.length === 0 && bookings.length === 0 ? (
                <Empty icon={Sparkles} title="No activity yet" msg="Start a chat with Kairos to see activity here." inline />
              ) : (
                <>
                  {bookings.slice(0, 3).map((b) => (
                    <ActivityRow
                      key={`b-${b.id}`}
                      icon={CheckCircle2}
                      title={`Booked ${b.title}`}
                      sub={`${b.location} · ${b.date}`}
                      right={fmt(b.total)}
                      tone="success"
                    />
                  ))}
                  {transactions.slice(0, 3).map((t) => (
                    <ActivityRow
                      key={`t-${t.id}`}
                      icon={Wallet}
                      title={t.label}
                      sub={`${t.type} · ${new Date(t.date).toLocaleDateString()}`}
                      right={`${t.amount < 0 ? "−" : "+"}${fmt(Math.abs(t.amount))}`}
                      tone={t.amount < 0 ? "neutral" : "success"}
                    />
                  ))}
                </>
              )}
            </div>
          </section>

          {/* Recommended */}
          <section>
            <SectionHead title="Recommended for you" hint="Curated by Kairos" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommended.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          </section>
        </TabsContent>

        {/* ─────────── BOOKINGS ─────────── */}
        <TabsContent value="bookings" className="mt-6 space-y-4">
          {bookings.length === 0 ? (
            <Empty
              icon={Calendar}
              title="No bookings yet"
              msg="Book your first experience and it'll show up here."
              cta={<Link to="/kairos"><Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90 mt-3">Start with Kairos AI</Button></Link>}
            />
          ) : (
            <>
              {/* Mobile: cards */}
              <div className="grid gap-3 md:hidden">
                {bookings.map((b) => <BookingCard key={b.id} b={b} />)}
              </div>
              {/* Desktop: table */}
              <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-mono text-xs">{b.id}</TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{b.title}</div>
                          <div className="text-xs text-muted-foreground">{b.location}</div>
                        </TableCell>
                        <TableCell className="text-sm">{b.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            "capitalize",
                            b.status === "upcoming" && "border-accent text-accent-foreground bg-accent-soft",
                          )}>
                            {b.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">{fmt(b.total)}</TableCell>
                        <TableCell className="text-right">
                          <Link to={`/listing/${b.listingId}`}>
                            <Button size="sm" variant="ghost" className="rounded-lg">View</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </TabsContent>

        {/* ─────────── SAVED PROPERTIES ─────────── */}
        <TabsContent value="saved" className="mt-6">
          {savedListings.length === 0 ? (
            <Empty
              icon={Heart}
              title="No saved properties yet"
              msg="Tap the heart on any listing to save it for later."
              cta={<Link to="/discover"><Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90 mt-3">Discover listings</Button></Link>}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedListings.map((l) => l && <ListingCard key={l.id} listing={l} showCategory />)}
            </div>
          )}
        </TabsContent>

        {/* ─────────── NOTIFICATIONS ─────────── */}
        <TabsContent value="notifications" className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <SectionHead title="Notifications" hint={`${MOCK_NOTIFS.filter(n => n.unread).length} unread`} compact />
            <Button variant="ghost" size="sm" className="rounded-lg text-xs">Mark all read</Button>
          </div>
          {MOCK_NOTIFS.length === 0 ? (
            <Empty icon={Bell} title="You're all caught up" msg="No notifications right now." />
          ) : (
            <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
              {MOCK_NOTIFS.map((n) => <NotificationRow key={n.id} n={n} />)}
            </div>
          )}
        </TabsContent>

        {/* ─────────── PROFILE ─────────── */}
        <TabsContent value="profile" className="mt-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Identity card */}
            <div className="md:col-span-1 rounded-2xl border border-border bg-card p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center mx-auto shadow-gold">
                <User className="w-9 h-9 text-accent-foreground" />
              </div>
              <div className="font-display text-xl mt-4">{MOCK_USER.name}</div>
              <div className="text-sm text-muted-foreground">{MOCK_USER.email}</div>
              <div className="mt-3 inline-flex items-center gap-1 text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full bg-accent-soft text-accent-foreground">
                <BadgeCheck className="w-3 h-3" /> Verified member
              </div>
              <Button variant="outline" className="rounded-xl mt-5 w-full">Edit profile</Button>
            </div>
            {/* Details */}
            <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6">
              <div className="font-display text-lg mb-4">Profile details</div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field icon={User} label="Full name" value={MOCK_USER.name} />
                <Field icon={Mail} label="Email" value={MOCK_USER.email} />
                <Field icon={Globe} label="Language" value="English" />
                <Field icon={Globe} label="Currency" value="USD" />
                <Field icon={Clock} label="Timezone" value="Africa / Nairobi" />
                <Field icon={Calendar} label="Member since" value="January 2024" />
              </div>

              <div className="font-display text-lg mt-8 mb-3">Preferences</div>
              <div className="grid sm:grid-cols-3 gap-3">
                <PrefCard label="Hotels" active />
                <PrefCard label="Tours" active />
                <PrefCard label="Lifestyle" />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* ────── Small components ────── */

const Stat = ({
  label, value, icon: Icon, accent,
}: { label: string; value: string; icon: any; accent?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "rounded-2xl p-4 md:p-5 border",
      accent ? "bg-gradient-ink text-primary-foreground border-transparent" : "bg-card border-border"
    )}
  >
    <div className="flex items-center justify-between">
      <div className="text-[10px] uppercase tracking-wider opacity-70">{label}</div>
      <Icon className={cn("w-4 h-4", accent ? "text-accent" : "text-muted-foreground")} />
    </div>
    <div className="font-display text-2xl md:text-3xl mt-2">{value}</div>
  </motion.div>
);

const SectionHead = ({
  title, hint, action, compact,
}: { title: string; hint?: string; action?: React.ReactNode; compact?: boolean }) => (
  <div className={cn("flex items-end justify-between", compact ? "mb-0" : "mb-3")}>
    <div>
      <h2 className="font-display text-lg md:text-xl">{title}</h2>
      {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
    {action}
  </div>
);

const Empty = ({
  icon: Icon, title, msg, cta, inline,
}: { icon: any; title: string; msg: string; cta?: React.ReactNode; inline?: boolean }) => (
  <div className={cn(
    "text-center text-sm text-muted-foreground",
    inline ? "p-8" : "rounded-2xl border border-dashed border-border p-10 bg-card/40"
  )}>
    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
      <Icon className="w-4 h-4 text-accent" />
    </div>
    <div className="font-display text-base text-foreground">{title}</div>
    <div className="mt-1">{msg}</div>
    {cta}
  </div>
);

const BookingCard = ({ b }: { b: any }) => {
  const listing = getListing(b.listingId);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card overflow-hidden flex shadow-soft hover:shadow-elevated transition-shadow"
    >
      {listing && (
        <div className="w-24 h-auto shrink-0 bg-muted">
          <img src={listing.image} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1 p-3 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{b.title}</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{b.location}</span>
            </div>
          </div>
          <Badge variant="outline" className={cn(
            "capitalize text-[10px] shrink-0",
            b.status === "upcoming" && "border-accent text-accent-foreground bg-accent-soft",
          )}>
            {b.status}
          </Badge>
        </div>
        <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {b.date}
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-base tabular-nums">${b.total.toLocaleString()}</span>
          <Link to={`/listing/${b.listingId}`}>
            <Button size="sm" variant="ghost" className="h-7 rounded-lg text-xs">View</Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const ActivityRow = ({
  icon: Icon, title, sub, right, tone,
}: { icon: any; title: string; sub: string; right: string; tone: "success" | "neutral" }) => (
  <div className="flex items-center justify-between p-4">
    <div className="flex items-center gap-3 min-w-0">
      <div className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
        tone === "success" ? "bg-accent-soft text-accent-foreground" : "bg-muted text-muted-foreground"
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{title}</div>
        <div className="text-xs text-muted-foreground truncate">{sub}</div>
      </div>
    </div>
    <div className="font-medium text-sm tabular-nums shrink-0 ml-3">{right}</div>
  </div>
);

const NotificationRow = ({ n }: { n: Notif }) => {
  const meta = {
    booking: { icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
    message: { icon: Sparkles, color: "text-accent bg-accent-soft" },
    promo: { icon: Star, color: "text-amber-500 bg-amber-500/10" },
    system: { icon: Bell, color: "text-muted-foreground bg-muted" },
  }[n.type];
  const Icon = meta.icon;
  return (
    <div className={cn("flex items-start gap-3 p-4 transition-colors hover:bg-muted/50", n.unread && "bg-accent-soft/30")}>
      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", meta.color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium truncate">{n.title}</div>
          {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>
      </div>
      <div className="text-[10px] text-muted-foreground shrink-0">{n.time}</div>
    </div>
  );
};

const Field = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-muted/30 p-3 flex items-start gap-3">
    <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm truncate">{value}</div>
    </div>
  </div>
);

const PrefCard = ({ label, active }: { label: string; active?: boolean }) => (
  <div className={cn(
    "rounded-xl border p-3 text-center text-sm transition-colors cursor-pointer",
    active ? "border-accent bg-accent-soft text-accent-foreground" : "border-border bg-card hover:bg-muted"
  )}>
    {label}
  </div>
);

export default Dashboard;
