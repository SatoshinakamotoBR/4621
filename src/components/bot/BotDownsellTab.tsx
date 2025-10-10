import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Link as LinkIcon, Save, Clock } from "lucide-react";
import MediaUploader from "@/components/shared/MediaUploader";
import { supabase } from "@/integrations/supabase/runtime-client";
import { useToast } from "@/hooks/use-toast";
interface DownsellMessage {
  id?: string;
  message_text: string;
  delay_minutes: number;
  media_url?: string;
  media_type?: string;
  button_text?: string;
  button_url?: string;
  plans?: { plan_id: string; discount: number }[];
}

const TIME_OPTIONS = [2, 5, 10, 15, 20, 25, 30, 35, 40, 45, 60, 90, 120];
interface Plan {
  id?: string;
  plan_name: string;
  price: number;
  duration_days: number;
  plan_description?: string;
  payment_link?: string;
}
interface BotDownsellTabProps {
  botId: string;
}
const BotDownsellTab = ({
  botId
}: BotDownsellTabProps) => {
  const {
    toast
  } = useToast();
  const [messages, setMessages] = useState<DownsellMessage[]>([]);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    fetchDownsellData();

    // Set up realtime subscription for plans
    const channel = supabase.channel('bot-plans-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'bot_plans',
      filter: `bot_id=eq.${botId}`
    }, () => {
      fetchDownsellData();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [botId]);
  const fetchDownsellData = async () => {
    setIsLoading(true);
    try {
      // Fetch scheduled messages
      const {
        data: messagesData,
        error: messagesError
      } = await supabase.from('scheduled_messages').select('*').eq('bot_id', botId).order('delay_minutes', {
        ascending: true
      });
      if (messagesError) throw messagesError;

      // Fetch plans linked to each message
      const messagesWithPlans = await Promise.all(
        (messagesData || []).map(async (msg) => {
          const { data: planLinks } = await supabase
            .from('scheduled_message_plans')
            .select('bot_plan_id, discount_percentage')
            .eq('scheduled_message_id', msg.id);
          
          return {
            ...msg,
            plans: (planLinks || []).map(p => ({ 
              plan_id: p.bot_plan_id, 
              discount: p.discount_percentage 
            }))
          };
        })
      );

      // Fetch ALL plans from bot_plans (from Planos tab)
      const {
        data: plansData,
        error: plansError
      } = await supabase.from('bot_plans').select('*').eq('bot_id', botId).eq('is_active', true).order('created_at', {
        ascending: true
      });
      if (plansError) throw plansError;
      
      setMessages(messagesWithPlans);
      setAvailablePlans(plansData || []);
    } catch (error) {
      console.error('Error fetching downsell data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as mensagens e planos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const addNewMessage = () => {
    setMessages([...messages, {
      message_text: '',
      delay_minutes: messages.length > 0 ? messages[messages.length - 1].delay_minutes + 5 : 5,
      button_text: '',
      button_url: '',
      plans: []
    }]);
  };
  const removeMessage = (index: number) => {
    const newMessages = [...messages];
    newMessages.splice(index, 1);
    setMessages(newMessages);
  };
  const updateMessage = (index: number, field: keyof DownsellMessage, value: any) => {
    setMessages(prev => {
      const newMessages = [...prev];
      newMessages[index] = {
        ...newMessages[index],
        [field]: value,
      };
      return newMessages;
    });
  };
  const handleMediaUploaded = (index: number, url: string, type: 'photo' | 'video' | 'audio' | 'document') => {
    setMessages(prev => {
      const newMessages = [...prev];
      newMessages[index] = {
        ...newMessages[index],
        media_url: url,
        media_type: type,
      };
      return newMessages;
    });
  };
  const togglePlanForMessage = (messageIndex: number, planId: string) => {
    const newMessages = [...messages];
    const currentPlans = newMessages[messageIndex].plans || [];
    const existingIndex = currentPlans.findIndex(p => p.plan_id === planId);
    
    if (existingIndex >= 0) {
      currentPlans.splice(existingIndex, 1);
    } else {
      currentPlans.push({ plan_id: planId, discount: 0 });
    }
    
    newMessages[messageIndex].plans = currentPlans;
    setMessages(newMessages);
  };

  const updatePlanDiscount = (messageIndex: number, planId: string, discount: number) => {
    const newMessages = [...messages];
    const currentPlans = newMessages[messageIndex].plans || [];
    const planIndex = currentPlans.findIndex(p => p.plan_id === planId);
    
    if (planIndex >= 0) {
      currentPlans[planIndex].discount = Math.max(0, Math.min(100, discount));
      newMessages[messageIndex].plans = currentPlans;
      setMessages(newMessages);
    }
  };
  const saveAll = async () => {
    setIsSaving(true);
    console.log('[Downsell] Saving messages payload:', messages);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Delete all existing messages and their plan links for this bot
      const { data: existingMessages } = await supabase
        .from('scheduled_messages')
        .select('id')
        .eq('bot_id', botId);
      
      if (existingMessages && existingMessages.length > 0) {
        const messageIds = existingMessages.map(m => m.id);
        await supabase.from('scheduled_message_plans').delete().in('scheduled_message_id', messageIds);
        await supabase.from('scheduled_messages').delete().eq('bot_id', botId);
      }

      // Insert messages
      if (messages.length > 0) {
        const messagesToInsert = messages.map(msg => {
          const hasMedia = !!((msg.media_url ?? '').trim().length > 0);
          return {
            bot_id: botId,
            user_id: user.id,
            message_text: msg.message_text,
            delay_minutes: msg.delay_minutes,
            media_url: hasMedia ? msg.media_url : null,
            media_type: hasMedia ? msg.media_type || null : null,
            button_text: msg.button_text || null,
            button_url: msg.button_url || null,
            is_active: true
          };
        });
        
        const { data: insertedMessages, error: messagesError } = await supabase
          .from('scheduled_messages')
          .insert(messagesToInsert)
          .select();
        
        console.log('[Downsell] Inserted messages result:', insertedMessages);
        if (messagesError) throw messagesError;

        // Insert plan links with discounts
        if (insertedMessages) {
          const planLinks = [];
          for (let i = 0; i < insertedMessages.length; i++) {
            const msg = messages[i];
            if (msg.plans && msg.plans.length > 0) {
              for (const plan of msg.plans) {
                planLinks.push({
                  scheduled_message_id: insertedMessages[i].id,
                  bot_plan_id: plan.plan_id,
                  discount_percentage: plan.discount
                });
              }
            }
          }
          
          if (planLinks.length > 0) {
            const { error: linksError } = await supabase
              .from('scheduled_message_plans')
              .insert(planLinks);
            if (linksError) throw linksError;
          }
        }
      }
      toast({
        title: "Salvo com sucesso!",
        description: "Mensagens de downsell salvas. Os planos selecionados serão usados automaticamente."
      });
      await fetchDownsellData();
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  if (isLoading) {
    return <div className="text-center text-muted-foreground py-8">
        Carregando configurações...
      </div>;
  }
  return <div className="space-y-6">
      {/* Header com botão de salvar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sistema de DownSell Automático</h2>
          <p className="text-muted-foreground mt-1">
            Configure mensagens que serão enviadas automaticamente após o usuário digitar /start
          </p>
        </div>
        <Button onClick={saveAll} disabled={isSaving} className="gap-2" size="lg">
          <Save className="w-4 h-4" />
          {isSaving ? 'Salvando...' : 'Salvar Tudo'}
        </Button>
      </div>

      {/* Mensagens de Downsell */}
      <Card className="glass-card border-glass-border/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">Mensagens Programadas</h3>
          </div>
          <Button onClick={addNewMessage} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Mensagem
          </Button>
        </div>

        {messages.length === 0 ? <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma mensagem configurada ainda.</p>
            <p className="text-sm mt-2">Clique em "Adicionar Mensagem" para começar</p>
          </div> : <div className="space-y-6">
            {messages.map((message, index) => <Card key={index} className="p-4 border-2 border-border relative">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:text-destructive" onClick={() => removeMessage(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>

                <div className="space-y-4 pr-12">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium">Mensagem #{index + 1}</span>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <Label>Tempo de Envio (minutos após /start)</Label>
                      <Select value={message.delay_minutes.toString()} onValueChange={(value) => updateMessage(index, 'delay_minutes', parseInt(value))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione o tempo" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map(time => (
                            <SelectItem key={time} value={time.toString()}>
                              {time} minuto{time !== 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Texto da Mensagem</Label>
                      <Textarea value={message.message_text} onChange={e => updateMessage(index, 'message_text', e.target.value)} placeholder="Digite o texto da mensagem..." className="mt-1 min-h-[100px]" />
                    </div>

                    <div>
                      <MediaUploader botId={botId} onMediaUploaded={(url, type) => handleMediaUploaded(index, url, type)} currentMediaUrl={message.media_url} currentMediaType={message.media_type} />
                    </div>

                    {/* Plans with discount for this message */}
                    <div className="space-y-2">
                      <Label>Planos com Desconto</Label>
                      <div className="grid gap-2">
                        {availablePlans.map(plan => {
                          const planLink = message.plans?.find(p => p.plan_id === plan.id);
                          const isSelected = !!planLink;
                          
                          return (
                            <Card key={plan.id} className={`p-3 cursor-pointer transition-all ${isSelected ? 'border-2 border-primary bg-primary/5' : 'border hover:border-primary/50'}`} onClick={() => togglePlanForMessage(index, plan.id!)}>
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1">
                                  <div className="font-semibold">{plan.plan_name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    R$ {plan.price.toFixed(2)} - {plan.duration_days} dias
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <Label className="text-xs">Desconto %</Label>
                                    <Input type="number" min="0" max="100" value={planLink.discount} onChange={(e) => updatePlanDiscount(index, plan.id!, parseInt(e.target.value) || 0)} className="w-20 h-8" />
                                  </div>
                                )}
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                      {availablePlans.length === 0 && (
                        <p className="text-sm text-muted-foreground">Nenhum plano disponível. Crie planos na aba "Planos"</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>)}
          </div>}
      </Card>


      {/* Info Box */}
      <Card className="bg-primary/5 border-primary/20 p-4">
        <h4 className="font-semibold mb-2">Como funciona:</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Quando um usuário digita /start, todas as mensagens são agendadas automaticamente</li>
          <li>• Cada mensagem será enviada no tempo configurado (em minutos após o /start)</li>
          <li>• Você pode adicionar mídia (foto/vídeo/áudio) e botões personalizados</li>
          <li>• Para cada mensagem, selecione os planos e aplique descontos específicos</li>
          <li>• Os descontos são aplicados automaticamente nos valores exibidos ao usuário</li>
        </ul>
      </Card>
    </div>;
};
export default BotDownsellTab;