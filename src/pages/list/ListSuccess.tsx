import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ListSuccess() {
  const [params] = useSearchParams();
  const ref = params.get("ref") || "—";
  const type = params.get("type") || "listing";

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center justify-center px-4 py-12">
      <div className="w-full rounded-2xl border border-border/60 bg-card/70 p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Submitted for review</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your listing has been submitted for admin review. We'll notify you
          within 24 hours.
        </p>

        <div className="mt-6 grid gap-2 rounded-xl border border-border bg-muted/30 p-4 text-left text-sm">
          <Row label="Reference" value={<span className="font-mono">{ref}</span>} />
          <Row label="Service type" value={<span className="capitalize">{type}</span>} />
          <Row
            label="Status"
            value={<Badge variant="secondary">pending_approval</Badge>}
          />
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to="/agent/listings">
              View my listings <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/list">
              <Plus className="mr-1 h-4 w-4" /> Create another
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
}
