import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, DollarSign, Flag, Layers, ShieldCheck, Star, Users } from "lucide-react";
import { CATEGORY_META, Category, LISTINGS } from "@/lib/kairos-data";
import { useApp } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

const MOCK_USERS = [
  { id: "u1", name: "Alex Mwangi", email: "alex@kairos.ai", role: "client", status: "active", joined: "Mar 2024" },
  { id: "u2", name: "Mara Wild Co.", email: "host@marawild.com", role: "agent", status: "active", joined: "Apr 2024" },
  { id: "u3", name: "Chef Atlas", email: "chef@atlas.io", role: "agent", status: "active", joined: "May 2024" },
  { id: "u4", name: "Joan M.", email: "joan@example.com", role: "client", status: "active", joined: "Jun 2024" },
  { id: "u5", name: "Noir Hosts", email: "ops@noir.club", role: "agent", status: "pending", joined: "Sep 2024" },
];

const Stat = ({ label, value, icon: Icon, hint }: { label: string; value: string; icon: any; hint?: string }) => (
  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-5">
    <div className="flex items-center justify-between">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <Icon className="w-4 h-4 text-accent" />
    </div>
    <div className="font-display text-3xl mt-2">{value}</div>
    {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
  </motion.div>
);

const BarRow = ({ label, value, max }: { label: string; value: number; max: number }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span>{label}</span><span className="tabular-nums text-muted-foreground">{value}</span>
    </div>
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="h-full bg-gradient-gold"
      />
    </div>
  </div>
);

const Admin = () => {
  const { bookings } = useApp();
  const [tab, setTab] = useState("overview");
  const [statuses, setStatuses] = useState<Record<string, "active" | "pending" | "flagged">>(
    Object.fromEntries(LISTINGS.map((l) => [l.id, l.id === "l3" ? "flagged" : l.id === "s3" ? "pending" : "active"])) as any
  );

  const totalRevenue = bookings.reduce((s, b) => s + b.total, 0) + 24580;
  const pending = Object.values(statuses).filter((s) => s === "pending").length;
  const flagged = Object.values(statuses).filter((s) => s === "flagged").length;

  const byCategory = (Object.keys(CATEGORY_META) as Category[]).map((c) => ({
    cat: c,
    count: LISTINGS.filter((l) => l.category === c).length,
    revenue: LISTINGS.filter((l) => l.category === c).reduce((s, l) => s + l.price * l.reviewCount * 0.04, 0),
  }));
  const maxRev = Math.max(...byCategory.map((b) => b.revenue));
  const monthly = [12, 18, 22, 31, 28, 35, 42, 38, 47, 52, 49, 58];
  const maxM = Math.max(...monthly);

  const setStatus = (id: string, s: "active" | "pending" | "flagged") => {
    setStatuses((m) => ({ ...m, [id]: s }));
    toast.success(`Listing ${s === "active" ? "approved" : s}`);
  };

  return (
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-accent">
            <ShieldCheck className="w-3 h-3" /> Admin console
          </div>
          <h1 className="font-display text-3xl md:text-4xl mt-1">Operations</h1>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList className="bg-muted rounded-xl p-1 h-auto flex-wrap">
          {["overview", "listings", "bookings", "users", "payments", "reviews", "categories", "analytics"].map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-lg capitalize text-xs md:text-sm px-3 py-2">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Stat label="Total users" value="1,284" icon={Users} hint="+12% MoM" />
            <Stat label="Listings" value={String(LISTINGS.length)} icon={Layers} />
            <Stat label="Bookings" value={String(bookings.length + 312)} icon={CheckCircle2} hint="+8% WoW" />
            <Stat label="Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} hint="lifetime" />
            <Stat label="Pending" value={String(pending)} icon={Flag} />
            <Stat label="Flagged" value={String(flagged)} icon={Flag} />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg">Bookings by month</h3>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">2024</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthly.map((v, i) => ({ m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i], bookings: v }))}>
                    <defs>
                      <linearGradient id="grBk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                    <Area type="monotone" dataKey="bookings" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#grBk)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display text-lg mb-4">Revenue by category</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCategory.map((b) => ({ name: CATEGORY_META[b.cat].label, revenue: Math.round(b.revenue) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display text-lg mb-3">Recent activity</h3>
            <div className="space-y-2 text-sm">
              {[
                { t: "New booking", d: "Maasai Mara Golden Hour Safari · $480" },
                { t: "Listing pending", d: "Signature Event Planner submitted by Maison Events" },
                { t: "Flagged review", d: "VIP Nightlife Access — review reported" },
                { t: "User signup", d: "joan@example.com joined as client" },
              ].map((a, i) => (
                <div key={i} className="flex justify-between border-b border-border last:border-0 py-2">
                  <span>{a.t}</span><span className="text-muted-foreground truncate">{a.d}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="listings" className="mt-6">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {LISTINGS.map((l) => {
                  const s = statuses[l.id];
                  return (
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
                      <TableCell className="capitalize">{CATEGORY_META[l.category].label}</TableCell>
                      <TableCell>${l.price}</TableCell>
                      <TableCell>★ {l.rating}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "text-[10px] uppercase tracking-wider px-2 py-1 rounded-full",
                          s === "active" ? "bg-accent-soft text-accent-foreground" :
                          s === "pending" ? "bg-muted text-muted-foreground" :
                          "bg-destructive/10 text-destructive"
                        )}>{s}</span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {s !== "active" && <Button size="sm" variant="ghost" onClick={() => setStatus(l.id, "active")}>Approve</Button>}
                        {s !== "flagged" && <Button size="sm" variant="ghost" onClick={() => setStatus(l.id, "flagged")} className="text-destructive">Flag</Button>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Booking</TableHead><TableHead>Customer</TableHead><TableHead>Provider</TableHead>
                <TableHead>Total</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No live bookings yet.</TableCell></TableRow>
                ) : bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{b.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">{b.id}</div>
                    </TableCell>
                    <TableCell>{b.customer}</TableCell>
                    <TableCell>{b.provider}</TableCell>
                    <TableCell>${b.total.toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{b.date}</TableCell>
                    <TableCell>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent-soft text-accent-foreground">{b.status}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader><TableRow>
                <TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {MOCK_USERS.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </TableCell>
                    <TableCell className="capitalize">{u.role}</TableCell>
                    <TableCell>
                      <span className={cn("text-[10px] uppercase tracking-wider px-2 py-1 rounded-full",
                        u.status === "active" ? "bg-accent-soft text-accent-foreground" : "bg-muted text-muted-foreground"
                      )}>{u.status}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.joined}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <div className="rounded-2xl border border-border bg-card p-5 text-sm">
            <div className="grid grid-cols-3 gap-4">
              <Stat label="Gross volume" value={`$${(totalRevenue * 1.12).toLocaleString()}`} icon={DollarSign} />
              <Stat label="Net revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} />
              <Stat label="Refunds" value="$420" icon={DollarSign} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6 space-y-3">
          {LISTINGS.flatMap((l) => l.reviews.map((r) => ({ ...r, listing: l.title }))).slice(0, 6).map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{r.author}</div>
                  <div className="text-xs text-muted-foreground">on {r.listing} · {r.date}</div>
                </div>
                <div className="flex items-center gap-1 text-sm"><Star className="w-3.5 h-3.5 fill-accent text-accent" /> {r.rating}</div>
              </div>
              <p className="text-sm mt-2 text-muted-foreground">{r.text}</p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="categories" className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(CATEGORY_META) as Category[]).map((c) => (
            <div key={c} className="rounded-2xl border border-border bg-card p-5">
              <div className="font-display text-lg">{CATEGORY_META[c].label}</div>
              <div className="text-xs text-muted-foreground">{CATEGORY_META[c].tagline}</div>
              <div className="mt-3 text-3xl font-display">{LISTINGS.filter((l) => l.category === c).length}</div>
              <div className="text-xs text-muted-foreground">active listings</div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display text-lg mb-4">Top categories</h3>
            <div className="space-y-3">
              {byCategory.sort((a, b) => b.revenue - a.revenue).map((b) => (
                <BarRow key={b.cat} label={CATEGORY_META[b.cat].label} value={Math.round(b.revenue)} max={Math.round(maxRev)} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display text-lg mb-4">Top rated</h3>
            <div className="space-y-2 text-sm">
              {[...LISTINGS].sort((a, b) => b.rating - a.rating).slice(0, 5).map((l) => (
                <div key={l.id} className="flex items-center justify-between border-b border-border last:border-0 py-2">
                  <span>{l.title}</span>
                  <span className="text-muted-foreground">★ {l.rating} · {l.reviewCount}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
