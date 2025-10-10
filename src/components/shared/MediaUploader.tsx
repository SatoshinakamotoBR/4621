import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/runtime-client";
import { useToast } from "@/hooks/use-toast";
import MediaUploadButton from "./MediaUploadButton";
import MediaPreview from "./MediaPreview";

interface MediaUploaderProps {
  botId: string;
  onMediaUploaded: (fileId: string, type: 'photo' | 'video' | 'audio' | 'document') => void;
  currentMediaUrl?: string;
  currentMediaType?: string;
}

const MediaUploader = ({ botId, onMediaUploaded, currentMediaUrl, currentMediaType }: MediaUploaderProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentMediaUrl || "");
const [mediaType, setMediaType] = useState<'photo' | 'video' | 'audio' | 'document' | ''>(
  (currentMediaType as 'photo' | 'video' | 'audio' | 'document') || ''
);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');

    if (!isImage && !isVideo && !isAudio) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Apenas imagens, vídeos ou áudios são permitidos",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 50MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Verifica se o bot tem canal de suporte/registro configurado
      const { data: botData, error: botErr } = await supabase
        .from('telegram_bots')
        .select('support_channel_id')
        .eq('id', botId)
        .maybeSingle();

      if (botErr) {
        console.error('Erro checando canal de suporte:', botErr);
        toast({
          title: 'Falha ao verificar configuração',
          description: 'Tente novamente. Se persistir, reabra a página.',
          variant: 'destructive',
        });
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      if (!botData?.support_channel_id) {
        toast({
          title: 'Canal de Suporte/Registro obrigatório',
          description: 'Configure o Canal de Suporte na aba Config antes do upload.',
          variant: 'destructive',
        });
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);

      await new Promise((resolve) => {
        reader.onload = resolve;
      });

      const base64File = reader.result as string;

      const { data, error } = await supabase.functions.invoke('upload-media-to-telegram', {
        body: {
          bot_id: botId,
          file: base64File,
          file_name: file.name,
          file_type: file.type,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Erro ao chamar função');
      }

      if (data.error) {
        console.error('Upload error:', data);
        throw new Error(data.error || 'Erro ao fazer upload');
      }

      if (!data.success) {
        console.error('Upload failed:', data);
        throw new Error(data.message || data.error || 'Erro ao fazer upload');
      }

const uploadedMediaType = (data.media_type || 'document') as 'photo' | 'video' | 'audio' | 'document';
      setPreviewUrl(data.file_id);
      setMediaType(uploadedMediaType);
      onMediaUploaded(data.file_id, uploadedMediaType);

      toast({
        title: "Upload concluído!",
        description: "Mídia enviada para o Telegram com sucesso",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível fazer upload do arquivo";
      toast({
        title: "Erro no upload",
        description: errorMessage.includes("support_channel")
          ? "Configure o Canal de Suporte primeiro na aba Config"
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveMedia = () => {
    setPreviewUrl("");
    setMediaType("");
    onMediaUploaded("", 'document');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Mídia (Imagem ou Vídeo)</Label>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
accept="image/*,video/*,audio/*"
        />

        {!previewUrl ? (
          <MediaUploadButton onClick={handleFileSelect} isUploading={isUploading} />
        ) : (
          <MediaPreview
            mediaType={mediaType}
            fileId={previewUrl}
            onRemove={handleRemoveMedia}
          />
        )}
      </div>

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Fazendo upload...</span>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
