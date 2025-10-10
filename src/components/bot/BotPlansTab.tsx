import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, Trash2, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/runtime-client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BotPlansTabProps {
  botId: string;
}

interface BotPlan {
  id?: string;
  plan_name: string;
  plan_description: string;
  price: number;
  duration_days: number;
  payment_link: string;
  is_active: boolean;
}

const BotPlansTab = ({ botId }: BotPlansTabProps) => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<BotPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BotPlan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, [botId]);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bot_plans')
        .select('*')
        .eq('bot_id', botId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Erro ao carregar planos",
        description: "Não foi possível carregar os planos do bot",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = async (plan: BotPlan) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const planData = {
        bot_id: botId,
        user_id: user.id,
        plan_name: plan.plan_name,
        plan_description: plan.plan_description,
        price: plan.price,
        duration_days: plan.duration_days,
        payment_link: plan.payment_link,
        is_active: plan.is_active,
      };

      if (plan.id) {
        const { error } = await supabase
          .from('bot_plans')
          .update(planData)
          .eq('id', plan.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bot_plans')
          .insert(planData);
        if (error) throw error;
      }

      toast({
        title: "Plano salvo!",
        description: "O plano foi salvo com sucesso",
      });

      fetchPlans();
      setIsDialogOpen(false);
      setEditingPlan(null);
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o plano",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('bot_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: "Plano excluído!",
        description: "O plano foi excluído com sucesso",
      });

      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o plano",
        variant: "destructive",
      });
    }
  };

  const openNewPlanDialog = () => {
    setEditingPlan({
      plan_name: '',
      plan_description: '',
      price: 0,
      duration_days: 30,
      payment_link: '',
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Planos de Assinatura</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewPlanDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPlan?.id ? 'Editar Plano' : 'Novo Plano'}
              </DialogTitle>
            </DialogHeader>
            {editingPlan && (
              <PlanForm
                plan={editingPlan}
                onSave={handleSavePlan}
                isSaving={isSaving}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setEditingPlan(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {plans.length === 0 ? (
        <Card className="glass-card border-glass-border/50 p-12 text-center">
          <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhum plano criado</h3>
          <p className="text-muted-foreground mb-4">
            Crie seu primeiro plano de assinatura para começar a vender
          </p>
          <Button onClick={openNewPlanDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Criar Primeiro Plano
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="glass-card border-glass-border/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{plan.plan_name}</span>
                  {plan.is_active && (
                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                      Ativo
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {plan.plan_description}
                  </p>
                  <div className="text-3xl font-bold text-primary">
                    R$ {plan.price.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.duration_days} dias de acesso
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditingPlan(plan);
                      setIsDialogOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => plan.id && handleDeletePlan(plan.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

interface PlanFormProps {
  plan: BotPlan;
  onSave: (plan: BotPlan) => void;
  isSaving: boolean;
  onCancel: () => void;
}

const PlanForm = ({ plan, onSave, isSaving, onCancel }: PlanFormProps) => {
  const [formData, setFormData] = useState(plan);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nome do Plano</Label>
        <Input
          value={formData.plan_name}
          onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
          placeholder="Plano Premium"
          required
          className="bg-input border-border"
        />
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea
          value={formData.plan_description}
          onChange={(e) => setFormData({ ...formData, plan_description: e.target.value })}
          placeholder="Acesso completo ao conteúdo premium"
          rows={3}
          className="bg-input border-border"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Preço (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            placeholder="97.00"
            required
            className="bg-input border-border"
          />
        </div>
        <div className="space-y-2">
          <Label>Duração (dias)</Label>
          <Input
            type="number"
            value={formData.duration_days}
            onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
            placeholder="30"
            required
            className="bg-input border-border"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Link de Pagamento</Label>
        <Input
          type="url"
          value={formData.payment_link}
          onChange={(e) => setFormData({ ...formData, payment_link: e.target.value })}
          placeholder="https://..."
          required
          className="bg-input border-border"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSaving} className="flex-1 gap-2">
          <Save className="w-4 h-4" />
          Salvar
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default BotPlansTab;
