import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/lib/store";
import { SidebarCollapseProvider } from "@/lib/sidebar-collapse";
import { AppShell } from "@/components/kairos/AppShell";
import Concierge from "./pages/Concierge";
import Kairos from "./pages/Kairos";
import Discover from "./pages/Discover";
import ListingDetail from "./pages/ListingDetail";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Agent from "./pages/Agent";
import Finance from "./pages/Finance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <SidebarCollapseProvider>
          <AppShell>
            <Routes>
              <Route path="/" element={<Concierge />} />
              <Route path="/kairos" element={<Kairos />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/finance" element={<Finance />} />
              <Route path="/agent" element={<Agent />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppShell>
          </SidebarCollapseProvider>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
