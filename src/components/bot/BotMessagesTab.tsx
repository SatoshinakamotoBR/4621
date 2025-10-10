import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Save } from "lucide-react";
import MediaUploader from "@/components/shared/MediaUploader";
import { supabase } from "@/integrations/supabase/runtime-client";
import { useToast } from "@/hooks/use-toast";

interface BotMessagesTabProps {
  botId: string;
}

interface BotMessage {
  id?: string;
  message_type: string;
  message_text: string;
  media_url?: string;
  media_type?: string;
  selected_plans?: string[];
}

interface BotPlan {
  id: string;
  plan_name: string;
  price: number;
  duration_days: number;
}

// Função para normalizar media_type
const normalizeMediaType = (type: 'photo' | 'video' | 'audio' | 'document' | string | null | undefined): 'image' | 'video' | 'audio' | null => {
  if (!type) return null;
  if (type === 'photo') return 'image';
  if (type === 'video') return 'video';
  if (type === 'audio') return 'audio';
  return null; // document or any other type returns null
};

const BotMessagesTab = ({
  botId
}: BotMessagesTabProps) => {
  const {
    toast
  } = useToast();
  const [messages, setMessages] = useState<Record<string, BotMessage>>({
    welcome: {
      message_type: 'welcome',
      message_text: '',
      selected_plans: []
    },
    thank_you: {
      message_type: 'thank_you',
      message_text: '',
      selected_plans: []
    },
    expiration: {
      message_type: 'expiration',
      message_text: '',
      selected_plans: []
    }
  });
  const [availablePlans, setAvailablePlans] = useState<BotPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchPlans();
  }, [botId]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.from('bot_messages').select('*').eq('bot_id', botId).in('message_type', ['welcome', 'thank_you', 'expiration']);
      if (error) throw error;
      const messagesMap: Record<string, BotMessage> = {
        welcome: {
          message_type: 'welcome',
          message_text: '',
          selected_plans: []
        },
        thank_you: {
          message_type: 'thank_you',
          message_text: '',
          selected_plans: []
        },
        expiration: {
          message_type: 'expiration',
          message_text: '',
          selected_plans: []
        }
      };

      // Buscar planos selecionados para cada mensagem
      for (const msg of data || []) {
        const {
          data: planData
        } = await supabase.from('bot_message_plans').select('bot_plan_id').eq('bot_message_id', msg.id);
        messagesMap[msg.message_type] = {
          ...msg,
          selected_plans: planData?.map(p => p.bot_plan_id) || []
        };
      }
      setMessages(messagesMap);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens do bot",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('bot_plans').select('*').eq('bot_id', botId).eq('is_active', true);
      if (error) throw error;
      setAvailablePlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleSaveMessage = async (messageType: string) => {
    setIsSaving(true);
    try {
      const message = messages[messageType];
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const messageData = {
        bot_id: botId,
        user_id: user.id,
        message_type: messageType,
        message_text: message.message_text,
        media_url: message.media_url || null,
        media_type: normalizeMediaType(message.media_type)
      };
      let messageId = message.id;
      if (message.id) {
        const {
          error
        } = await supabase.from('bot_messages').update(messageData).eq('id', message.id);
        if (error) throw error;
      } else {
        const {
          data,
          error
        } = await supabase.from('bot_messages').insert(messageData).select().single();
        if (error) throw error;
        messageId = data.id;
        setMessages(prev => ({
          ...prev,
          [messageType]: {
            ...prev[messageType],
            id: data.id
          }
        }));
      }

      // Atualizar planos selecionados
      if (messageId) {
        // Deletar planos existentes
        await supabase.from('bot_message_plans').delete().eq('bot_message_id', messageId);

        // Inserir novos planos selecionados
        if (message.selected_plans && message.selected_plans.length > 0) {
          const planInserts = message.selected_plans.map(planId => ({
            bot_message_id: messageId,
            bot_plan_id: planId
          }));
          const {
            error: plansError
          } = await supabase.from('bot_message_plans').insert(planInserts);
          if (plansError) throw plansError;
        }
      }
      toast({
        title: "Mensagem salva!",
        description: "As alterações foram salvas com sucesso"
      });
    } catch (error) {
      console.error('Error saving message:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a mensagem",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

const handleMediaUploaded = (messageType: string, url: string, type: 'photo' | 'video' | 'audio' | 'document') => {
    setMessages(prev => ({
      ...prev,
      [messageType]: {
        ...prev[messageType],
        media_url: url,
        media_type: normalizeMediaType(type)
      }
    }));
  };

  const togglePlanSelection = (messageType: string, planId: string) => {
    setMessages(prev => {
      const currentPlans = prev[messageType].selected_plans || [];
      const isSelected = currentPlans.includes(planId);
      return {
        ...prev,
        [messageType]: {
          ...prev[messageType],
          selected_plans: isSelected ? currentPlans.filter(id => id !== planId) : [...currentPlans, planId]
        }
      };
    });
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Carregando...</div>;
  }

  return <div className="space-y-6">
      <Card className="glass-card border-glass-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            Mensagem de Boas-vindas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MediaUploader botId={botId} onMediaUploaded={(url, type) => handleMediaUploaded('welcome', url, type)} currentMediaUrl={messages.welcome.media_url} currentMediaType={messages.welcome.media_type} />
          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea value={messages.welcome.message_text} onChange={e => setMessages(prev => ({
            ...prev,
            welcome: {
              ...prev.welcome,
              message_text: e.target.value
            }
          }))} placeholder="Olá! Bem-vindo ao nosso canal VIP!" rows={4} className="bg-input border-border" />
            <p className="text-xs text-muted-foreground">
              Suporta emojis e formatação HTML básica
            </p>
          </div>
          <div className="space-y-2">
            <Label>Planos Disponíveis (opcional)</Label>
            {availablePlans.length === 0 ? <p className="text-sm text-muted-foreground">
                Nenhum plano criado ainda. Vá para a aba "Planos" para criar planos.
              </p> : <div className="space-y-2 border border-border rounded-md p-3 bg-card">
                {availablePlans.map(plan => <div key={plan.id} className="flex items-center space-x-2">
                    <Checkbox id={`welcome-plan-${plan.id}`} checked={messages.welcome.selected_plans?.includes(plan.id)} onCheckedChange={() => togglePlanSelection('welcome', plan.id)} />
                    <label htmlFor={`welcome-plan-${plan.id}`} className="text-sm cursor-pointer flex-1">
                      {plan.plan_name} - R$ {plan.price} ({plan.duration_days} dias)
                    </label>
                  </div>)}
              </div>}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleSaveMessage('welcome')} disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
      
      
    </div>;
};

export default BotMessagesTab;
