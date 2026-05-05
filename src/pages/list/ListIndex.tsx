import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Hotel,
  Mountain,
  Sparkles,
  Plane,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ListingType, TYPE_META } from "@/lib/listings";

const TYPES: {
  key: ListingType;
  label: string;
  desc: string;
  icon: any;
  gradient: string;
}[] = [
  {
    key: "property",
    label: "Property",
    desc: "Apartments, villas, houses, land, offices",
    icon: Building2,
    gradient: "from-amber-400 to-orange-500",
  },
  {
    key: "hotel",
    label: "Hotel / Room",
    desc: "Rooms, suites, boutique hotels, stays",
    icon: Hotel,
    gradient: "from-rose-400 to-pink-600",
  },
  {
    key: "experience",
    label: "Experience",
    desc: "Safaris, tours, adventures, wellness",
    icon: Mountain,
    gradient: "from-emerald-400 to-teal-600",
  },
  {
    key: "lifestyle",
    label: "Lifestyle Service",
    desc: "Beauty, fitness, photography, events",
    icon: Sparkles,
    gradient: "from-violet-400 to-fuchsia-600",
  },
  {
    key: "travel",
    label: "Travel Package / Tour",
    desc: "Multi-day tours, honeymoons, trips",
    icon: Plane,
    gradient: "from-sky-400 to-indigo-600",
  },
];

export default function ListIndex() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
      <div className="text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="h-3 w-3" /> List on KAIROS
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          What would you like to list?
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Choose a service type to start. Listings are reviewed by our team
          before going live.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TYPES.map((t, i) => {
          const meta = TYPE_META[t.key];
          return (
            <motion.div
              key={t.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/list/${t.key}`}
                className="group block h-full rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm transition hover:border-primary/60 hover:shadow-md"
              >
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow",
                    t.gradient
                  )}
                >
                  <t.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg">{t.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    {meta.verification === "kyb"
                      ? "Requires KYB"
                      : meta.verification === "kyc"
                      ? "Requires KYC"
                      : "KYC or KYB"}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
                    Start listing <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
