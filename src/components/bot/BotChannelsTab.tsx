import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Users, Database, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/runtime-client";
import { useToast } from "@/hooks/use-toast";

interface BotChannelsTabProps {
  botId: string;
}

interface ChannelConfig {
  id?: string;
  channel_type: 'vip' | 'registry';
  channel_id: string;
  channel_name: string;
}

const BotChannelsTab = ({ botId }: BotChannelsTabProps) => {
  const { toast } = useToast();
  const [vipChannel, setVipChannel] = useState<ChannelConfig>({
    channel_type: 'vip',
    channel_id: '',
    channel_name: '',
  });
  const [registryChannel, setRegistryChannel] = useState<ChannelConfig>({
    channel_type: 'registry',
    channel_id: '',
    channel_name: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchChannels();
  }, [botId]);

  const fetchChannels = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bot_channels')
        .select('*')
        .eq('bot_id', botId);

      if (error) throw error;

      data?.forEach(channel => {
        if (channel.channel_type === 'vip') {
          setVipChannel({
            id: channel.id,
            channel_type: 'vip',
            channel_id: channel.channel_id,
            channel_name: channel.channel_name || '',
          });
        } else if (channel.channel_type === 'registry') {
          setRegistryChannel({
            id: channel.id,
            channel_type: 'registry',
            channel_id: channel.channel_id,
            channel_name: channel.channel_name || '',
          });
        }
      });
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast({
        title: "Erro ao carregar canais",
        description: "Não foi possível carregar as configurações dos canais",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveChannel = async (channel: ChannelConfig) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const channelData = {
        bot_id: botId,
        user_id: user.id,
        channel_type: channel.channel_type,
        channel_id: channel.channel_id,
        channel_name: channel.channel_name,
        is_active: true,
      };

      if (channel.id) {
        const { error } = await supabase
          .from('bot_channels')
          .update(channelData)
          .eq('id', channel.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bot_channels')
          .insert(channelData);
        if (error) throw error;
      }

      const channelNames = {
        vip: 'VIP',
        registry: 'de Registro'
      };

      toast({
        title: "Canal salvo!",
        description: `Canal ${channelNames[channel.channel_type]} configurado com sucesso`,
      });

      await fetchChannels();
    } catch (error) {
      console.error('Error saving channel:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações do canal",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteChannel = async (channelId: string) => {
    try {
      const { error } = await supabase
        .from('bot_channels')
        .delete()
        .eq('id', channelId);

      if (error) throw error;

      toast({
        title: "Canal removido!",
        description: "O canal foi removido com sucesso",
      });

      await fetchChannels();
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o canal",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Canais do Bot</h2>
        <p className="text-muted-foreground">
          Configure os 2 canais necessários: VIP (para membros) e Registro (suporte + banco de mídia)
        </p>
      </div>

      {/* Canal VIP */}
      <Card className="glass-card border-glass-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Canal VIP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Membros VIP serão automaticamente adicionados a este canal após pagamento aprovado
          </p>
          
          <div className="space-y-2">
            <Label>ID do Canal</Label>
            <Input
              value={vipChannel.channel_id}
              onChange={(e) => setVipChannel({ ...vipChannel, channel_id: e.target.value })}
              placeholder="-1001234567890"
              className="bg-input border-border"
            />
            <p className="text-xs text-muted-foreground">
              Para obter o ID, adicione o bot ao canal e use /getid
            </p>
          </div>

          <div className="space-y-2">
            <Label>Nome do Canal (opcional)</Label>
            <Input
              value={vipChannel.channel_name}
              onChange={(e) => setVipChannel({ ...vipChannel, channel_name: e.target.value })}
              placeholder="Canal VIP Premium"
              className="bg-input border-border"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => saveChannel(vipChannel)}
              disabled={isSaving || !vipChannel.channel_id}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Canal VIP
            </Button>
            {vipChannel.id && (
              <Button
                variant="outline"
                onClick={() => deleteChannel(vipChannel.id!)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Canal de Registro */}
      <Card className="glass-card border-glass-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Canal de Registro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Canal multifuncional: recebe notificações de vendas, uploads de usuários e serve como banco de mídia
          </p>

          <div className="space-y-2">
            <Label>ID do Canal</Label>
            <Input
              value={registryChannel.channel_id}
              onChange={(e) => setRegistryChannel({ ...registryChannel, channel_id: e.target.value })}
              placeholder="-1001234567890"
              className="bg-input border-border"
            />
            <p className="text-xs text-muted-foreground">
              Para obter o ID, adicione o bot ao canal e use /getid
            </p>
          </div>

          <div className="space-y-2">
            <Label>Nome do Canal (opcional)</Label>
            <Input
              value={registryChannel.channel_name}
              onChange={(e) => setRegistryChannel({ ...registryChannel, channel_name: e.target.value })}
              placeholder="Canal de Registro"
              className="bg-input border-border"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => saveChannel(registryChannel)}
              disabled={isSaving || !registryChannel.channel_id}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Canal de Registro
            </Button>
            {registryChannel.id && (
              <Button
                variant="outline"
                onClick={() => deleteChannel(registryChannel.id!)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-primary/5 border-primary/20 p-4">
        <h4 className="font-semibold mb-2">Como funciona:</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• <strong>Canal VIP:</strong> Membros pagos são adicionados automaticamente após pagamento</li>
          <li>• <strong>Canal de Registro:</strong> Recebe notificações, uploads e armazena mídia como banco de dados</li>
          <li>• <strong>Vantagem:</strong> Telegram funciona como CDN gratuito para suas mídias</li>
          <li>• O bot deve ser administrador nos 2 canais</li>
          <li>• Use /getid no canal para obter o ID (deve começar com -100)</li>
        </ul>
      </Card>
    </div>
  );
};

export default BotChannelsTab;
