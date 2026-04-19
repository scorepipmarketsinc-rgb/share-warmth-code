import { motion } from "framer-motion";
import { Plus, Search, MessageSquare, User } from "lucide-react";
import { Conversation, Role } from "@/lib/kairos-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  role: Role;
  onRoleChange: (r: Role) => void;
  onListService?: () => void;
}

export function Sidebar({ conversations, activeId, onSelect, onNew, role, onRoleChange, onListService }: Props) {
  const [q, setQ] = useState("");
  const filtered = conversations.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <aside className="hidden md:flex w-[280px] shrink-0 border-r border-sidebar-border bg-sidebar flex-col">
      {/* Logo */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-ink flex items-center justify-center shadow-soft">
            <span className="font-display text-accent text-sm">K</span>
          </div>
          <div>
            <div className="font-display text-base leading-none">KAIROS</div>
            <div className="text-[10px] tracking-[0.18em] text-muted-foreground">AI · CONCIERGE</div>
          </div>
        </div>
      </div>

      <div className="px-3">
        <Button
          onClick={onNew}
          className="w-full justify-start rounded-xl bg-foreground text-background hover:bg-foreground/90"
        >
          <Plus className="w-4 h-4 mr-2" /> New chat
        </Button>
      </div>

      <div className="px-3 mt-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations"
            className="pl-9 rounded-xl bg-background/60 border-sidebar-border"
          />
        </div>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 mt-3 pb-3">
        {filtered.length === 0 && (
          <div className="px-3 py-6 text-xs text-muted-foreground text-center">No conversations yet.</div>
        )}
        {filtered.map((c) => (
          <motion.button
            key={c.id}
            onClick={() => onSelect(c.id)}
            whileHover={{ x: 2 }}
            className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-2 transition-colors ${
              c.id === activeId ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60"
            }`}
          >
            <MessageSquare className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="text-sm truncate">{c.title}</div>
              <div className="text-[10px] text-muted-foreground">
                {new Date(c.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Role + profile */}
      <div className="p-3 border-t border-sidebar-border space-y-3">
        <div className="flex items-center p-1 rounded-xl bg-muted">
          {(["client", "agent"] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => onRoleChange(r)}
              className={`flex-1 text-xs py-1.5 rounded-lg capitalize transition-all ${
                role === r ? "bg-background shadow-soft font-medium" : "text-muted-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {role === "agent" && onListService && (
          <Button
            onClick={onListService}
            variant="outline"
            size="sm"
            className="w-full rounded-xl border-accent text-accent-foreground hover:bg-accent-soft"
          >
            + List a Service
          </Button>
        )}

        <div className="flex items-center gap-2 px-1">
          <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
            <User className="w-4 h-4 text-accent-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">Alex Mwangi</div>
            <div className="text-[10px] text-muted-foreground capitalize">{role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
