import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, Download, DollarSign, TrendingUp, Wallet, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LISTINGS } from "@/lib/kairos-data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Txn = {
  id: string;
  date: string;
  customer: string;
  listing: string;
  amount: number;
  fee: number;
  payout: number;
  method: "card" | "wallet" | "transfer";
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

const Finance = () => {
  const { bookings: liveBookings } = useApp();

  // Build mock paid transactions, then merge live bookings
  const transactions: Txn[] = useMemo(() => {
    const customers = ["Joan M.", "Daniel K.", "Priya S.", "Tomas L.", "Eva H.", "Hiroshi N.", "Lina P.", "Greta V.", "Ravi M.", "Maya K."];
    const seed = LISTINGS.flatMap((l, idx) =>
      Array.from({ length: 2 + (idx % 3) }).map((_, j) => {
        const nights = 1 + ((idx + j) % 4);
        const amount = l.price * nights;
        const date = new Date(Date.now() - (idx * 4 + j * 2) * 86400000);
        return {
          id: `TXN-${l.id}-${j}`,
          date: date.toISOString(),
          customer: customers[(idx + j) % customers.length],
          listing: l.title,
          amount,
          fee: amount * 0.15,
          payout: amount * 0.85,
          method: (j % 3 === 0 ? "card" : j % 3 === 1 ? "wallet" : "transfer") as Txn["method"],
        };
      })
    );
    const live: Txn[] = liveBookings.map((b) => ({
      id: b.id,
      date: new Date(b.createdAt).toISOString(),
      customer: b.customer,
      listing: b.title,
      amount: b.total,
      fee: b.total * 0.15,
      payout: b.total * 0.85,
      method: "card",
    }));
    return [...live, ...seed].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [liveBookings]);

  const totals = useMemo(() => {
    const total = transactions.reduce((s, t) => s + t.amount, 0);
    const fees = total * 0.15;
    const payouts = total * 0.85;

    const now = new Date();
    const monthlyMap = new Array(12).fill(0);
    transactions.forEach((t) => {
      const d = new Date(t.date);
      if (d.getFullYear() === now.getFullYear()) monthlyMap[d.getMonth()] += t.amount;
    });
    const thisMonth = monthlyMap[now.getMonth()];
    return { total, fees, payouts, monthlyMap, thisMonth };
  }, [transactions]);

  const maxM = Math.max(...totals.monthlyMap, 1);

  const exportCsv = () => {
    const header = ["id", "date", "customer", "listing", "amount", "platform_fee_15", "host_payout_85", "method"];
    const rows = transactions.map((t) => [
      t.id,
      new Date(t.date).toISOString(),
      `"${t.customer}"`,
      `"${t.listing.replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      t.fee.toFixed(2),
      t.payout.toFixed(2),
      t.method,
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kairos-finance-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export ready", { description: `${transactions.length} transactions` });
  };

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-accent">
            <BarChart3 className="w-3 h-3" /> Admin · Finance
          </div>
          <h1 className="font-display text-2xl md:text-4xl mt-1">Revenue & Payouts</h1>
          <p className="text-sm text-muted-foreground mt-1">Live commission split — 15% platform, 85% host payout.</p>
        </div>
        <Button onClick={exportCsv} className="rounded-full">
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6">
        <Stat label="Total revenue" value={`$${Math.round(totals.total).toLocaleString()}`} icon={DollarSign} hint={`${transactions.length} paid txns`} accent />
        <Stat label="Monthly revenue" value={`$${Math.round(totals.thisMonth).toLocaleString()}`} icon={TrendingUp} hint={MONTHS[new Date().getMonth()]} />
        <Stat label="Platform 15%" value={`$${Math.round(totals.fees).toLocaleString()}`} icon={Receipt} hint="commission" />
        <Stat label="Host payouts 85%" value={`$${Math.round(totals.payouts).toLocaleString()}`} icon={Wallet} hint="net to providers" />
      </div>

      {/* Monthly chart */}
      <div className="rounded-2xl border border-border bg-card p-4 md:p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg">Monthly revenue</h3>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{new Date().getFullYear()}</span>
        </div>
        <div className="flex items-end gap-1.5 h-32 md:h-44">
          {totals.monthlyMap.map((v, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${(v / maxM) * 100}%` }}
              transition={{ delay: i * 0.04, duration: 0.5 }}
              className={cn(
                "flex-1 rounded-t-lg",
                i === new Date().getMonth() ? "bg-gradient-gold" : "bg-muted-foreground/30"
              )}
              title={`${MONTHS[i]}: $${Math.round(v).toLocaleString()}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
          {MONTHS.map((m) => <span key={m}>{m}</span>)}
        </div>
      </div>

      {/* Transactions */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg md:text-xl">Transactions</h2>
          <span className="text-xs text-muted-foreground">paymentStatus: <span className="text-accent">paid</span></span>
        </div>

        {/* Mobile cards */}
        <div className="space-y-2 md:hidden">
          {transactions.slice(0, 30).map((t) => (
            <div key={t.id} className="rounded-2xl border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{t.listing}</div>
                  <div className="text-xs text-muted-foreground truncate">{t.customer} · {new Date(t.date).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-display tabular-nums">${t.amount.toLocaleString()}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.method}</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-border">
                <span className="text-muted-foreground">Fee <span className="text-foreground tabular-nums">${t.fee.toFixed(0)}</span></span>
                <span className="text-muted-foreground">Payout <span className="text-foreground tabular-nums">${t.payout.toFixed(0)}</span></span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Txn</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Listing</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Fee 15%</TableHead>
                <TableHead className="text-right">Payout 85%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 50).map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.id}</TableCell>
                  <TableCell className="text-xs">{new Date(t.date).toLocaleDateString()}</TableCell>
                  <TableCell>{t.customer}</TableCell>
                  <TableCell className="max-w-[260px] truncate">{t.listing}</TableCell>
                  <TableCell>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-muted text-muted-foreground">{t.method}</span>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">${t.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">${t.fee.toFixed(0)}</TableCell>
                  <TableCell className="text-right tabular-nums text-accent">${t.payout.toFixed(0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Finance;
