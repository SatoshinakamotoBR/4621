import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Trash2, Plus, Loader as Loader2 } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MediaUploader from "@/components/shared/MediaUploader";
import { supabase } from "@/integrations/supabase/runtime-client";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "react-router-dom";

interface ScheduledMessage {
  id: string;
  message_text: string;
  delay_minutes: number;
  media_url: string | null;
  media_type: string | null;
  button_text: string | null;
  button_url: string | null;
  is_active: boolean;
}

const ScheduledMessages = () => {
  const { toast } = useToast();
  const { botId } = useParams();
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [messageText, setMessageText] = useState("");
  const [delayMinutes, setDelayMinutes] = useState("5");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<string>("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");

  useEffect(() => {
    if (botId) {
      fetchMessages();
    }
  }, [botId]);

  const fetchMessages = async () => {
    if (!botId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scheduled_messages')
        .select('*')
        .eq('bot_id', botId)
        .order('delay_minutes', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens agendadas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaUploaded = (url: string, type: 'photo' | 'video') => {
    setMediaUrl(url);
    setMediaType(type);
  };

  const handleAddMessage = async () => {
    if (!botId || !messageText.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a mensagem",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('scheduled_messages')
        .insert({
          bot_id: botId,
          user_id: user.id,
          message_text: messageText.trim(),
          delay_minutes: parseInt(delayMinutes),
          media_url: mediaUrl.trim() || null,
          media_type: mediaType || null,
          button_text: buttonText.trim() || null,
          button_url: buttonUrl.trim() || null,
        });

      if (error) throw error;

      toast({
        title: "Mensagem adicionada!",
        description: `Será enviada ${delayMinutes} minutos após /start`,
      });

      // Reset form
      setMessageText("");
      setMediaUrl("");
      setMediaType("");
      setButtonText("");
      setButtonUrl("");
      setDelayMinutes("5");

      fetchMessages();
    } catch (error) {
      console.error('Error adding message:', error);
      toast({
        title: "Erro ao adicionar mensagem",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Mensagem removida",
        description: "A mensagem agendada foi removida",
      });

      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Erro ao remover mensagem",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('scheduled_messages')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: !currentState ? "Mensagem ativada" : "Mensagem desativada",
      });

      fetchMessages();
    } catch (error) {
      console.error('Error toggling message:', error);
      toast({
        title: "Erro ao atualizar mensagem",
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
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mensagens Agendadas</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Configure mensagens para enviar automaticamente após /start
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Add Message Form */}
          <Card className="glass-card border-glass-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nova Mensagem Agendada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="delay">Tempo de Espera (minutos)</Label>
                <Select value={delayMinutes} onValueChange={setDelayMinutes}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="5">5 minutos</SelectItem>
                    <SelectItem value="10">10 minutos</SelectItem>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="20">20 minutos</SelectItem>
                    <SelectItem value="25">25 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="180">3 horas</SelectItem>
                    <SelectItem value="240">4 horas</SelectItem>
                    <SelectItem value="360">6 horas</SelectItem>
                    <SelectItem value="720">12 horas</SelectItem>
                    <SelectItem value="1440">24 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <MediaUploader
                botId={botId!}
                onMediaUploaded={handleMediaUploaded}
                currentMediaUrl={mediaUrl}
                currentMediaType={mediaType}
              />

              <div className="space-y-2">
                <Label htmlFor="messageText">Mensagem *</Label>
                <Textarea
                  id="messageText"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Digite a mensagem..."
                  rows={4}
                  className="bg-input border-border resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Texto do Botão (opcional)</Label>
                  <Input
                    id="buttonText"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Clique aqui"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buttonUrl">URL do Botão (opcional)</Label>
                  <Input
                    id="buttonUrl"
                    value={buttonUrl}
                    onChange={(e) => setButtonUrl(e.target.value)}
                    placeholder="https://exemplo.com"
                    className="bg-input border-border"
                  />
                </div>
              </div>

              <Button
                onClick={handleAddMessage}
                disabled={isSaving || !messageText.trim()}
                className="w-full bg-primary hover:shadow-glow"
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Mensagem
              </Button>
            </CardContent>
          </Card>

          {/* Messages List */}
          <Card className="glass-card border-glass-border/50">
            <CardHeader>
              <CardTitle>Mensagens Configuradas</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Nenhuma mensagem agendada
                  </h3>
                  <p className="text-muted-foreground">
                    Adicione sua primeira mensagem agendada acima
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <Card key={msg.id} className={`border-border/50 ${!msg.is_active ? 'opacity-50' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              <span className="font-semibold">
                                {msg.delay_minutes} minutos após /start
                              </span>
                              {msg.media_type && (
                                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                                  {msg.media_type === 'photo' ? '📷 Imagem' : 
                                   msg.media_type === 'video' ? '🎥 Vídeo' : '📄 Documento'}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {msg.message_text}
                            </p>
                            {msg.button_text && (
                              <div className="text-xs text-muted-foreground">
                                🔘 Botão: {msg.button_text}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(msg.id, msg.is_active)}
                              className="border-border"
                            >
                              {msg.is_active ? 'Desativar' : 'Ativar'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteMessage(msg.id)}
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ScheduledMessages;
