import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
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
import AdminBookings from "./pages/AdminBookings";
import AdminNewsletter from "./pages/AdminNewsletter";
import Travel from "./pages/Travel";
import Checkout from "./pages/Checkout";
import Kyc from "./pages/Kyc";
import Kyb from "./pages/Kyb";
import AdminKyc from "./pages/AdminKyc";
import AdminApprovals from "./pages/AdminApprovals";
import AgentListings from "./pages/AgentListings";
import ListIndex from "./pages/list/ListIndex";
import ListProperty from "./pages/list/ListProperty";
import ListHotel from "./pages/list/ListHotel";
import ListExperience from "./pages/list/ListExperience";
import ListLifestyle from "./pages/list/ListLifestyle";
import ListTravel from "./pages/list/ListTravel";
import ListSuccess from "./pages/list/ListSuccess";
import { Login, Register } from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { RequireAuth } from "./components/RequireAuth";

const queryClient = new QueryClient();

const ShellRoutes = () => {
  const { pathname } = useLocation();
  const bare = pathname === "/login" || pathname === "/register";
  const inner = (
    <Routes>
      <Route path="/" element={<RequireAuth><Concierge /></RequireAuth>} />
      <Route path="/kairos" element={<Kairos />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/travel" element={<Travel />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/listing/:id" element={<ListingDetail />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/kyc" element={<Kyc />} />
      <Route path="/kyb" element={<Kyb />} />
      <Route path="/list" element={<ListIndex />} />
      <Route path="/list/property" element={<ListProperty />} />
      <Route path="/list/hotel" element={<ListHotel />} />
      <Route path="/list/experience" element={<ListExperience />} />
      <Route path="/list/lifestyle" element={<ListLifestyle />} />
      <Route path="/list/travel" element={<ListTravel />} />
      <Route path="/list/success" element={<ListSuccess />} />
      <Route path="/agent/listings" element={<AgentListings />} />
      <Route path="/admin/approvals" element={<AdminApprovals />} />
      <Route path="/admin/kyc" element={<AdminKyc />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/finance" element={<Finance />} />
      <Route path="/admin/bookings" element={<AdminBookings />} />
      <Route path="/admin/newsletter" element={<AdminNewsletter />} />
      <Route path="/agent" element={<Agent />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
  return bare ? inner : <AppShell>{inner}</AppShell>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <SidebarCollapseProvider>
            <ShellRoutes />
          </SidebarCollapseProvider>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
