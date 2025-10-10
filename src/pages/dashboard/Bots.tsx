import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Plus, Trash2, Power, Settings } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ConnectBotDialog from "@/components/bot/ConnectBotDialog";
import { supabase } from "@/integrations/supabase/runtime-client";
import { useToast } from "@/hooks/use-toast";

const Bots = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bots, setBots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBots = async () => {
    try {
      const { data, error } = await supabase
        .from('telegram_bots')
        .select('id, user_id, bot_name, bot_username, is_active, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBots(data || []);
    } catch (error) {
      console.error('Error fetching bots:', error);
      toast({
        title: "Erro ao carregar bots",
        description: "Não foi possível carregar seus bots",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const handleDeleteBot = async (botId: string) => {
    try {
      const { error } = await supabase
        .from('telegram_bots')
        .delete()
        .eq('id', botId);

      if (error) throw error;

      toast({
        title: "Bot removido",
        description: "Bot removido com sucesso",
      });
      fetchBots();
    } catch (error) {
      console.error('Error deleting bot:', error);
      toast({
        title: "Erro ao remover bot",
        description: "Não foi possível remover o bot",
        variant: "destructive",
      });
    }
  };

  const handleToggleBot = async (botId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('telegram_bots')
        .update({ is_active: !currentStatus })
        .eq('id', botId);

      if (error) throw error;

      toast({
        title: currentStatus ? "Bot desativado" : "Bot ativado",
        description: currentStatus ? "O bot foi desativado" : "O bot foi ativado",
      });
      fetchBots();
    } catch (error) {
      console.error('Error toggling bot:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do bot",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      
      <main className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <div className="glass-card border-b border-glass-border/30 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Meus Bots</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie seus bots do Telegram
              </p>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary text-primary-foreground hover:shadow-glow transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Conectar Bot
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <Card className="glass-card border-glass-border/50">
              <CardContent className="p-12">
                <div className="text-center text-muted-foreground">
                  Carregando bots...
                </div>
              </CardContent>
            </Card>
          ) : bots.length === 0 ? (
            <Card className="glass-card border-glass-border/50">
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
                  <div className="relative">
                    <div className="glass-card p-8 rounded-2xl">
                      <Bot className="w-24 h-24 text-primary" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 glass-card p-2 rounded-lg animate-pulse">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">
                      Nenhum bot conectado ainda
                    </h2>
                    <p className="text-muted-foreground">
                      Conecte seu primeiro bot para começar a automatizar suas vendas
                    </p>
                  </div>

                  <Button 
                    size="lg"
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-primary text-primary-foreground hover:shadow-glow transition-all duration-300 mt-4"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Conectar Primeiro Bot
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.map((bot) => (
                <Card key={bot.id} className="glass-card border-glass-border/50 hover:border-primary/30 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="glass-card p-3 rounded-lg">
                          <Bot className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{bot.bot_name}</h3>
                          <p className="text-sm text-muted-foreground">@{bot.bot_username}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        bot.is_active 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {bot.is_active ? 'Ativo' : 'Inativo'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/dashboard/bots/${bot.id}`)}
                        className="w-full"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Gerenciar
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleBot(bot.id, bot.is_active)}
                          className="flex-1 border-border"
                        >
                          <Power className="w-4 h-4 mr-2" />
                          {bot.is_active ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteBot(bot.id)}
                          className="border-destructive text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <ConnectBotDialog 
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSuccess={fetchBots}
        />
      </main>
    </div>
  );
};

export default Bots;