import { Bot, Mail, MessageCircle, Twitter, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 md:py-16 px-4 border-t border-glass-border/50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-8">
          {/* Brand */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="glass-card p-2 rounded-lg">
                <Bot className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <span className="text-lg md:text-xl font-bold hero-gradient">Botly</span>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              Automatize seu Telegram com IA avançada e transforme sua comunicação.
            </p>
            <div className="flex gap-3 md:gap-4">
              <div className="glass-button p-2 rounded-lg cursor-pointer hover:shadow-glow transition-all">
                <Twitter className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="glass-button p-2 rounded-lg cursor-pointer hover:shadow-glow transition-all">
                <Github className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="glass-button p-2 rounded-lg cursor-pointer hover:shadow-glow transition-all">
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </div>
          
          {/* Product */}
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-foreground text-sm md:text-base">Produto</h4>
            <ul className="space-y-2 text-sm md:text-base text-muted-foreground">
              <li className="hover:text-primary cursor-pointer transition-colors">Recursos</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Preços</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Documentação</li>
              <li className="hover:text-primary cursor-pointer transition-colors">API</li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-foreground text-sm md:text-base">Empresa</h4>
            <ul className="space-y-2 text-sm md:text-base text-muted-foreground">
              <li className="hover:text-primary cursor-pointer transition-colors">Sobre</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Blog</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Carreiras</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Contato</li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-foreground text-sm md:text-base">Suporte</h4>
            <ul className="space-y-2 text-sm md:text-base text-muted-foreground">
              <li className="hover:text-primary cursor-pointer transition-colors">Central de Ajuda</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Comunidade</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Status</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Segurança</li>
            </ul>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="border-t border-glass-border/30 mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-muted-foreground text-xs md:text-sm">
            © 2024 Botly. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
            <span className="hover:text-primary cursor-pointer transition-colors">Privacidade</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Termos</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;