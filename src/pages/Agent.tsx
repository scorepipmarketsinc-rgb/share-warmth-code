import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  Hotel,
  Mountain,
  Sparkles,
  Plane,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Eye,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LISTINGS, CATEGORY_META } from "@/lib/kairos-data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts";

type ListingStatus = "pending" | "approved" | "rejected";

const CREATE_TYPES = [
  { key: "property", label: "Property", icon: Building2, gradient: "from-amber-400 to-orange-500" },
  { key: "hotel", label: "Hotel", icon: Hotel, gradient: "from-rose-400 to-pink-600" },
  { key: "experience", label: "Experience", icon: Mountain, gradient: "from-emerald-400 to-teal-600" },
  { key: "lifestyle", label: "Lifestyle", icon: Sparkles, gradient: "from-violet-400 to-fuchsia-600" },
  { key: "travel", label: "Travel Package", icon: Plane, gradient: "from-sky-400 to-indigo-600" },
];

const Stat = ({
  label,
  value,
  icon: Icon,
  hint,
  accent,
}: {
  label: string;
  value: string;
  icon: any;
  hint?: string;
  accent?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "rounded-2xl border p-5",
      accent ? "border-transparent bg-gradient-gold text-accent-foreground" : "border-border bg-card"
    )}
  >
    <div className="flex items-center justify-between">
      <div className="text-[10px] uppercase tracking-wider opacity-70">{label}</div>
      <Icon className="w-4 h-4" />
    </div>
    <div className="font-display text-2xl md:text-3xl mt-2 tabular-nums">{value}</div>
    {hint && <div className="text-xs opacity-70 mt-1">{hint}</div>}
  </motion.div>
);

const StatusPill = ({ status }: { status: ListingStatus }) => {
  const map = {
    pending: { icon: Clock, cls: "bg-muted text-muted-foreground" },
    approved: { icon: CheckCircle2, cls: "bg-accent-soft text-accent-foreground" },
    rejected: { icon: XCircle, cls: "bg-destructive/10 text-destructive" },
  } as const;
  const { icon: Icon, cls } = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full", cls)}>
      <Icon className="w-3 h-3" /> {status}
    </span>
  );
};

const Agent = () => {
  const navigate = useNavigate();
  // mock "my listings" — slice subset
  const myListings = useMemo(
    () =>
      LISTINGS.slice(0, 6).map((l, i) => ({
        ...l,
        myStatus: (i === 0 ? "pending" : i === 5 ? "rejected" : "approved") as ListingStatus,
        views: 240 + i * 137,
      })),
    []
  );
  const [statuses, setStatuses] = useState<Record<string, ListingStatus>>(
    Object.fromEntries(myListings.map((l) => [l.id, l.myStatus])) as any
  );

  const { bookings: liveBookings } = useApp();

  // mock provider bookings + merge live ones
  const providerBookings = useMemo(() => {
    const seed = myListings.slice(0, 4).flatMap((l, i) =>
      Array.from({ length: 2 + (i % 3) }).map((_, j) => ({
        id: `BK-${l.id}-${j}`,
        listingId: l.id,
        title: l.title,
        customer: ["Joan M.", "Daniel K.", "Priya S.", "Tomas L.", "Eva H."][(i + j) % 5],
        nights: 1 + ((i + j) % 4),
        total: l.price * (1 + ((i + j) % 4)),
        date: new Date(Date.now() - (i * 3 + j) * 86400000).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: (j === 0 ? "upcoming" : "completed") as "upcoming" | "completed",
      }))
    );
    const live = liveBookings.map((b) => ({
      id: b.id,
      listingId: b.listingId,
      title: b.title,
      customer: b.customer,
      nights: b.nights,
      total: b.total,
      date: b.date,
      status: b.status === "cancelled" ? ("completed" as const) : ("upcoming" as const),
    }));
    return [...live, ...seed];
  }, [myListings, liveBookings]);

  const totals = useMemo(() => {
    const gross = providerBookings.reduce((s, b) => s + b.total, 0);
    const platformFee = gross * 0.15;
    const net = gross - platformFee;
    const upcoming = providerBookings.filter((b) => b.status === "upcoming").length;
    const monthly = Math.round(net / 6);
    return { gross, platformFee, net, upcoming, monthly };
  }, [providerBookings]);

  const monthlyTrend = [42, 58, 49, 71, 64, 88, 96, 82, 110, 124, 118, 142];
  const maxM = Math.max(...monthlyTrend);

  const setStatus = (id: string, s: ListingStatus) => {
    setStatuses((m) => ({ ...m, [id]: s }));
    toast.success(`Status updated → ${s}`);
  };

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-accent">
            <Briefcase className="w-3 h-3" /> Agent hub
          </div>
          <h1 className="font-display text-2xl md:text-4xl mt-1">Your business, at a glance</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage listings, track bookings, watch earnings grow.</p>
        </div>
        <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/90">
          <Link to="/list"><Plus className="w-4 h-4 mr-1" /> New listing</Link>
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6">
        <Stat label="Net earnings" value={`$${Math.round(totals.net).toLocaleString()}`} icon={DollarSign} hint="after 15% fee" accent />
        <Stat label="Gross bookings" value={`$${Math.round(totals.gross).toLocaleString()}`} icon={TrendingUp} hint={`${providerBookings.length} bookings`} />
        <Stat label="Upcoming" value={String(totals.upcoming)} icon={Calendar} hint="next 30 days" />
        <Stat label="Active listings" value={String(Object.values(statuses).filter((s) => s === "approved").length)} icon={Building2} hint={`${Object.values(statuses).filter((s) => s === "pending").length} pending`} />
      </div>

      {/* Create listing CTAs */}
      <div className="mt-8">
        <h2 className="font-display text-lg md:text-xl mb-3">Create a new listing</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {CREATE_TYPES.map((t, i) => (
            <motion.button
              key={t.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(`/list/${t.key}`)}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 text-left hover:border-accent transition-all"
            >
              <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-soft", t.gradient)}>
                <t.icon className="w-5 h-5" />
              </div>
              <div className="font-medium text-sm mt-3">{t.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">List a new {t.label.toLowerCase()}</div>
              <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-accent/0 group-hover:bg-accent/10 transition-all" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="listings" className="mt-8">
        <TabsList className="bg-muted rounded-xl p-1 h-auto flex-wrap">
          <TabsTrigger value="listings" className="rounded-lg text-xs md:text-sm px-3 py-2">My Listings</TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-lg text-xs md:text-sm px-3 py-2">Bookings</TabsTrigger>
          <TabsTrigger value="earnings" className="rounded-lg text-xs md:text-sm px-3 py-2">Earnings</TabsTrigger>
        </TabsList>

        {/* Listings */}
        <TabsContent value="listings" className="mt-5">
          {/* Mobile cards */}
          <div className="grid sm:grid-cols-2 gap-3 md:hidden">
            {myListings.map((l) => (
              <div key={l.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                <img src={l.image} alt={l.title} className="w-full aspect-[16/9] object-cover" />
                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{l.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{l.location}</div>
                    </div>
                    <StatusPill status={statuses[l.id]} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>${l.price} {CATEGORY_META[l.category].unit}</span>
                    <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" />{l.views}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myListings.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={l.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <div className="font-medium text-sm">{l.title}</div>
                          <div className="text-xs text-muted-foreground">{l.location}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-sm">{CATEGORY_META[l.category].label}</TableCell>
                    <TableCell>${l.price}</TableCell>
                    <TableCell className="text-muted-foreground">{l.views}</TableCell>
                    <TableCell><StatusPill status={statuses[l.id]} /></TableCell>
                    <TableCell className="text-right space-x-1">
                      {statuses[l.id] !== "approved" && (
                        <Button size="sm" variant="ghost" onClick={() => setStatus(l.id, "approved")}>Approve</Button>
                      )}
                      {statuses[l.id] !== "rejected" && (
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setStatus(l.id, "rejected")}>Reject</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Bookings */}
        <TabsContent value="bookings" className="mt-5">
          {providerBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <div className="font-display text-lg">No bookings yet</div>
              <div className="text-sm text-muted-foreground mt-1">When customers book your listings, they'll appear here.</div>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="space-y-2 md:hidden">
                {providerBookings.map((b) => (
                  <div key={b.id} className="rounded-2xl border border-border bg-card p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{b.title}</div>
                        <div className="text-xs text-muted-foreground">{b.customer} · {b.nights} night{b.nights > 1 ? "s" : ""}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-display tabular-nums">${b.total.toLocaleString()}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{b.status}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5">{b.date}</div>
                  </div>
                ))}
              </div>
              {/* Desktop */}
              <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Nights</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providerBookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>
                          <div className="font-medium text-sm">{b.title}</div>
                          <div className="text-xs text-muted-foreground font-mono">{b.id}</div>
                        </TableCell>
                        <TableCell>{b.customer}</TableCell>
                        <TableCell>{b.nights}</TableCell>
                        <TableCell className="text-xs">{b.date}</TableCell>
                        <TableCell>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent-soft text-accent-foreground">{b.status}</span>
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">${b.total.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </TabsContent>

        {/* Earnings */}
        <TabsContent value="earnings" className="mt-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Stat label="Lifetime gross" value={`$${Math.round(totals.gross).toLocaleString()}`} icon={DollarSign} />
            <Stat label="Platform fee 15%" value={`$${Math.round(totals.platformFee).toLocaleString()}`} icon={DollarSign} />
            <Stat label="Net payout 85%" value={`$${Math.round(totals.net).toLocaleString()}`} icon={DollarSign} accent />
            <Stat label="Avg / month" value={`$${totals.monthly.toLocaleString()}`} icon={TrendingUp} />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg">Earnings trend</h3>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Last 12 mo</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend.map((v, i) => ({ m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i], earnings: v * 100 }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Bar dataKey="earnings" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg">Bookings velocity</h3>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">12 weeks</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={Array.from({ length: 12 }).map((_, i) => ({ w: `W${i + 1}`, bookings: 4 + Math.round(Math.sin(i / 1.5) * 3 + i * 0.6) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="w" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                    <Line type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Agent;
