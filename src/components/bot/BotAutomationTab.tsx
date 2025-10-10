import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Save, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/runtime-client";
import { useToast } from "@/hooks/use-toast";

interface BotAutomationTabProps {
  botId: string;
}

interface AutomationConfig {
  id?: string;
  send_welcome: boolean;
  send_thank_you: boolean;
  send_expiration_reminder: boolean;
  expiration_reminder_days: number;
  auto_remove_expired: boolean;
}

const BotAutomationTab = ({ botId }: BotAutomationTabProps) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<AutomationConfig>({
    send_welcome: true,
    send_thank_you: true,
    send_expiration_reminder: true,
    expiration_reminder_days: 3,
    auto_remove_expired: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [botId]);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bot_automation_config')
        .select('*')
        .eq('bot_id', botId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching automation config:', error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações de automação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const configData = {
        bot_id: botId,
        user_id: user.id,
        send_welcome: config.send_welcome,
        send_thank_you: config.send_thank_you,
        send_expiration_reminder: config.send_expiration_reminder,
        expiration_reminder_days: config.expiration_reminder_days,
        auto_remove_expired: config.auto_remove_expired,
      };

      if (config.id) {
        const { error } = await supabase
          .from('bot_automation_config')
          .update(configData)
          .eq('id', config.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('bot_automation_config')
          .insert(configData)
          .select()
          .single();
        if (error) throw error;
        setConfig({ ...config, id: data.id });
      }

      toast({
        title: "Configurações salvas!",
        description: "As configurações de automação foram salvas com sucesso",
      });
    } catch (error) {
      console.error('Error saving automation config:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card border-glass-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Configurações de Automação
          </CardTitle>
          <CardDescription>
            Configure quando o bot deve enviar mensagens automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
            <div className="space-y-0.5">
              <Label className="text-base">Enviar Mensagem de Boas-vindas</Label>
              <p className="text-sm text-muted-foreground">
                Enviar automaticamente quando o usuário entrar no canal
              </p>
            </div>
            <Switch
              checked={config.send_welcome}
              onCheckedChange={(checked) => setConfig({ ...config, send_welcome: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
            <div className="space-y-0.5">
              <Label className="text-base">Enviar Mensagem de Agradecimento</Label>
              <p className="text-sm text-muted-foreground">
                Enviar quando o pagamento for confirmado
              </p>
            </div>
            <Switch
              checked={config.send_thank_you}
              onCheckedChange={(checked) => setConfig({ ...config, send_thank_you: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
            <div className="space-y-0.5">
              <Label className="text-base">Lembrete de Expiração</Label>
              <p className="text-sm text-muted-foreground">
                Enviar lembrete antes do plano expirar
              </p>
            </div>
            <Switch
              checked={config.send_expiration_reminder}
              onCheckedChange={(checked) => setConfig({ ...config, send_expiration_reminder: checked })}
            />
          </div>

          {config.send_expiration_reminder && (
            <div className="ml-4 p-4 rounded-lg border border-border bg-card/30">
              <Label>Dias antes da expiração</Label>
              <Input
                type="number"
                min="1"
                max="30"
                value={config.expiration_reminder_days}
                onChange={(e) => setConfig({ ...config, expiration_reminder_days: parseInt(e.target.value) })}
                className="mt-2 max-w-[200px] bg-input border-border"
              />
              <p className="text-xs text-muted-foreground mt-2">
                O bot enviará o lembrete {config.expiration_reminder_days} dias antes do plano expirar
              </p>
            </div>
          )}

          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
            <div className="space-y-0.5">
              <Label className="text-base">Remover Automaticamente Após Expiração</Label>
              <p className="text-sm text-muted-foreground">
                Remover usuário do canal quando o plano expirar
              </p>
            </div>
            <Switch
              checked={config.auto_remove_expired}
              onCheckedChange={(checked) => setConfig({ ...config, auto_remove_expired: checked })}
            />
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-glass-border/50 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="space-y-2">
              <h3 className="font-semibold">Dica de Automação</h3>
              <p className="text-sm text-muted-foreground">
                Configure suas mensagens na aba "Mensagens" antes de ativar as automações.
                Isso garante que seus usuários recebam as informações corretas no momento certo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BotAutomationTab;
