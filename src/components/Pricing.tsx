import { Button } from "@/components/ui/button";
import { Check, Zap, TrendingUp, Calculator, DollarSign, BarChart3 } from "lucide-react";

const Pricing = () => {
  const features = [
    "Setup em 5 minutos",
    "Processamento instantâneo",
    "Dashboard em tempo real",
    "Suporte 24/7",
    "API completa",
    "Webhooks personalizados",
    "Relatórios avançados",
    "Segurança bancária"
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Sem Mensalidade",
      description: "Pague apenas quando usar. Zero custos fixos."
    },
    {
      icon: TrendingUp,
      title: "Escale Conforme Cresce",
      description: "Quanto mais transações, mais você economiza."
    },
    {
      icon: BarChart3,
      title: "Transparência Total",
      description: "Todas as taxas são claras e sem surpresas."
    }
  ];

  return (
    <section className="py-12 md:py-24 px-4 relative">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
            <span className="hero-gradient">Preço</span> Simples
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Pague apenas pelo que usar. Sem mensalidades, sem surpresas.
          </p>
        </div>
        
        {/* Main Pricing Card */}
        <div className="max-w-4xl mx-auto mb-10 md:mb-16">
          <div className="glass-card p-6 md:p-12 rounded-3xl border-primary/20 shadow-glow relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="text-center mb-6 md:mb-8">
              <div className="glass-card p-4 md:p-6 rounded-2xl w-fit mx-auto mb-4 md:mb-6">
                <Calculator className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto" />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Taxa por Transação</h3>
              
              {/* Pricing Formula */}
              <div className="bg-gradient-glass p-6 md:p-8 rounded-2xl border border-primary/20 mb-6 md:mb-8">
                <div className="text-4xl md:text-5xl font-bold hero-gradient mb-3 md:mb-4">
                  4% + R$ 1,00
                </div>
                <p className="text-base md:text-lg text-muted-foreground">
                  Por transação processada via Telegram
                </p>
              </div>
              
              {/* Pricing Examples */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="glass-card p-4 md:p-6 rounded-xl">
                  <div className="text-xl md:text-2xl font-bold text-primary mb-2">R$ 5,00</div>
                  <div className="text-xs md:text-sm text-muted-foreground mb-2">Transação de R$ 100</div>
                  <div className="text-xs text-muted-foreground">4% + R$ 1,00</div>
                </div>
                <div className="glass-card p-4 md:p-6 rounded-xl border-primary/30">
                  <div className="text-xl md:text-2xl font-bold text-primary mb-2">R$ 21,00</div>
                  <div className="text-xs md:text-sm text-muted-foreground mb-2">Transação de R$ 500</div>
                  <div className="text-xs text-muted-foreground">4% + R$ 1,00</div>
                </div>
                <div className="glass-card p-4 md:p-6 rounded-xl">
                  <div className="text-xl md:text-2xl font-bold text-primary mb-2">R$ 41,00</div>
                  <div className="text-xs md:text-sm text-muted-foreground mb-2">Transação de R$ 1.000</div>
                  <div className="text-xs text-muted-foreground">4% + R$ 1,00</div>
                </div>
              </div>
            </div>
            
            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <div>
                <h4 className="font-semibold mb-3 md:mb-4 text-foreground text-sm md:text-base">Tudo Incluído:</h4>
                <ul className="space-y-2 md:space-y-3">
                  {features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 md:gap-3">
                      <div className="glass-card p-1 rounded-full flex-shrink-0">
                        <Check className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                      </div>
                      <span className="text-sm md:text-base text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 md:mb-4 text-foreground text-sm md:text-base opacity-0 sm:opacity-100">Hidden</h4>
                <ul className="space-y-2 md:space-y-3">
                  {features.slice(4).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 md:gap-3">
                      <div className="glass-card p-1 rounded-full flex-shrink-0">
                        <Check className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                      </div>
                      <span className="text-sm md:text-base text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* CTA */}
            <div className="text-center">
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-gradient-primary text-primary-foreground hover:shadow-glow-strong px-8 md:px-12 py-4 md:py-6 text-base md:text-lg font-semibold rounded-2xl"
              >
                Começar Agora - Grátis
              </Button>
              <p className="text-xs md:text-sm text-muted-foreground mt-4">
                Sem setup • Sem mensalidade • Cancele quando quiser
              </p>
            </div>
          </div>
        </div>
        
        {/* Benefits */}
        <div className="grid sm:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-10 md:mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="glass-card p-3 md:p-4 rounded-xl w-fit mx-auto mb-3 md:mb-4">
                <benefit.icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-foreground">
                {benefit.title}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground px-4">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Bottom info */}
        <div className="text-center">
          <div className="glass-card p-4 md:p-6 rounded-2xl max-w-2xl mx-auto">
            <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-3 md:mb-4" />
            <h4 className="font-semibold mb-2 text-foreground text-sm md:text-base">Calculadora de Custos</h4>
            <p className="text-muted-foreground text-xs md:text-sm px-4">
              1.000 transações de R$ 100 = R$ 5.000 em taxas por mês<br />
              <span className="text-primary">Muito mais barato que planos fixos!</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;