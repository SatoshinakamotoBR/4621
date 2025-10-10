import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MessageSquare, DollarSign, TrendingUp, TrendingDown, Zap, Mail, Settings, Eye, Upload } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/integrations/supabase/runtime-client";
import { useToast } from "@/hooks/use-toast";
import BotMessagesTab from "@/components/bot/BotMessagesTab";
import BotPlansTab from "@/components/bot/BotPlansTab";
import BotAutomationTab from "@/components/bot/BotAutomationTab";
import BotDownsellTab from "@/components/bot/BotDownsellTab";
import BotUploadTab from "@/components/bot/BotUploadTab";
import BotConfigTab from "@/components/bot/BotConfigTab";

const BotManagement = () => {
  const { botId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bot, setBot] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (botId) {
      fetchBot();
    }
  }, [botId]);

  const fetchBot = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('telegram_bots')
        .select('id, user_id, bot_name, bot_username, is_active')
        .eq('id', botId)
        .maybeSingle();

      if (error) throw error;
      setBot(data);
    } catch (error) {
      console.error('Error fetching bot:', error);
      toast({
        title: "Erro ao carregar bot",
        description: "Não foi possível carregar as informações do bot",
        variant: "destructive",
      });
      navigate('/dashboard/bots');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <DashboardSidebar />
        <main className="flex-1 lg:ml-64 p-6">
          <div className="text-center text-muted-foreground">Carregando...</div>
        </main>
      </div>
    );
  }

  if (!bot) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      
      <main className="flex-1 lg:ml-64">
        {/* Header */}
        <div className="glass-card border-b border-glass-border/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard/bots')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{bot.bot_name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">@{bot.bot_username}</span>
                    {bot.is_active && (
                      <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                        Ativo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Button className="gap-2">
              <Eye className="w-4 h-4" />
              Ver no Telegram
            </Button>
            <Button 
              className="gap-2 ml-2"
              variant="outline"
              onClick={() => navigate(`/dashboard/bots/${botId}/scheduled`)}
            >
              <Settings className="w-4 h-4" />
              Mensagens Agendadas
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs defaultValue="messages" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-card/50 border border-border">
              <TabsTrigger value="messages" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Mensagens
              </TabsTrigger>
              <TabsTrigger value="plans" className="gap-2">
                <DollarSign className="w-4 h-4" />
                Planos
              </TabsTrigger>
              <TabsTrigger value="upsell" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                UpSell
              </TabsTrigger>
              <TabsTrigger value="downsell" className="gap-2">
                <TrendingDown className="w-4 h-4" />
                DownSell
              </TabsTrigger>
              <TabsTrigger value="automation" className="gap-2">
                <Zap className="w-4 h-4" />
                Automação
              </TabsTrigger>
              <TabsTrigger value="remarketing" className="gap-2">
                <Mail className="w-4 h-4" />
                Remarketing
              </TabsTrigger>
              <TabsTrigger value="config" className="gap-2">
                <Settings className="w-4 h-4" />
                Config
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="mt-6">
              <BotMessagesTab botId={botId!} />
            </TabsContent>

            <TabsContent value="plans" className="mt-6">
              <BotPlansTab botId={botId!} />
            </TabsContent>

            <TabsContent value="upsell" className="mt-6">
              <Card className="glass-card border-glass-border/50 p-6">
                <h2 className="text-xl font-semibold mb-4">Configurar UpSell</h2>
                <p className="text-muted-foreground">Em desenvolvimento...</p>
              </Card>
            </TabsContent>

            <TabsContent value="downsell" className="mt-6">
              <BotDownsellTab botId={botId!} />
            </TabsContent>

            <TabsContent value="automation" className="mt-6">
              <BotAutomationTab botId={botId!} />
            </TabsContent>

            <TabsContent value="remarketing" className="mt-6">
              <Card className="glass-card border-glass-border/50 p-6">
                <h2 className="text-xl font-semibold mb-4">Remarketing</h2>
                <p className="text-muted-foreground">Em desenvolvimento...</p>
              </Card>
            </TabsContent>

            <TabsContent value="config" className="mt-6">
              <BotConfigTab botId={botId!} />
            </TabsContent>

            <TabsContent value="upload" className="mt-6">
              <BotUploadTab botId={botId!} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default BotManagement;
