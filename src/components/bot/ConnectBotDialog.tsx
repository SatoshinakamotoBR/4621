import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/runtime-client";
import { Loader2, Users, MessageCircle } from "lucide-react";
import { botTokenSchema, botNameSchema, channelIdSchema } from "@/lib/validations";
interface ConnectBotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}
const ConnectBotDialog = ({
  open,
  onOpenChange,
  onSuccess
}: ConnectBotDialogProps) => {
  const {
    toast
  } = useToast();
  const [botToken, setBotToken] = useState("");
  const [botName, setBotName] = useState("");
  const [vipChannelId, setVipChannelId] = useState("");
  const [supportChannelId, setSupportChannelId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    botToken?: string;
    botName?: string;
    vipChannelId?: string;
    supportChannelId?: string;
  }>({});
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
  const handleConnect = async () => {
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      // Verify bot and save with channels
      const {
        data,
        error
      } = await supabase.functions.invoke('telegram-bot', {
        body: {
          action: 'verify',
          botToken: botToken.trim(),
          botName: botName.trim() || undefined,
          vipChannelId: vipChannelId.trim(),
          supportChannelId: supportChannelId.trim()
        }
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      toast({
        title: "Bot conectado!",
        description: `Bot ${data.bot.first_name} (@${data.bot.username}) conectado com sucesso`
      });

      // Reset form
      setBotToken("");
      setBotName("");
      setVipChannelId("");
      setSupportChannelId("");
      setErrors({});
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error connecting bot:', error);
      toast({
        title: "Erro ao conectar bot",
        description: error instanceof Error ? error.message : "Verifique os dados e tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-glass-border/50 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Conectar Bot do Telegram</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure seu bot com os canais necessários
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="botName" className="text-foreground">
              Nome do Bot (opcional)
            </Label>
            <Input id="botName" value={botName} onChange={e => {
            setBotName(e.target.value);
            setErrors(prev => ({
              ...prev,
              botName: undefined
            }));
          }} placeholder="Meu Bot" className="bg-input border-border text-foreground" />
            {errors.botName && <p className="text-sm text-destructive">{errors.botName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="botToken" className="text-foreground">
              Token do Bot *
            </Label>
            <Input id="botToken" value={botToken} onChange={e => {
            setBotToken(e.target.value);
            setErrors(prev => ({
              ...prev,
              botToken: undefined
            }));
          }} placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz" className="bg-input border-border text-foreground" type="password" />
            {errors.botToken && <p className="text-sm text-destructive">{errors.botToken}</p>}
            <p className="text-xs text-muted-foreground">
              Obtenha o token com o @BotFather no Telegram
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vipChannelId" className="text-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              ID do Canal VIP *
            </Label>
            <Input id="vipChannelId" value={vipChannelId} onChange={e => {
            setVipChannelId(e.target.value);
            setErrors(prev => ({
              ...prev,
              vipChannelId: undefined
            }));
          }} placeholder="-1001234567890" className="bg-input border-border text-foreground" />
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
            <Input id="supportChannelId" value={supportChannelId} onChange={e => {
            setSupportChannelId(e.target.value);
            setErrors(prev => ({
              ...prev,
              supportChannelId: undefined
            }));
          }} placeholder="-1001234567890" className="bg-input border-border text-foreground" />
            {errors.supportChannelId && <p className="text-sm text-destructive">{errors.supportChannelId}</p>}
            <p className="text-xs text-muted-foreground">
              Canal que receberá notificações de vendas, uploads e registros
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="border-border text-foreground">
            Cancelar
          </Button>
          <Button onClick={handleConnect} disabled={isLoading} className="bg-primary text-primary-foreground hover:shadow-glow transition-all duration-300">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Conectar Bot
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};
export default ConnectBotDialog;