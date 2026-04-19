import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Plus, Wallet } from "lucide-react";
import { ChatMessage, Conversation, Listing, Role } from "@/lib/kairos-data";
import { craftReply, findListings, parseQuery } from "@/lib/mock-ai";
import { Sidebar } from "@/components/kairos/Sidebar";
import { ChatBubble } from "@/components/kairos/ChatBubble";
import { RightPanel } from "@/components/kairos/RightPanel";
import { ListServiceDialog } from "@/components/kairos/ListServiceDialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const uid = () => Math.random().toString(36).slice(2, 10);

const newConversation = (): Conversation => ({
  id: uid(),
  title: "New conversation",
  createdAt: Date.now(),
  messages: [
    {
      id: uid(),
      role: "assistant",
      content: "Hi, I'm Kairos. Tell me your budget, destination, or vibe — I'll find and book the perfect stay in seconds.",
      createdAt: Date.now(),
    },
  ],
});

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>(() => [newConversation()]);
  const [activeId, setActiveId] = useState<string>(conversations[0].id);
  const [input, setInput] = useState("");
  const [wallet, setWallet] = useState(4000);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [role, setRole] = useState<Role>("client");
  const [listOpen, setListOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0],
    [conversations, activeId]
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, activeId]);

  const updateActive = (fn: (c: Conversation) => Conversation) => {
    setConversations((prev) => prev.map((c) => (c.id === activeId ? fn(c) : c)));
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    const userMsg: ChatMessage = { id: uid(), role: "user", content: text, createdAt: Date.now() };
    updateActive((c) => ({
      ...c,
      title: c.messages.filter((m) => m.role === "user").length === 0 ? text.slice(0, 40) : c.title,
      messages: [...c.messages, userMsg],
    }));

    // Simulate AI thinking
    setTimeout(() => {
      const q = parseQuery(text);
      const results = findListings(q);
      const reply = craftReply(text, results, q);
      const aiMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: reply,
        createdAt: Date.now(),
        listings: results,
      };
      updateActive((c) => ({ ...c, messages: [...c.messages, aiMsg] }));
    }, 650);
  };

  const handleSelectListing = (l: Listing) => {
    setSelected(l);
    const nights = 3;
    const total = l.price * nights;
    const msg: ChatMessage = {
      id: uid(),
      role: "assistant",
      content: `Great choice. ${l.title} — do you want to book this for ${nights} days at $${total.toLocaleString()}?`,
      createdAt: Date.now(),
      confirm: { listing: l, nights, total },
    };
    updateActive((c) => ({ ...c, messages: [...c.messages, msg] }));
  };

  const handleConfirm = (msgId: string) => {
    const msg = active.messages.find((m) => m.id === msgId);
    if (!msg || msg.role !== "assistant" || !msg.confirm) return;
    const { listing, nights, total } = msg.confirm;
    if (wallet < total) {
      toast.error("Insufficient funds", { description: "Add funds to complete this booking." });
      return;
    }
    setWallet((w) => w - total);
    const start = new Date();
    const end = new Date(Date.now() + nights * 86400000);
    const date = `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;

    const receipt: ChatMessage = {
      id: uid(),
      role: "assistant",
      content: "✅ Booking confirmed. Your itinerary is ready.",
      createdAt: Date.now(),
      receipt: { listing, nights, total, date },
    };
    // Replace confirm with a plain version + add receipt
    updateActive((c) => ({
      ...c,
      messages: c.messages.map((m) => (m.id === msgId ? { ...m, confirm: undefined } : m)).concat(receipt),
    }));
    toast.success("Booking confirmed", { description: `${listing.title} · ${date}` });
  };

  const handleDecline = (msgId: string) => {
    updateActive((c) => ({
      ...c,
      messages: c.messages.map((m) => (m.id === msgId && m.role === "assistant" ? { ...m, confirm: undefined } : m)),
    }));
  };

  const startNew = () => {
    const c = newConversation();
    setConversations((prev) => [c, ...prev]);
    setActiveId(c.id);
    setSelected(null);
  };

  const handleBookFromPanel = (l: Listing) => handleSelectListing(l);

  return (
    <div className="h-screen w-full flex bg-background overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => { setActiveId(id); setSelected(null); }}
        onNew={startNew}
        role={role}
        onRoleChange={setRole}
        onListService={() => setListOpen(true)}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 px-4 md:px-8 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-ink flex items-center justify-center">
              <span className="font-display text-accent text-sm">K</span>
            </div>
            <span className="font-display">KAIROS AI</span>
          </div>
          <div className="hidden md:block">
            <h1 className="font-display text-xl truncate max-w-md">{active?.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              key={wallet}
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 rounded-full bg-foreground text-background pl-3 pr-1 py-1 shadow-soft"
            >
              <Wallet className="w-3.5 h-3.5 text-accent" />
              <span className="text-sm font-medium tabular-nums">${wallet.toLocaleString()}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setWallet((w) => w + 1000); toast.success("Added $1,000 to wallet"); }}
                className="h-7 rounded-full text-xs hover:bg-background/10 text-background"
              >
                <Plus className="w-3 h-3 mr-0.5" /> Add
              </Button>
            </motion.div>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-5">
            {active?.messages.length === 1 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center pb-2">
                <div className="font-display text-3xl md:text-4xl">
                  Find your <span className="text-gradient-gold">perfect moment.</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Conversational booking, powered by Kairos.
                </p>
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
                    handleSend();
                  }
                }}
                placeholder="Tell Kairos what you need…"
                rows={1}
                className="resize-none border-0 bg-transparent rounded-2xl pr-14 py-4 px-4 focus-visible:ring-0 min-h-[56px] max-h-40"
              />
              <Button
                onClick={handleSend}
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
      </main>

      <RightPanel selected={selected} onBook={handleBookFromPanel} />

      <ListServiceDialog open={listOpen} onOpenChange={setListOpen} />
    </div>
  );
};

export default Index;
