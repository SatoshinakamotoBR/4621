import { Button } from "@/components/ui/button";
import { Image, Video, X } from "lucide-react";

interface MediaPreviewProps {
  mediaType: 'photo' | 'video' | 'audio' | 'document' | '';
  fileId: string;
  onRemove: () => void;
}

const MediaPreview = ({ mediaType, fileId, onRemove }: MediaPreviewProps) => {
  if (!mediaType || !fileId) return null;

  return (
    <div className="relative border border-border rounded-lg p-4">
      <div className="flex items-center gap-3">
        {mediaType === 'photo' ? (
          <Image className="w-8 h-8 text-primary" />
        ) : (
          <Video className="w-8 h-8 text-primary" />
        )}
        <div className="flex-1 min-w-0">
<p className="text-sm font-medium truncate">
            {mediaType === 'photo' ? 'Imagem' : mediaType === 'video' ? 'Vídeo' : mediaType === 'audio' ? 'Áudio' : 'Documento'} carregado
          </p>
          <p className="text-xs text-muted-foreground truncate">
            Telegram File ID: {fileId.substring(0, 20)}...
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="mt-3 p-2 bg-primary/5 rounded text-xs text-muted-foreground">
        <p>✅ Arquivo armazenado no Telegram</p>
        <p className="mt-1">O arquivo será carregado do Telegram ao enviar</p>
      </div>
    </div>
  );
};

export default MediaPreview;
