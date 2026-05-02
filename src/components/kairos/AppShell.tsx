import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, MessageSquare, Compass, ShieldCheck, Plus, User, Wallet, PanelLeft, Sparkles, Menu, Briefcase, BarChart3 } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useApp } from "@/lib/store";
import { useSidebarCollapse } from "@/lib/sidebar-collapse";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import kairosLogo from "@/assets/kairos-logo.png";

const NAV = [
  { to: "/", label: "Concierge", icon: MessageSquare },
  { to: "/kairos", label: "Kairos AI", icon: Sparkles },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

const AGENT_NAV = { to: "/agent", label: "Agent Hub", icon: Briefcase };
const ADMIN_NAV = [
  { to: "/admin", label: "Admin", icon: ShieldCheck },
  { to: "/admin/finance", label: "Finance", icon: BarChart3 },
];

function NavBody({
  role,
  setRole,
  isAdmin,
  onNavigate,
}: {
  role: any;
  setRole: any;
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  const links = [
    ...NAV,
    ...(role === "agent" || isAdmin ? [AGENT_NAV] : []),
    ...(isAdmin ? ADMIN_NAV : []),
  ];
  return (
    <div className="h-full flex flex-col">
      <div className="px-5 pt-5 pb-4">
        <NavLink to="/" onClick={onNavigate} className="flex items-center gap-2">
          <img src={kairosLogo} alt="KAIROS logo" className="w-9 h-9 object-contain drop-shadow-[0_2px_8px_hsl(var(--accent)/0.35)]" />
          <div>
            <div className="font-display text-base leading-none">KAIROS</div>
            <div className="text-[10px] tracking-[0.18em] text-muted-foreground">AI · CONCIERGE</div>
          </div>
        </NavLink>
      </div>

      <nav className="px-2 space-y-0.5 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="p-3 border-t border-sidebar-border space-y-3">
        <div className="flex items-center p-1 rounded-xl bg-muted text-xs">
          {(["client", "agent", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r);
                toast(`Switched to ${r}`);
              }}
              className={cn(
                "flex-1 py-1.5 rounded-lg capitalize transition-all",
                role === r ? "bg-background shadow-soft font-medium" : "text-muted-foreground"
              )}
            >
              {r}
            </button>
          ))}
        </div>

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
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { role, setRole, wallet, addFunds } = useApp();
  const { navCollapsed, toggle } = useSidebarCollapse();
  const location = useLocation();
  const isAdmin = role === "admin";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen w-full flex bg-background overflow-hidden">
      {/* Desktop rail */}
      <motion.aside
        animate={{ width: navCollapsed ? 0 : 240 }}
        transition={{ type: "spring", stiffness: 260, damping: 32 }}
        className="hidden md:flex shrink-0 border-r border-sidebar-border bg-sidebar overflow-hidden"
      >
        <div className="w-[240px] h-full">
          <NavBody role={role} setRole={setRole} isAdmin={isAdmin} />
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-3 md:px-8 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" aria-label="Open menu" className="md:hidden h-9 w-9 rounded-lg">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] bg-sidebar border-sidebar-border">
                <NavBody role={role} setRole={setRole} isAdmin={isAdmin} onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            {/* Desktop sidebar toggle */}
            <Button
              size="icon"
              variant="ghost"
              onClick={toggle}
              aria-label="Toggle sidebar"
              className="hidden md:flex h-9 w-9 rounded-lg hover:bg-muted"
            >
              <PanelLeft className="w-4 h-4" />
            </Button>
            {/* Mobile logo */}
            <div className="md:hidden flex items-center gap-2 min-w-0">
              <img src={kairosLogo} alt="KAIROS logo" className="w-7 h-7 object-contain shrink-0" />
              <span className="font-display text-sm truncate">KAIROS</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            <span className="font-display text-foreground capitalize">
              {NAV.find((n) => n.to === location.pathname)?.label ??
                (location.pathname.startsWith("/admin/finance")
                  ? "Finance"
                  : location.pathname.startsWith("/admin")
                  ? "Admin"
                  : location.pathname.startsWith("/agent")
                  ? "Agent Hub"
                  : location.pathname.startsWith("/listing")
                  ? "Listing"
                  : "Concierge")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              key={wallet}
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 rounded-full bg-foreground text-background pl-2.5 md:pl-3 pr-1 py-1 shadow-soft"
            >
              <Wallet className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs md:text-sm font-medium tabular-nums">${wallet.toLocaleString()}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => addFunds(1000)}
                className="h-7 rounded-full text-xs hover:bg-background/10 text-background px-2"
              >
                <Plus className="w-3 h-3 mr-0.5" /> Add
              </Button>
            </motion.div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}
