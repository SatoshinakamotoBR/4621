import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/runtime-client";
import { Loader2, Users, MessageCircle, Save } from "lucide-react";
import { botTokenSchema, botNameSchema, channelIdSchema } from "@/lib/validations";
import { useWebhookManager } from "@/hooks/useWebhookManager";

interface BotConfigTabProps {
  botId: string;
}

const BotConfigTab = ({ botId }: BotConfigTabProps) => {
  const { toast } = useToast();
  const { updateWebhook, isUpdating } = useWebhookManager();
  const [isLoading, setIsLoading] = useState(false);
  const [botName, setBotName] = useState("");
  const [botToken, setBotToken] = useState("");
  const [vipChannelId, setVipChannelId] = useState("");
  const [supportChannelId, setSupportChannelId] = useState("");
  const [errors, setErrors] = useState<{
    botToken?: string;
    botName?: string;
    vipChannelId?: string;
    supportChannelId?: string;
  }>({});

  useEffect(() => {
    fetchBotConfig();
  }, [botId]);

  const fetchBotConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('telegram_bots')
        .select('bot_name, vip_channel_id, support_channel_id')
        .eq('id', botId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setBotName(data.bot_name || "");
        setVipChannelId(data.vip_channel_id || "");
        setSupportChannelId(data.support_channel_id || "");
      }

      // Fetch bot token securely via RPC (owner-only)
      const { data: token, error: tokenError } = await supabase.rpc('get_bot_token', { bot_id_param: botId });
      if (!tokenError && token) {
        setBotToken(token);
      }
    } catch (error) {
      console.error('Error fetching bot config:', error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações do bot",
        variant: "destructive",
      });
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    const tokenResult = botTokenSchema.safeParse(botToken.trim());
    if (!tokenResult.success) {
      newErrors.botToken = tokenResult.error.issues[0].message;
    }
    
    if (botName.trim()) {
      const nameResult = botNameSchema.safeParse(botName.trim());
      if (!nameResult.success) {
        newErrors.botName = nameResult.error.issues[0].message;
      }
    }
    
    if (!vipChannelId.trim()) {
      newErrors.vipChannelId = "Canal VIP é obrigatório";
    } else {
      const vipResult = channelIdSchema.safeParse(vipChannelId.trim());
      if (!vipResult.success) {
        newErrors.vipChannelId = vipResult.error.issues[0].message;
      }
    }
    
    if (!supportChannelId.trim()) {
      newErrors.supportChannelId = "Canal de Suporte é obrigatório";
    } else {
      const supportResult = channelIdSchema.safeParse(supportChannelId.trim());
      if (!supportResult.success) {
        newErrors.supportChannelId = supportResult.error.issues[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Update bot configuration
      const { error: updateError } = await supabase
        .from('telegram_bots')
        .update({
          bot_name: botName.trim(),
          bot_token: botToken.trim(),
          vip_channel_id: vipChannelId.trim(),
          support_channel_id: supportChannelId.trim(),
        })
        .eq('id', botId);

      if (updateError) throw updateError;

      // Reconfigure webhook
      const webhookResult = await updateWebhook(botId);
      if (!webhookResult.success) {
        throw new Error('Falha ao atualizar webhook');
      }

      toast({
        title: "Configurações salvas!",
        description: "Bot configurado e pronto para receber mensagens",
      });
      
      fetchBotConfig();
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card border-glass-border/50 p-6">
      <h2 className="text-xl font-semibold mb-6 text-foreground">Configurações do Bot</h2>
      
      <div className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="botName" className="text-foreground">
            Nome do Bot
          </Label>
          <Input
            id="botName"
            value={botName}
            onChange={(e) => {
              setBotName(e.target.value);
              setErrors(prev => ({ ...prev, botName: undefined }));
            }}
            placeholder="Meu Bot"
            className="bg-input border-border text-foreground"
          />
          {errors.botName && <p className="text-sm text-destructive">{errors.botName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="botToken" className="text-foreground">
            Token do Bot *
          </Label>
          <Input
            id="botToken"
            value={botToken}
            onChange={(e) => {
              setBotToken(e.target.value);
              setErrors(prev => ({ ...prev, botToken: undefined }));
            }}
            placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
            className="bg-input border-border text-foreground"
            type="password"
          />
          {errors.botToken && <p className="text-sm text-destructive">{errors.botToken}</p>}
          <p className="text-xs text-muted-foreground">
            Token obtido do @BotFather no Telegram
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vipChannelId" className="text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />
            ID do Canal VIP *
          </Label>
          <Input
            id="vipChannelId"
            value={vipChannelId}
            onChange={(e) => {
              setVipChannelId(e.target.value);
              setErrors(prev => ({ ...prev, vipChannelId: undefined }));
            }}
            placeholder="-1001234567890"
            className="bg-input border-border text-foreground"
          />
          {errors.vipChannelId && <p className="text-sm text-destructive">{errors.vipChannelId}</p>}
          <p className="text-xs text-muted-foreground">
            Canal onde os clientes serão adicionados após pagamento
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supportChannelId" className="text-foreground flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            ID do Canal de Suporte/Registro *
          </Label>
          <Input
            id="supportChannelId"
            value={supportChannelId}
            onChange={(e) => {
              setSupportChannelId(e.target.value);
              setErrors(prev => ({ ...prev, supportChannelId: undefined }));
            }}
            placeholder="-1001234567890"
            className="bg-input border-border text-foreground"
          />
          {errors.supportChannelId && <p className="text-sm text-destructive">{errors.supportChannelId}</p>}
          <p className="text-xs text-muted-foreground">
            Canal que receberá notificações de vendas, uploads e registros
          </p>
        </div>

        <Button
          onClick={handleSave} 
          disabled={isLoading || isUpdating}
          className="bg-primary text-primary-foreground hover:shadow-glow transition-all duration-300"
        >
          {(isLoading || isUpdating) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" />
          {isUpdating ? 'Atualizando webhook...' : 'Salvar Configurações'}
        </Button>
      </div>
    </Card>
  );
};

export default BotConfigTab;
