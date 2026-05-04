import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listKyc, reviewKyc, type KycStatus, type KycSubmission } from "@/lib/kyc";
import { StatusBadge } from "@/pages/Kyc";
import { toast } from "sonner";

export default function AdminKyc() {
  const [items, setItems] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<KycStatus | "all">("all");
  const [active, setActive] = useState<KycSubmission | null>(null);
  const [note, setNote] = useState("");
  const [working, setWorking] = useState<"approve" | "reject" | null>(null);

  const refresh = () =>
    listKyc().then((l) => {
      setItems(l);
      setLoading(false);
    });

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("kyc:changed", h);
    return () => window.removeEventListener("kyc:changed", h);
  }, []);

  const filtered = useMemo(() => {
    return items.filter((k) => {
      if (statusFilter !== "all" && k.status !== statusFilter) return false;
      if (q) {
        const t = q.toLowerCase();
        return (
          k.userName.toLowerCase().includes(t) ||
          k.userEmail.toLowerCase().includes(t) ||
          k.idNumber.toLowerCase().includes(t) ||
          k.fullName.toLowerCase().includes(t)
        );
      }
      return true;
    });
  }, [items, q, statusFilter]);

  const stats = useMemo(
    () => ({
      total: items.length,
      pending: items.filter((k) => k.status === "pending").length,
      approved: items.filter((k) => k.status === "approved").length,
      rejected: items.filter((k) => k.status === "rejected").length,
    }),
    [items]
  );

  const handleReview = async (status: "approved" | "rejected") => {
    if (!active) return;
    setWorking(status === "approved" ? "approve" : "reject");
    const updated = await reviewKyc(active.id, status, note.trim() || undefined);
    setWorking(null);
    if (updated) {
      toast.success(status === "approved" ? "User verified" : "Submission rejected");
      setActive(null);
      setNote("");
      refresh();
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="h-3 w-3" /> Admin · KYC
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Identity reviews
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Approve or reject user verification requests.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total" value={stats.total} icon={Inbox} />
        <Stat label="Pending" value={stats.pending} icon={Clock} accent="amber" />
        <Stat
          label="Approved"
          value={stats.approved}
          icon={CheckCircle2}
          accent="primary"
        />
        <Stat
          label="Rejected"
          value={stats.rejected}
          icon={XCircle}
          accent="destructive"
        />
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email or ID number"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Body */}
      <div className="mt-6 rounded-2xl border border-border/60 bg-card/70">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-center">
            <Inbox className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No submissions match your filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell>
                        <div className="font-medium">{k.userName}</div>
                        <div className="text-xs text-muted-foreground">{k.userEmail}</div>
                        <Badge variant="outline" className="mt-1 capitalize text-[10px]">
                          {k.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5">
                          {[k.idFront, k.idBack, k.selfie].map((src, i) => (
                            <img
                              key={i}
                              src={src}
                              alt=""
                              className="h-10 w-10 rounded-md border border-border object-cover"
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(k.submittedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={k.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setActive(k)}>
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="grid gap-3 p-3 md:hidden">
              {filtered.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setActive(k)}
                  className="rounded-xl border border-border/60 bg-background/40 p-3 text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">{k.userName}</div>
                      <div className="text-xs text-muted-foreground">{k.userEmail}</div>
                    </div>
                    <StatusBadge status={k.status} />
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    {[k.idFront, k.idBack, k.selfie].map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt=""
                        className="h-12 w-12 rounded-md border border-border object-cover"
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Review dialog */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review submission</DialogTitle>
          </DialogHeader>
          {active && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="User" value={`${active.userName} · ${active.userEmail}`} />
                <Info label="Role" value={active.role} />
                <Info label="Full legal name" value={active.fullName} />
                <Info label="ID / passport" value={active.idNumber} />
                <Info label="KRA PIN" value={active.kraPin} />
                <Info label="Phone" value={active.phone} />
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "ID front", src: active.idFront },
                  { label: "ID back", src: active.idBack },
                  { label: "Selfie", src: active.selfie },
                ].map((d) => (
                  <div key={d.label}>
                    <a
                      href={d.src}
                      target="_blank"
                      rel="noreferrer"
                      className="block aspect-[3/4] overflow-hidden rounded-lg border border-border/60 bg-muted"
                    >
                      <img
                        src={d.src}
                        alt={d.label}
                        className="h-full w-full object-cover transition hover:scale-105"
                      />
                    </a>
                    <p className="mt-1 text-center text-[11px] text-muted-foreground">
                      {d.label}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-medium">Reviewer notes (optional)</label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Visible to the user if rejected…"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => handleReview("rejected")}
                  disabled={!!working}
                  className="gap-2"
                >
                  {working === "reject" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Reject
                </Button>
                <Button
                  onClick={() => handleReview("approved")}
                  disabled={!!working}
                  className="gap-2"
                >
                  {working === "approve" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: any;
  accent?: "amber" | "primary" | "destructive";
}) {
  const tone =
    accent === "amber"
      ? "bg-amber-500/15 text-amber-600"
      : accent === "destructive"
      ? "bg-destructive/15 text-destructive"
      : accent === "primary"
      ? "bg-primary/15 text-primary"
      : "bg-muted text-muted-foreground";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/60 bg-card/70 p-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-bold tabular-nums">{value}</div>
    </motion.div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-medium capitalize">{value}</div>
    </div>
  );
}
