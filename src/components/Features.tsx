import { Bot, MessageSquare, Users, Zap, Brain, Shield } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "IA Conversacional",
      description: "Chatbots inteligentes que aprendem com cada interação e respondem de forma natural."
    },
    {
      icon: MessageSquare,
      title: "Auto-resposta Inteligente",
      description: "Respostas automáticas personalizadas baseadas no contexto e histórico da conversa."
    },
    {
      icon: Users,
      title: "Gerenciamento de Grupos",
      description: "Modere grupos automaticamente, filtre spam e gerencie membros com regras avançadas."
    },
    {
      icon: Zap,
      title: "Automação de Fluxos",
      description: "Crie fluxos automatizados complexos com triggers e ações personalizáveis."
    },
    {
      icon: Bot,
      title: "Bot Personalizado",
      description: "Configure seu bot com personalidade única e comandos específicos do seu negócio."
    },
    {
      icon: Shield,
      title: "Segurança Avançada",
      description: "Proteção contra spam, controle de acesso e criptografia de dados empresarial."
    }
  ];

  return (
    <section className="py-12 md:py-24 px-4 relative">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
            <span className="hero-gradient">Recursos</span> Avançados
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Automatize completamente seu Telegram com recursos de IA de última geração
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="glass-card p-6 md:p-8 rounded-2xl hover:shadow-glow transition-all duration-300 group cursor-pointer"
            >
              <div className="glass-card p-3 md:p-4 rounded-xl w-fit mb-4 md:mb-6 group-hover:shadow-glow transition-all duration-300">
                <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;