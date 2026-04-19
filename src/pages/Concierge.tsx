import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, MessageSquare, Plus, Search, Sparkles } from "lucide-react";
import { ChatMessage, Listing } from "@/lib/kairos-data";
import { craftReply, findListings, parseQuery } from "@/lib/mock-ai";
import { uid, useApp } from "@/lib/store";
import { useSidebarCollapse } from "@/lib/sidebar-collapse";
import { ChatBubble } from "@/components/kairos/ChatBubble";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const QUICK_PROMPTS = [
  "I have $4000, find a hotel in Nairobi",
  "Plan a Diani beach getaway",
  "Book a private chef for tonight",
  "VIP nightlife in Westlands",
];

const Concierge = () => {
  const {
    conversations, activeId, setActiveId, newConversation, updateActive,
    createBooking,
  } = useApp();
  const { listCollapsed } = useSidebarCollapse();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0],
    [conversations, activeId]
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, activeId]);

  const filteredConvos = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const send = (text: string) => {
    const v = text.trim();
    if (!v) return;
    setInput("");
    const userMsg: ChatMessage = { id: uid(), role: "user", content: v, createdAt: Date.now() };
    updateActive((c) => ({
      ...c,
      title: c.messages.filter((m) => m.role === "user").length === 0 ? v.slice(0, 40) : c.title,
      messages: [...c.messages, userMsg],
    }));
    setTimeout(() => {
      const q = parseQuery(v);
      const results = findListings(q);
      const reply = craftReply(v, results, q);
      const aiMsg: ChatMessage = {
        id: uid(), role: "assistant", content: reply, createdAt: Date.now(), listings: results,
      };
      updateActive((c) => ({ ...c, messages: [...c.messages, aiMsg] }));
    }, 600);
  };

  const handleSelectListing = (l: Listing) => {
    const nights = 3;
    const total = l.price * nights;
    const msg: ChatMessage = {
      id: uid(), role: "assistant",
      content: `Great choice. ${l.title} — confirm booking for ${nights} ${l.category === "hotels" ? "nights" : "days"} at $${total.toLocaleString()}?`,
      createdAt: Date.now(),
      confirm: { listing: l, nights, total },
    };
    updateActive((c) => ({ ...c, messages: [...c.messages, msg] }));
  };

  const handleConfirm = (msgId: string) => {
    const msg = active.messages.find((m) => m.id === msgId);
    if (!msg || msg.role !== "assistant" || !msg.confirm) return;
    const { listing, nights } = msg.confirm;
    const booking = createBooking(listing, nights, "chat");
    if (!booking) return;
    const receipt: ChatMessage = {
      id: uid(), role: "assistant",
      content: "✅ Booking confirmed. Your itinerary is ready.",
      createdAt: Date.now(),
      receipt: { bookingId: booking.id, listing, nights, total: booking.total, date: booking.date },
    };
    updateActive((c) => ({
      ...c,
      messages: c.messages.map((m) => (m.id === msgId ? { ...m, confirm: undefined } : m)).concat(receipt),
    }));
  };

  const handleDecline = (msgId: string) => {
    updateActive((c) => ({
      ...c,
      messages: c.messages.map((m) => (m.id === msgId && m.role === "assistant" ? { ...m, confirm: undefined } : m)),
    }));
  };

  return (
    <div className="h-full flex">
      {/* Conversation list */}
      <AnimatePresence initial={false}>
        {!listCollapsed && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
            className="hidden lg:flex shrink-0 border-r border-border flex-col bg-background overflow-hidden"
          >
            <div className="p-4 space-y-3 w-[260px]">
              <Button
                onClick={() => newConversation()}
                className="w-full justify-start rounded-xl bg-foreground text-background hover:bg-foreground/90"
              >
                <Plus className="w-4 h-4 mr-2" /> New chat
              </Button>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations"
                  className="pl-9 rounded-xl"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-3 w-[260px]">
              {filteredConvos.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-2 transition-colors ${
                    c.id === activeId ? "bg-muted" : "hover:bg-muted/60"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm truncate">{c.title}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-5">
            {active?.messages.length === 1 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center pb-2">
                <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase text-muted-foreground mb-3">
                  <Sparkles className="w-3 h-3 text-accent" /> Conversational booking
                </div>
                <div className="font-display text-3xl md:text-5xl leading-[1.05]">
                  Find your <span className="text-gradient-gold">perfect moment.</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">
                  Hotels, tours, lifestyle, services. Tell Kairos what you need — book in seconds.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            {active?.messages.map((m) => (
              <ChatBubble
                key={m.id}
                message={m}
                onSelectListing={handleSelectListing}
                onConfirmBooking={handleConfirm}
                onDeclineBooking={handleDecline}
              />
            ))}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-background">
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-4">
            <div className="relative rounded-2xl border border-border bg-card shadow-soft focus-within:shadow-elevated transition-shadow">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Tell Kairos what you need…"
                rows={1}
                className="resize-none border-0 bg-transparent rounded-2xl pr-14 py-4 px-4 focus-visible:ring-0 min-h-[56px] max-h-40"
              />
              <Button
                onClick={() => send(input)}
                size="icon"
                className="absolute right-2 bottom-2 h-10 w-10 rounded-xl bg-gradient-gold text-accent-foreground hover:opacity-90 shadow-gold"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-2">
              Kairos can make mistakes. Confirm details before booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Concierge;
