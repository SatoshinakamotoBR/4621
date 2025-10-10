import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File as FileIcon, CircleCheck as CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/runtime-client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface BotUploadTabProps {
  botId: string;
}

const BotUploadTab = ({ botId }: BotUploadTabProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const uploadPromises = Array.from(files).map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('bot-uploads')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Notify backend to send to support channel
        const { error: notifyError } = await supabase.functions.invoke('handle-file-upload', {
          body: {
            bot_id: botId,
            telegram_user_id: 0, // This would come from actual user interaction
            file_path: fileName,
            file_type: file.type,
            file_size: file.size,
          },
        });

        if (notifyError) throw notifyError;

        setUploadProgress(((index + 1) / files.length) * 100);
        return fileName;
      });

      const uploadedFileNames = await Promise.all(uploadPromises);
      setUploadedFiles([...uploadedFiles, ...uploadedFileNames]);

      toast({
        title: "Upload concluído!",
        description: `${files.length} arquivo(s) enviado(s) com sucesso e notificado ao canal de suporte`,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload dos arquivos",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Upload de Arquivos</h2>
        <p className="text-muted-foreground">
          Envie arquivos que serão automaticamente encaminhados para o canal de registro
        </p>
      </div>

      <Card className="glass-card border-glass-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Área de Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
          />

          <div
            onClick={handleFileSelect}
            className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Clique para selecionar arquivos
            </h3>
            <p className="text-sm text-muted-foreground">
              Suporta: Imagens, Vídeos, Áudios, PDFs e Documentos
            </p>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Enviando arquivos...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Arquivos enviados:</h4>
              <div className="space-y-1">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <FileIcon className="w-4 h-4" />
                    <span className="truncate">{file.split('/').pop()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20 p-4">
        <h4 className="font-semibold mb-2">Como funciona:</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Arquivos são armazenados com segurança no servidor</li>
          <li>• Notificação automática enviada para o canal de registro</li>
          <li>• Rastreamento completo de todos os uploads realizados</li>
          <li>• Suporte para múltiplos formatos de arquivo</li>
        </ul>
      </Card>
    </div>
  );
};

export default BotUploadTab;
