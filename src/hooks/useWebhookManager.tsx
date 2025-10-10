import { useState } from 'react';
import { supabase } from '@/integrations/supabase/runtime-client';
import { useToast } from '@/hooks/use-toast';

export const useWebhookManager = () => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateWebhook = async (botId: string) => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-bot', {
        body: {
          action: 'update_webhook',
          botId,
        },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      toast({
        title: 'Webhook atualizado!',
        description: 'O bot está pronto para receber mensagens',
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error updating webhook:', error);
      toast({
        title: 'Erro ao atualizar webhook',
        description: error instanceof Error ? error.message : 'Tente novamente',
        variant: 'destructive',
      });
      return { success: false, error };
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateWebhook, isUpdating };
};
