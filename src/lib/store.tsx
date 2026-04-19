import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { Booking, ChatMessage, Conversation, Listing, Role, Transaction } from "./kairos-data";
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
      content: "Hi, I'm Kairos. Tell me your budget, destination, or vibe — I'll find and book the perfect experience in seconds.",
      createdAt: Date.now(),
    },
  ],
});

interface AppState {
  // role + identity
  role: Role;
  setRole: (r: Role) => void;

  // wallet
  wallet: number;
  addFunds: (amount: number) => void;

  // conversations
  conversations: Conversation[];
  activeId: string;
  setActiveId: (id: string) => void;
  newConversation: () => string;
  updateActive: (fn: (c: Conversation) => Conversation) => void;

  // bookings
  bookings: Booking[];
  createBooking: (l: Listing, nights: number, source: "chat" | "manual") => Booking | null;

  // favorites
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  // transactions
  transactions: Transaction[];
}

const Ctx = createContext<AppState | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>("client");
  const [wallet, setWallet] = useState(4000);
  const [conversations, setConversations] = useState<Conversation[]>(() => [newConversation()]);
  const [activeId, setActiveId] = useState<string>(() => conversations[0].id);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: uid(), label: "Welcome credit", amount: 4000, date: new Date().toISOString(), type: "topup" },
  ]);

  const addFunds = useCallback((amount: number) => {
    setWallet((w) => w + amount);
    setTransactions((t) => [
      { id: uid(), label: `Top‑up`, amount, date: new Date().toISOString(), type: "topup" },
      ...t,
    ]);
    toast.success(`Added $${amount.toLocaleString()} to wallet`);
  }, []);

  const newConv = useCallback(() => {
    const c = newConversation();
    setConversations((prev) => [c, ...prev]);
    setActiveId(c.id);
    return c.id;
  }, []);

  const updateActive = useCallback(
    (fn: (c: Conversation) => Conversation) => {
      setConversations((prev) => prev.map((c) => (c.id === activeId ? fn(c) : c)));
    },
    [activeId]
  );

  const createBooking = useCallback(
    (l: Listing, nights: number, source: "chat" | "manual"): Booking | null => {
      const total = l.price * nights;
      if (wallet < total) {
        toast.error("Insufficient funds", { description: "Add funds to complete this booking." });
        return null;
      }
      const start = new Date();
      const end = new Date(Date.now() + nights * 86400000);
      const date = `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(
        undefined,
        { month: "short", day: "numeric", year: "numeric" }
      )}`;
      const booking: Booking = {
        id: `KAI-${Date.now().toString(36).toUpperCase()}`,
        listingId: l.id,
        category: l.category,
        title: l.title,
        location: l.location,
        provider: l.provider.name,
        total,
        nights,
        date,
        startISO: start.toISOString(),
        endISO: end.toISOString(),
        status: "upcoming",
        createdAt: Date.now(),
        customer: "Alex Mwangi",
        source,
      };
      setBookings((b) => [booking, ...b]);
      setWallet((w) => w - total);
      setTransactions((t) => [
        { id: uid(), label: l.title, amount: -total, date: new Date().toISOString(), type: "booking" },
        ...t,
      ]);
      toast.success("Booking confirmed", { description: `${l.title} · ${date}` });
      return booking;
    },
    [wallet]
  );

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((f) => {
      if (f.includes(id)) {
        toast("Removed from saved");
        return f.filter((x) => x !== id);
      }
      toast.success("Saved to favorites");
      return [id, ...f];
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const value = useMemo(
    () => ({
      role, setRole,
      wallet, addFunds,
      conversations, activeId, setActiveId,
      newConversation: newConv, updateActive,
      bookings, createBooking,
      favorites, toggleFavorite, isFavorite,
      transactions,
    }),
    [role, wallet, addFunds, conversations, activeId, newConv, updateActive, bookings, createBooking, favorites, toggleFavorite, isFavorite, transactions]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
};

export { uid };
export type { ChatMessage };
