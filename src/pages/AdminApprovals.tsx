import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, MessageSquare, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { pendingListings, reviewListing, BaseListing, ListingType } from "@/lib/listings";

const TYPES: (ListingType | "all")[] = ["all", "property", "hotel", "experience", "lifestyle", "travel"];

export default function AdminApprovals() {
  const [items, setItems] = useState<BaseListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ListingType | "all">("all");

  const load = () => {
    setLoading(true);
    pendingListings().then((l) => {
      setItems(l);
      setLoading(false);
    });
  };
  useEffect(() => {
    load();
    const h = () => load();
    window.addEventListener("kairos:db", h);
    return () => window.removeEventListener("kairos:db", h);
  }, []);

  const visible = filter === "all" ? items : items.filter((l) => l.type === filter);

  const act = async (l: BaseListing, action: "approve" | "reject" | "request-changes", note?: string) => {
    await reviewListing(l.type, l.id, action, note);
    toast.success(`Listing ${action}d`);
    load();
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Listing approvals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review pending listings before they go live.
        </p>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mt-6">
        <TabsList className="flex-wrap">
          {TYPES.map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <h3 className="font-display text-lg">All caught up</h3>
          <p className="mt-1 text-sm text-muted-foreground">No pending listings to review.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {visible.map((l) => (
            <ApprovalCard key={l.id} listing={l} onAction={act} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApprovalCard({
  listing,
  onAction,
}: {
  listing: BaseListing;
  onAction: (l: BaseListing, a: "approve" | "reject" | "request-changes", note?: string) => void;
}) {
  const [note, setNote] = useState("");
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="aspect-[16/9] bg-muted">
        {listing.images[0] ? (
          <img src={listing.images[0]} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Badge variant="outline" className="capitalize text-[10px]">{listing.type}</Badge>
            <h3 className="mt-1.5 font-display text-base">{listing.title}</h3>
            <p className="text-xs text-muted-foreground">
              by {listing.ownerName} · {new Date(listing.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost">
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{listing.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {listing.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {listing.images.map((src, i) => (
                      <img key={i} src={src} alt="" className="aspect-square rounded object-cover" />
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(listing.data).map(([k, v]) => (
                    <div key={k} className="rounded bg-muted/40 p-2">
                      <div className="text-[10px] uppercase text-muted-foreground">{k}</div>
                      <div className="truncate">{Array.isArray(v) ? v.join(", ") : String(v ?? "—")}</div>
                    </div>
                  ))}
                </div>
                {listing.documents.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Documents</div>
                    <ul className="mt-1 space-y-1 text-sm">
                      {listing.documents.map((d, i) => (
                        <li key={i}>
                          <a href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                            <FileText className="h-3.5 w-3.5" /> {d.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Textarea
          placeholder="Add a note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="mt-3 text-sm"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onAction(listing, "approve", note)} className="gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => onAction(listing, "request-changes", note)} className="gap-1">
            <MessageSquare className="h-3.5 w-3.5" /> Request changes
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onAction(listing, "reject", note)} className="gap-1">
            <XCircle className="h-3.5 w-3.5" /> Reject
          </Button>
        </div>
      </div>
    </div>
  );
}
