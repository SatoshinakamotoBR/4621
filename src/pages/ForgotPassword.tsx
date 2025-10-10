import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { emailSchema } from "@/lib/validations";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const { resetPassword, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setError(emailResult.error.issues[0].message);
      return;
    }

    const { error: resetError } = await resetPassword(email);
    if (!resetError) {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-primary-glow/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        
        <div className="w-full max-w-md relative z-10">
          <Card className="glass-card border-glass-border/50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="glass-card p-4 rounded-2xl">
                  <Mail className="w-12 h-12 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                <span className="hero-gradient">E-mail enviado!</span>
              </CardTitle>
              <CardDescription>
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Não recebeu o e-mail? Verifique sua pasta de spam ou tente novamente.
                </p>
              </div>
              
              <Button 
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full glass-button rounded-xl"
              >
                Tentar novamente
              </Button>
              
              <div className="text-center">
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary-glow transition-colors font-semibold"
                >
                  Voltar ao login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-60 h-60 bg-primary-glow/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      
      <div className="w-full max-w-md relative z-10">
        {/* Back to login */}
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 glass-button px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao login
        </Link>

        <Card className="glass-card border-glass-border/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="glass-card p-4 rounded-2xl">
                <Bot className="w-12 h-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              <span className="hero-gradient">Esqueceu a senha?</span>
            </CardTitle>
            <CardDescription>
              Digite seu e-mail e enviaremos instruções para redefinir sua senha
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  required
                  className="glass-card border-glass-border/50"
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-primary text-primary-foreground hover:shadow-glow-strong transition-all duration-300 rounded-xl"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar instruções"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Lembrou da senha?{" "}
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary-glow transition-colors font-semibold"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;