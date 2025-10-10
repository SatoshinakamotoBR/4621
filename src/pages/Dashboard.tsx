import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, DollarSign, Wallet, TrendingUp, Bot } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import StatCard from "@/components/dashboard/StatCard";

const Dashboard = () => {
  const [period, setPeriod] = useState("7");
  const [chartType, setChartType] = useState("day");

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      
      <main className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <div className="glass-card border-b border-glass-border/30 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
              <div className="glass-card p-2 rounded-lg opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
            </div>
            <Button className="bg-primary text-primary-foreground hover:shadow-glow transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo Bot
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Receita Total"
              value="R$ 0.00"
              subtitle="Valor líquido recebido"
              icon={DollarSign}
              iconColor="text-primary"
            />
            <StatCard
              title="Saldo Disponível"
              value="R$ 0.00"
              subtitle="Saldo disponível para saque"
              icon={Wallet}
              iconColor="text-primary"
            />
            <StatCard
              title="Total de Vendas"
              value="0"
              subtitle="Número total de vendas"
              icon={TrendingUp}
              iconColor="text-primary"
            />
            <StatCard
              title="Total de Bots"
              value="1"
              subtitle="Bots cadastrados"
              icon={Bot}
              iconColor="text-primary"
            />
          </div>

          {/* Revenue Chart */}
          <Card className="glass-card border-glass-border/50">
            <CardHeader className="border-b border-glass-border/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-foreground">Receita dos Últimos Dias</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Visão geral do faturamento por período
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-[160px] bg-input border-border text-foreground">
                      <SelectValue placeholder="Selecione período" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="7">Últimos 7 dias</SelectItem>
                      <SelectItem value="15">Últimos 15 dias</SelectItem>
                      <SelectItem value="30">Últimos 30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-[120px] bg-input border-border text-foreground">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="day">Por dia</SelectItem>
                      <SelectItem value="week">Por semana</SelectItem>
                      <SelectItem value="month">Por mês</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="bg-input border-border text-foreground hover:bg-secondary">
                    <Calendar className="w-4 h-4 mr-2" />
                    Personalizado
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Chart Placeholder */}
              <div className="h-[300px] flex items-center justify-center border border-dashed border-glass-border/30 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-primary/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Dados insuficientes para exibir o gráfico
                  </p>
                </div>
              </div>

              {/* Chart Tabs */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-glass-border/30">
                <button className="flex items-center gap-2 text-primary hover:text-primary-glow transition-colors">
                  <TrendingUp className="w-4 h-4" />
                  Receita Bruta
                </button>
                <button className="flex items-center gap-2 text-primary hover:text-primary-glow transition-colors">
                  <TrendingUp className="w-4 h-4" />
                  Receita Líquida
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;