import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Plus, Eye, Building2, Hotel, Mountain, Sparkles, Plane, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { myListings, BaseListing, ListingType, ListingStatus } from "@/lib/listings";
import { cn } from "@/lib/utils";

const USER_ID = "alex-mwangi";

const TYPE_ICON: Record<ListingType, any> = {
  property: Building2, hotel: Hotel, experience: Mountain,
  lifestyle: Sparkles, travel: Plane,
};

const STATUS_CLS: Record<ListingStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_approval: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  approved: "bg-primary/15 text-primary border-primary/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  inactive: "bg-muted text-muted-foreground",
};

export default function AgentListings() {
  const [items, setItems] = useState<BaseListing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    myListings(USER_ID).then((l) => {
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

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">My listings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your submissions, approvals and bookings.
          </p>
        </div>
        <Button asChild>
          <Link to="/list"><Plus className="mr-1 h-4 w-4" /> New listing</Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <h3 className="font-display text-lg">No listings yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first listing to start receiving bookings.
          </p>
          <Button asChild className="mt-4">
            <Link to="/list"><Plus className="mr-1 h-4 w-4" /> Create listing</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((l) => {
                const Icon = TYPE_ICON[l.type];
                return (
                  <TableRow key={l.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {l.images[0] ? (
                          <img src={l.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted" />
                        )}
                        <div>
                          <div className="font-medium text-sm">{l.title}</div>
                          <div className="text-xs text-muted-foreground font-mono">{l.id}</div>
                          {l.status === "rejected" && l.adminNote && (
                            <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-destructive">
                              <AlertCircle className="h-3 w-3" /> {l.adminNote}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs capitalize">
                        <Icon className="h-3.5 w-3.5" /> {l.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px]", STATUS_CLS[l.status])}>
                        {l.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{l.views ?? 0}</TableCell>
                    <TableCell className="text-muted-foreground">{l.bookings ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {l.status === "rejected" && (
                        <Button asChild size="sm" variant="ghost">
                          <Link to={`/list/${l.type}`}>Resubmit</Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
