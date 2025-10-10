import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2, Calendar } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/integrations/supabase/runtime-client";
import { useToast } from "@/hooks/use-toast";
import { channelIdSchema, messageSchema } from "@/lib/validations";

const AutoPosts = () => {
  const { toast } = useToast();
  const [bots, setBots] = useState<any[]>([]);
  const [selectedBot, setSelectedBot] = useState("");
  const [channelId, setChannelId] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errors, setErrors] = useState<{ channelId?: string; message?: string }>({});

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('telegram_bots')
        .select('id, user_id, bot_name, bot_username, is_active, created_at, updated_at')
        .eq('is_active', true)
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

  const validateForm = () => {
    const newErrors: { channelId?: string; message?: string } = {};

    const channelResult = channelIdSchema.safeParse(channelId.trim());
    if (!channelResult.success) {
      newErrors.channelId = channelResult.error.issues[0].message;
    }

    const messageResult = messageSchema.safeParse(message.trim());
    if (!messageResult.success) {
      newErrors.message = messageResult.error.issues[0].message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendMessage = async () => {
    if (!selectedBot) {
      toast({
        title: "Bot não selecionado",
        description: "Selecione um bot antes de enviar",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('telegram-bot', {
        body: {
          action: 'send_message',
          botId: selectedBot,
          channelId: channelId.trim(),
          message: message.trim(),
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Save to auto_posts table
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from('auto_posts').insert({
          user_id: user.id,
          bot_id: selectedBot,
          message: message.trim(),
          channel_id: channelId.trim(),
          status: 'sent',
          sent_at: new Date().toISOString(),
        });
      }

      toast({
        title: "Mensagem enviada!",
        description: "Sua mensagem foi enviada com sucesso",
      });

      setMessage("");
      setChannelId("");
      setErrors({});
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      
      <main className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <div className="glass-card border-b border-glass-border/30 p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Auto Posts</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Envie mensagens automáticas pelo Telegram
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <Card className="glass-card border-glass-border/50 max-w-3xl mx-auto">
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">
                  Carregando...
                </div>
              ) : bots.length === 0 ? (
                <div className="text-center py-8">
                  <Send className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Nenhum bot ativo
                  </h3>
                  <p className="text-muted-foreground">
                    Conecte e ative um bot primeiro para enviar mensagens
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="bot" className="text-foreground">
                      Selecione o Bot
                    </Label>
                    <Select value={selectedBot} onValueChange={setSelectedBot}>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Escolha um bot" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {bots.map((bot) => (
                          <SelectItem key={bot.id} value={bot.id}>
                            {bot.bot_name} (@{bot.bot_username})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="channelId" className="text-foreground">
                      ID do Canal/Grupo
                    </Label>
                    <Input
                      id="channelId"
                      value={channelId}
                      onChange={(e) => {
                        setChannelId(e.target.value);
                        setErrors(prev => ({ ...prev, channelId: undefined }));
                      }}
                      placeholder="-1001234567890 ou @meucanal"
                      className="bg-input border-border text-foreground"
                    />
                    {errors.channelId && (
                      <p className="text-sm text-destructive">{errors.channelId}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Use o ID numérico ou @username do canal/grupo
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-foreground">
                      Mensagem
                    </Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        setErrors(prev => ({ ...prev, message: undefined }));
                      }}
                      placeholder="Digite sua mensagem..."
                      rows={8}
                      className="bg-input border-border text-foreground resize-none"
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">{errors.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Suporta formatação HTML básica: &lt;b&gt;negrito&lt;/b&gt;, &lt;i&gt;itálico&lt;/i&gt; (máx. 4096 caracteres)
                    </p>
                  </div>

                  <Button
                    onClick={handleSendMessage}
                    disabled={isSending || !selectedBot || !channelId || !message}
                    className="w-full bg-primary text-primary-foreground hover:shadow-glow transition-all duration-300"
                  >
                    {isSending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AutoPosts;