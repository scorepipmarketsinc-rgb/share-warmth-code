import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChatMessage, Listing } from "@/lib/kairos-data";
import { ListingCard } from "./ListingCard";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles } from "lucide-react";

interface Props {
  message: ChatMessage;
  onSelectListing: (l: Listing) => void;
  onConfirmBooking: (msgId: string) => void;
  onDeclineBooking: (msgId: string) => void;
}

function useTypewriter(text: string, speed = 14) {
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
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="max-w-[78%] rounded-2xl rounded-tr-sm bg-foreground text-background px-4 py-2.5 text-sm leading-relaxed shadow-soft">
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center shrink-0 shadow-gold">
        <Sparkles className="w-4 h-4 text-accent-foreground" />
      </div>
      <div className="max-w-[88%] space-y-3">
        <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-2.5 text-sm leading-relaxed shadow-soft">
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
            className="rounded-2xl border border-border bg-accent-soft p-4"
          >
            <div className="text-sm">
              Confirm booking for{" "}
              <span className="font-semibold">{message.confirm.listing.title}</span> —{" "}
              {message.confirm.nights} nights at{" "}
              <span className="font-semibold">${message.confirm.total.toLocaleString()}</span>?
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => onConfirmBooking(message.id)}
                className="bg-foreground text-background hover:bg-foreground/90 rounded-xl"
              >
                Confirm booking
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDeclineBooking(message.id)}
                className="rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {message.receipt && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden max-w-md"
          >
            <div className="bg-gradient-ink text-primary-foreground px-4 py-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Booking confirmed</span>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stay</span>
                <span className="font-medium">{message.receipt.listing.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span>{message.receipt.listing.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dates</span>
                <span>{message.receipt.date} · {message.receipt.nights} nights</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display text-lg">${message.receipt.total.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
