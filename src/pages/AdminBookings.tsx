import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Receipt, Filter, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_META, Category } from "@/lib/kairos-data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

type Status = "paid" | "pending" | "refunded" | "failed";
type Payment = "card" | "wallet" | "mpesa" | "transfer";

const MOCK = [
  { ref: "KAI-1A2B3C", user: "Alex Mwangi", service: "The Ivory Skyline Suite", type: "hotels" as Category, amount: 640, status: "paid" as Status, payment: "card" as Payment, date: "Apr 28, 2026" },
  { ref: "KAI-9X7Y2Z", user: "Joan Mwende", service: "Maasai Mara Golden Hour Safari", type: "tours" as Category, amount: 480, status: "paid" as Status, payment: "mpesa" as Payment, date: "Apr 26, 2026" },
  { ref: "KAI-7H3K1L", user: "Mara Wild Co.", service: "Linen & Oak Boutique Stay", type: "hotels" as Category, amount: 185, status: "pending" as Status, payment: "transfer" as Payment, date: "Apr 25, 2026" },
  { ref: "KAI-5T8R0Q", user: "Chef Atlas", service: "VIP Nightlife Access", type: "lifestyle" as Category, amount: 220, status: "refunded" as Status, payment: "wallet" as Payment, date: "Apr 22, 2026" },
  { ref: "KAI-2P4M6N", user: "Noir Hosts", service: "Signature Event Planner", type: "services" as Category, amount: 1200, status: "paid" as Status, payment: "card" as Payment, date: "Apr 20, 2026" },
  { ref: "KAI-8B6V4W", user: "Priya Shah", service: "Nairobi by Night City Tour", type: "tours" as Category, amount: 95, status: "failed" as Status, payment: "card" as Payment, date: "Apr 18, 2026" },
  { ref: "KAI-3Z2X1A", user: "Daniel K.", service: "Skyline Loft Apartment", type: "hotels" as Category, amount: 720, status: "paid" as Status, payment: "wallet" as Payment, date: "Apr 16, 2026" },
];

const StatusBadge = ({ s }: { s: Status }) => (
  <span className={cn("text-[10px] uppercase tracking-wider px-2 py-1 rounded-full",
    s === "paid" && "bg-accent-soft text-accent-foreground",
    s === "pending" && "bg-muted text-muted-foreground",
    s === "refunded" && "bg-foreground/10 text-foreground",
    s === "failed" && "bg-destructive/10 text-destructive",
  )}>{s}</span>
);

export default function AdminBookings() {
  const { bookings } = useApp();
  const [status, setStatus] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [q, setQ] = useState("");

  const all = useMemo(() => {
    const live = bookings.map((b) => ({
      ref: b.id, user: b.customer, service: b.title, type: b.category,
      amount: b.total, status: "paid" as Status, payment: "wallet" as Payment, date: b.date,
    }));
    return [...live, ...MOCK];
  }, [bookings]);

  const filtered = all.filter((b) =>
    (status === "all" || b.status === status) &&
    (type === "all" || b.type === type) &&
    (q === "" || b.ref.toLowerCase().includes(q.toLowerCase()) || b.user.toLowerCase().includes(q.toLowerCase()) || b.service.toLowerCase().includes(q.toLowerCase()))
  );

  const exportCsv = () => {
    const rows = [["Ref", "User", "Service", "Type", "Amount", "Status", "Payment", "Date"],
      ...filtered.map((b) => [b.ref, b.user, b.service, b.type, b.amount, b.status, b.payment, b.date])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "bookings.csv"; a.click();
  };

  return (
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-accent">
            <Receipt className="w-3 h-3" /> Admin · Bookings
          </div>
          <h1 className="font-display text-3xl md:text-4xl mt-1">All bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} of {all.length} transactions</p>
        </div>
        <Button variant="outline" onClick={exportCsv} className="rounded-xl"><Download className="w-4 h-4 mr-2" />Export CSV</Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl border border-border bg-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ref, user or service" className="pl-9 rounded-xl" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px] rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[140px] rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {(Object.keys(CATEGORY_META) as Category[]).map((c) => (
                <SelectItem key={c} value={c}>{CATEGORY_META[c].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <div className="mt-4 rounded-2xl border border-border bg-card overflow-hidden">
        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border">
          {filtered.map((b) => (
            <div key={b.ref} className="p-4 space-y-1">
              <div className="flex justify-between items-start gap-2">
                <div className="font-mono text-xs text-muted-foreground">{b.ref}</div>
                <StatusBadge s={b.status} />
              </div>
              <div className="font-medium text-sm">{b.service}</div>
              <div className="text-xs text-muted-foreground">{b.user} · {CATEGORY_META[b.type].label}</div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="capitalize text-muted-foreground">{b.payment}</span>
                <span className="font-medium tabular-nums">${b.amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Ref</TableHead><TableHead>User</TableHead><TableHead>Service</TableHead>
              <TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Payment</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12">No bookings match the filters.</TableCell></TableRow>
              ) : filtered.map((b) => (
                <TableRow key={b.ref}>
                  <TableCell className="font-mono text-xs">{b.ref}</TableCell>
                  <TableCell className="text-sm">{b.user}</TableCell>
                  <TableCell className="text-sm">{b.service}</TableCell>
                  <TableCell className="text-sm capitalize">{CATEGORY_META[b.type].label}</TableCell>
                  <TableCell className="tabular-nums">${b.amount.toLocaleString()}</TableCell>
                  <TableCell><StatusBadge s={b.status} /></TableCell>
                  <TableCell className="capitalize text-sm">{b.payment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
