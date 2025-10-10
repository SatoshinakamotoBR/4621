import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Bot, Zap, Shield, Star } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
      <div className="absolute top-20 left-4 md:left-10 w-48 md:w-72 h-48 md:h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-4 md:right-10 w-40 md:w-60 h-40 md:h-60 bg-primary-glow/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      
      <div className="container mx-auto text-center relative z-10">
        <div className="p-4 sm:p-8 md:p-12 max-w-5xl mx-auto rounded-3xl relative">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="glass-card p-4 md:p-6 rounded-2xl">
              <Bot className="w-12 h-12 md:w-16 md:h-16 text-primary animate-pulse" />
            </div>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6">
            <span className="hero-gradient">TelegramBot</span>
            <br />
            <span className="text-foreground">Pro</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed px-2">
            Automatize seu Telegram com <span className="text-primary glow-text">IA avançada</span>. 
            Chatbots inteligentes, gerenciamento de grupos e automação completa.
          </p>
          
          {/* Features badges */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12">
            <div className="glass-card px-3 md:px-4 py-1.5 md:py-2 rounded-full flex items-center gap-2">
              <Zap className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              <span className="text-xs md:text-sm">Setup em 5 minutos</span>
            </div>
            <div className="glass-card px-3 md:px-4 py-1.5 md:py-2 rounded-full flex items-center gap-2">
              <Shield className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              <span className="text-xs md:text-sm">100% Seguro</span>
            </div>
            <div className="glass-card px-3 md:px-4 py-1.5 md:py-2 rounded-full flex items-center gap-2">
              <Star className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              <span className="text-xs md:text-sm">IA Avançada</span>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-primary text-primary-foreground hover:shadow-glow-strong transition-all duration-300 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-semibold rounded-2xl">
                Começar Gratuitamente
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto glass-button px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-semibold rounded-2xl">
              Ver Demonstração
            </Button>
          </div>
          
          {/* Social proof */}
          <div className="mt-8 md:mt-12 text-center">
            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">Confiado por mais de 10.000+ usuários</p>
            <div className="flex justify-center gap-1 md:gap-2 items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-primary text-primary" />
              ))}
              <span className="ml-2 text-primary font-semibold text-sm md:text-base">4.9/5</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;