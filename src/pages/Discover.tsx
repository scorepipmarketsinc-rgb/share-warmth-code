import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Star } from "lucide-react";
import { CATEGORY_META, Category, LISTINGS } from "@/lib/kairos-data";
import { ListingCard } from "@/components/kairos/ListingCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type SortKey = "popular" | "price-asc" | "price-desc" | "rating";

const Discover = () => {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<Category | "all">("all");
  const [priceMax, setPriceMax] = useState(1500);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<SortKey>("popular");
  const [showFilters, setShowFilters] = useState(true);

  const filtered = useMemo(() => {
    let pool = LISTINGS.slice();
    if (activeCat !== "all") pool = pool.filter((l) => l.category === activeCat);
    if (query) {
      const q = query.toLowerCase();
      pool = pool.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.shortDescription.toLowerCase().includes(q)
      );
    }
    pool = pool.filter((l) => l.price <= priceMax && l.rating >= minRating);
    switch (sort) {
      case "price-asc": pool.sort((a, b) => a.price - b.price); break;
      case "price-desc": pool.sort((a, b) => b.price - a.price); break;
      case "rating": pool.sort((a, b) => b.rating - a.rating); break;
      default: pool.sort((a, b) => b.reviewCount - a.reviewCount);
    }
    return pool;
  }, [query, activeCat, priceMax, minRating, sort]);

  const grouped: Record<Category, typeof LISTINGS> = useMemo(
    () => ({
      hotels: LISTINGS.filter((l) => l.category === "hotels"),
      tours: LISTINGS.filter((l) => l.category === "tours"),
      lifestyle: LISTINGS.filter((l) => l.category === "lifestyle"),
      services: LISTINGS.filter((l) => l.category === "services"),
    }),
    []
  );

  const isFiltering = activeCat !== "all" || query.length > 0 || priceMax < 1500 || minRating > 0;

  return (
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-ink text-primary-foreground px-6 md:px-12 py-12 md:py-16 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, hsl(var(--accent)/0.35), transparent 45%), radial-gradient(circle at 85% 70%, hsl(var(--accent)/0.25), transparent 45%)"
        }} />
        <div className="relative max-w-2xl">
          <div className="text-[10px] tracking-[0.2em] uppercase text-accent">Discover</div>
          <h1 className="font-display text-4xl md:text-5xl mt-2 leading-tight">
            Curated experiences, <span className="text-gradient-gold">on demand.</span>
          </h1>
          <p className="text-sm md:text-base text-primary-foreground/70 mt-3">
            Hotels, tours, lifestyle, and services — handpicked and instantly bookable.
          </p>
          <div className="mt-6 flex items-center gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stays, tours, services…"
                className="pl-11 h-12 rounded-2xl bg-background text-foreground border-0"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters((s) => !s)}
              className="h-12 rounded-2xl bg-background text-foreground border-0 hover:bg-background/90"
            >
              <SlidersHorizontal className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Filters</span>
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Category chips */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["all", "hotels", "tours", "lifestyle", "services"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            className={cn(
              "px-4 py-2 rounded-full text-sm transition-all",
              activeCat === c
                ? "bg-foreground text-background shadow-soft"
                : "bg-card border border-border hover:bg-muted"
            )}
          >
            {c === "all" ? "All" : CATEGORY_META[c].label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs"
          >
            <option value="popular">Popular</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>

      {/* Filters drawer */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 rounded-2xl border border-border bg-card p-5 grid md:grid-cols-2 gap-6"
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium">Max price</span>
              <span className="tabular-nums text-muted-foreground">${priceMax}</span>
            </div>
            <Slider value={[priceMax]} max={1500} step={20} onValueChange={(v) => setPriceMax(v[0])} />
          </div>
          <div>
            <div className="text-xs font-medium mb-2">Minimum rating</div>
            <div className="flex items-center gap-2">
              {[0, 4, 4.5, 4.8].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs border transition-colors flex items-center gap-1",
                    minRating === r ? "bg-foreground text-background border-foreground" : "border-border bg-background hover:bg-muted"
                  )}
                >
                  {r === 0 ? "Any" : (<><Star className="w-3 h-3 fill-current" />{r}+</>)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {isFiltering ? (
        <section className="mt-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="font-display text-2xl">{filtered.length} result{filtered.length === 1 ? "" : "s"}</h2>
          </div>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              Nothing matches those filters. Try widening price or rating.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((l) => (
                <ListingCard key={l.id} listing={l} showCategory />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {(Object.keys(grouped) as Category[]).map((cat) => (
            <section key={cat} className="mt-12">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h2 className="font-display text-2xl">{CATEGORY_META[cat].label}</h2>
                  <p className="text-sm text-muted-foreground">{CATEGORY_META[cat].tagline}</p>
                </div>
                <button
                  onClick={() => setActiveCat(cat)}
                  className="text-xs text-muted-foreground hover:text-foreground story-link"
                >
                  View all
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {grouped[cat].map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
};

export default Discover;
