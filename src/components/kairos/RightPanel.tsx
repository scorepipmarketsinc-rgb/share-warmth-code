import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Sparkles } from "lucide-react";
import { Listing, TRENDING } from "@/lib/kairos-data";
import { Button } from "@/components/ui/button";

interface Props {
  selected: Listing | null;
  onBook: (l: Listing) => void;
}

export function RightPanel({ selected, onBook }: Props) {
  return (
    <aside className="hidden lg:flex w-[360px] xl:w-[400px] shrink-0 border-l border-border bg-background flex-col">
      <div className="p-5 border-b border-border">
        <h3 className="font-display text-lg">
          {selected ? "Selected" : "Trending now"}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {selected ? "Review and book in one tap." : "Curated by Kairos this week."}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-muted shadow-elevated">
                <img src={selected.image} alt={selected.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-display text-xl">{selected.title}</h4>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {selected.location}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>

              <div className="rounded-2xl border border-border overflow-hidden">
                <div className="aspect-[16/9] bg-gradient-to-br from-muted via-accent-soft to-muted relative flex items-center justify-center">
                  <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: "radial-gradient(circle at 30% 40%, hsl(var(--accent)/0.4), transparent 40%), radial-gradient(circle at 70% 60%, hsl(var(--primary)/0.2), transparent 50%)"
                  }} />
                  <div className="relative text-center">
                    <MapPin className="w-6 h-6 text-accent mx-auto" />
                    <div className="text-xs text-muted-foreground mt-1">Map view of {selected.location}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between pt-1">
                <div>
                  <div className="font-display text-2xl">${selected.price}</div>
                  <div className="text-xs text-muted-foreground -mt-0.5">per night</div>
                </div>
                <Button
                  onClick={() => onBook(selected)}
                  className="bg-gradient-gold text-accent-foreground hover:opacity-90 rounded-xl shadow-gold px-5"
                >
                  Book Now
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="trending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {TRENDING.map((t) => (
                <motion.div
                  key={t.id}
                  whileHover={{ y: -2 }}
                  className="rounded-2xl overflow-hidden border border-border bg-card shadow-soft hover:shadow-elevated transition-shadow"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    <img src={t.image} alt={t.title} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-display text-sm">{t.title}</h5>
                      <span className="text-sm font-semibold">${t.price}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" /> {t.location}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className="rounded-2xl border border-dashed border-border p-4 text-center">
                <Sparkles className="w-5 h-5 text-accent mx-auto" />
                <p className="text-xs text-muted-foreground mt-2">
                  Ask Kairos anything — try <em>"I have $4000, find me a hotel in Juja"</em>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
