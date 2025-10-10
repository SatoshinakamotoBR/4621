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

// Função para validar UUID
const isValidUUID = (uuid: string | undefined): boolean => {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const BotManagement = () => {
  const { botId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bot, setBot] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Validar UUID antes de fazer requisição
    if (!isValidUUID(botId)) {
      toast({
        title: "ID de bot inválido",
        description: "O ID do bot fornecido não é um UUID válido.",
        variant: "destructive",
      });
      navigate('/dashboard/bots');
      return;
    }

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
      
      // Verificar se o bot foi encontrado
      if (!data) {
        toast({
          title: "Bot não encontrado",
          description: `Não foi possível encontrar um bot com o ID ${botId}. Verifique se o ID está correto e se você tem permissão para acessá-lo.`,
          variant: "destructive",
        });
        navigate('/dashboard/bots');
        return;
      }

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
    return (
      <div className="min-h-screen bg-background flex">
        <DashboardSidebar />
        <main className="flex-1 lg:ml-64 p-6">
          <div className="text-center text-muted-foreground">
            <p>Bot não encontrado.</p>
            <Button onClick={() => navigate('/dashboard/bots')} className="mt-4">
              Voltar para lista de bots
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <main className="flex-1 lg:ml-64 p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/bots')}
            className="mb-4 hover:bg-glass-light"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">{bot?.bot_name || 'Bot'}</h1>
        </div>

        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList className="glass-card border-glass-border/50 inline-flex">
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Mensagens
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Planos
            </TabsTrigger>
            <TabsTrigger value="upsell" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              UpSell
            </TabsTrigger>
            <TabsTrigger value="downsell" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              DownSell
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Automação
            </TabsTrigger>
            <TabsTrigger value="remarketing" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Remarketing
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Config
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
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
      </main>
    </div>
  );
};

export default BotManagement;
