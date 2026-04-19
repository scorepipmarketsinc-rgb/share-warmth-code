import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChatMessage, Listing } from "@/lib/kairos-data";
import { ListingCard } from "./ListingCard";
import { ReceiptCard } from "./ReceiptCard";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface Props {
  message: ChatMessage;
  onSelectListing: (l: Listing) => void;
  onConfirmBooking: (msgId: string) => void;
  onDeclineBooking: (msgId: string) => void;
}

function useTypewriter(text: string, speed = 12) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return out;
}

export function ChatBubble({ message, onSelectListing, onConfirmBooking, onDeclineBooking }: Props) {
  const isUser = message.role === "user";
  const typed = useTypewriter(!isUser ? message.content : "");

  if (isUser) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-[78%] rounded-2xl rounded-tr-sm bg-foreground text-background px-4 py-2.5 text-sm leading-relaxed shadow-soft">
          {message.content}
        </div>
      </motion.div>
    );
  }

  // Build a fake booking object from the receipt info to reuse ReceiptCard
  const receiptBooking = message.receipt
    ? {
        id: message.receipt.bookingId,
        listingId: message.receipt.listing.id,
        category: message.receipt.listing.category,
        title: message.receipt.listing.title,
        location: message.receipt.listing.location,
        provider: message.receipt.listing.provider.name,
        total: message.receipt.total,
        nights: message.receipt.nights,
        date: message.receipt.date,
        startISO: new Date().toISOString(),
        endISO: new Date().toISOString(),
        status: "upcoming" as const,
        createdAt: Date.now(),
        customer: "Alex Mwangi",
        source: "chat" as const,
      }
    : null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center shrink-0 shadow-gold">
        <Sparkles className="w-4 h-4 text-accent-foreground" />
      </div>
      <div className="max-w-[88%] space-y-3 flex-1">
        <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-2.5 text-sm leading-relaxed shadow-soft inline-block">
          {typed}
          {typed.length < message.content.length && (
            <span className="inline-block w-1.5 h-4 bg-accent ml-0.5 align-middle animate-blink" />
          )}
        </div>

        {message.listings && message.listings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {message.listings.map((l) => (
              <ListingCard key={l.id} listing={l} onSelect={onSelectListing} compact />
            ))}
          </div>
        )}

        {message.confirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-border bg-accent-soft p-4 max-w-md"
          >
            <div className="text-sm">
              Confirm booking for <span className="font-semibold">{message.confirm.listing.title}</span> —{" "}
              {message.confirm.nights} {message.confirm.listing.category === "hotels" ? "nights" : "days"} at{" "}
              <span className="font-semibold">${message.confirm.total.toLocaleString()}</span>?
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={() => onConfirmBooking(message.id)} className="bg-foreground text-background hover:bg-foreground/90 rounded-xl">
                Confirm booking
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDeclineBooking(message.id)} className="rounded-xl">
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {receiptBooking && <ReceiptCard booking={receiptBooking} />}
      </div>
    </motion.div>
  );
}
