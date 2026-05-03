import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { toast.error("Enter a valid email"); return; }
    setLoading(true);
    // Mock POST /api/newsletter/subscribe
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setEmail("");
    toast.success("Subscribed", { description: "You're on the Kairos list." });
  };

  return (
    <footer className="border-t border-border bg-card/40 backdrop-blur">
      <div className="px-4 md:px-8 py-10 max-w-7xl mx-auto grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2 space-y-3">
          <div className="font-display text-lg">KAIROS</div>
          <p className="text-sm text-muted-foreground max-w-sm">A concierge that books, not just chats. Stays, tours and experiences — curated and confirmed.</p>
          <form onSubmit={subscribe} className="flex gap-2 max-w-sm pt-1">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="pl-9 rounded-xl" />
            </div>
            <Button type="submit" disabled={loading} className="rounded-xl">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
            </Button>
          </form>
        </div>
        <div className="text-sm space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Explore</div>
          <Link to="/discover" className="block hover:text-accent">Discover</Link>
          <Link to="/travel" className="block hover:text-accent">Travel packages</Link>
          <Link to="/kairos" className="block hover:text-accent">Kairos AI</Link>
        </div>
        <div className="text-sm space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Account</div>
          <Link to="/login" className="block hover:text-accent">Sign in</Link>
          <Link to="/register" className="block hover:text-accent">Create account</Link>
          <Link to="/dashboard" className="block hover:text-accent">Dashboard</Link>
        </div>
      </div>
      <div className="border-t border-border px-4 md:px-8 py-4 text-xs text-muted-foreground max-w-7xl mx-auto flex justify-between">
        <span>© 2026 Kairos</span>
        <span>Made with care.</span>
      </div>
    </footer>
  );
}
