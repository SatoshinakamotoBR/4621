import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Bots from "./pages/dashboard/Bots";
import AutoPosts from "./pages/dashboard/AutoPosts";
import BotManagement from "./pages/dashboard/BotManagement";
import ScheduledMessages from "./pages/dashboard/ScheduledMessages";
import NotFound from "./pages/NotFound";

// Force rebuild to reload environment variables
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/bots" element={<ProtectedRoute><Bots /></ProtectedRoute>} />
            <Route path="/dashboard/bots/:botId" element={<ProtectedRoute><BotManagement /></ProtectedRoute>} />
            <Route path="/dashboard/bots/:botId/scheduled" element={<ProtectedRoute><ScheduledMessages /></ProtectedRoute>} />
            <Route path="/dashboard/auto-posts" element={<ProtectedRoute><AutoPosts /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
