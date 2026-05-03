import { useState } from "react";
import { Bell, CheckCheck, Calendar, MessageSquare, Sparkles, AlertCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type Notif = {
  id: string;
  type: "booking" | "message" | "promo" | "system";
  message: string;
  time: string;
  read: boolean;
};

const SEED: Notif[] = [
  { id: "1", type: "booking", message: "Your booking KAI-1A2B3C is confirmed for Apr 28.", time: "2m", read: false },
  { id: "2", type: "message", message: "Mara Wild Co. sent you trip details.", time: "1h", read: false },
  { id: "3", type: "promo", message: "New: Coastal Linen Retreat is 15% off this week.", time: "5h", read: false },
  { id: "4", type: "system", message: "Wallet topped up with $1,000.", time: "1d", read: true },
  { id: "5", type: "booking", message: "Skyline Loft check-in starts at 3 PM.", time: "2d", read: true },
];

const ICONS = { booking: Calendar, message: MessageSquare, promo: Sparkles, system: AlertCircle };

export function NotificationBell() {
  const [items, setItems] = useState<Notif[]>(SEED);
  const [open, setOpen] = useState(false);
  const unread = items.filter((n) => !n.read).length;

  const markOne = (id: string) => setItems((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAll = () => setItems((p) => p.map((n) => ({ ...n, read: true })));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="Notifications" className="relative h-9 w-9 rounded-lg">
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-medium flex items-center justify-center tabular-nums"
            >
              {unread}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <div className="font-display text-sm">Notifications</div>
            <div className="text-[10px] text-muted-foreground">{unread} unread</div>
          </div>
          {unread > 0 && (
            <Button size="sm" variant="ghost" onClick={markAll} className="h-7 text-xs rounded-lg">
              <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-[360px] overflow-y-auto divide-y divide-border">
          {items.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">You're all caught up.</div>
          ) : items.map((n) => {
            const Icon = ICONS[n.type];
            return (
              <button
                key={n.id}
                onClick={() => markOne(n.id)}
                className={cn(
                  "w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-muted/60 transition-colors",
                  !n.read && "bg-accent/5"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  n.type === "booking" && "bg-accent-soft text-accent-foreground",
                  n.type === "message" && "bg-foreground/10",
                  n.type === "promo" && "bg-gradient-gold text-accent-foreground",
                  n.type === "system" && "bg-muted",
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn("text-sm", !n.read && "font-medium")}>{n.message}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{n.time} ago</div>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1.5" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
