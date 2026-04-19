import { motion } from "framer-motion";
import { LayoutDashboard, MessageSquare, Compass, ShieldCheck, Plus, User, Wallet, PanelLeft, Menu, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useApp } from "@/lib/store";
import { useSidebarCollapse } from "@/lib/sidebar-collapse";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

const NAV = [
  { to: "/", label: "Concierge", icon: MessageSquare },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { role, setRole, wallet, addFunds } = useApp();
  const { navCollapsed, toggle } = useSidebarCollapse();
  const location = useLocation();
  const isAdmin = role === "admin";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen w-full flex bg-background overflow-hidden">
      {/* Left rail */}
      <motion.aside
        animate={{ width: navCollapsed ? 0 : 240 }}
        transition={{ type: "spring", stiffness: 260, damping: 32 }}
        className="hidden md:flex shrink-0 border-r border-sidebar-border bg-sidebar flex-col overflow-hidden"
      >
        <div className="px-5 pt-5 pb-4">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-ink flex items-center justify-center shadow-soft">
              <span className="font-display text-accent text-base">K</span>
            </div>
            <div>
              <div className="font-display text-base leading-none">KAIROS</div>
              <div className="text-[10px] tracking-[0.18em] text-muted-foreground">AI · CONCIERGE</div>
            </div>
          </NavLink>
        </div>

        <nav className="px-2 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
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
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                )
              }
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex-1" />

        {/* Role + profile */}
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
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-4 md:px-8 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
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
            {/* Mobile hamburger menu */}
            <Drawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DrawerTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Open menu"
                  className="md:hidden h-9 w-9 rounded-lg hover:bg-muted"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-[85vh]">
                <DrawerHeader className="border-b border-border pb-4">
                  <div className="flex items-center justify-between">
                    <DrawerTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gradient-ink flex items-center justify-center">
                        <span className="font-display text-accent text-sm">K</span>
                      </div>
                      <span className="font-display">KAIROS AI</span>
                    </DrawerTitle>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setMobileMenuOpen(false)}
                      className="h-8 w-8 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </DrawerHeader>
                <nav className="p-4 space-y-1">
                  {NAV.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === "/"}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                        )
                      }
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </NavLink>
                  ))}
                  {isAdmin && (
                    <NavLink
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                        )
                      }
                    >
                      <ShieldCheck className="w-5 h-5" />
                      Admin
                    </NavLink>
                  )}
                </nav>
                <div className="mt-auto p-4 border-t border-border">
                  <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
                      <User className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Alex Mwangi</div>
                      <div className="text-xs text-muted-foreground capitalize">{role}</div>
                    </div>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-ink flex items-center justify-center">
                <span className="font-display text-accent text-sm">K</span>
              </div>
              <span className="font-display">KAIROS AI</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            <span className="font-display text-foreground capitalize">
              {NAV.find((n) => n.to === location.pathname)?.label ?? (location.pathname.startsWith("/admin") ? "Admin" : location.pathname.startsWith("/listing") ? "Listing" : "Concierge")}
            </span>
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
                onClick={() => addFunds(1000)}
                className="h-7 rounded-full text-xs hover:bg-background/10 text-background"
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
