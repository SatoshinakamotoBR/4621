import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bot,
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Share2,
  CreditCard,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Send,
} from "lucide-react";

const DashboardSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: "Visão Geral", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Meus Bots", icon: Bot, href: "/dashboard/bots" },
    { name: "Minhas Vendas", icon: ShoppingBag, href: "/dashboard/vendas" },
    { name: "Relatórios", icon: FileText, href: "/dashboard/relatorios" },
    { name: "Auto Posts", icon: Send, href: "/dashboard/auto-posts" },
    { name: "Indique e Ganhe", icon: Share2, href: "/dashboard/indicacoes" },
    { name: "Financeiro", icon: CreditCard, href: "/dashboard/financeiro" },
    { name: "Tutoriais", icon: BookOpen, href: "/dashboard/tutoriais" },
    { name: "Configurações", icon: Settings, href: "/dashboard/configuracoes" },
  ];

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 glass-card p-2 rounded-lg"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary" />
        ) : (
          <Menu className="w-6 h-6 text-primary" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 glass-card border-r border-glass-border/30
          transform transition-transform duration-300 z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-glass-border/30">
            <Link to="/" className="flex items-center gap-3">
              <div className="glass-card p-2 rounded-lg">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold hero-gradient">Botly</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
                    ${
                      isActive
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-glass-border/30">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10 border-2 border-primary/30">
                <AvatarFallback className="bg-primary/20 text-primary">
                  W
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  wanderson
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  wanderson@gmail.com
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-border text-muted-foreground hover:text-destructive hover:border-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default DashboardSidebar;