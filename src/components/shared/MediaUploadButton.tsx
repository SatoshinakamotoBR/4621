import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface MediaUploadButtonProps {
  onClick: () => void;
  isUploading: boolean;
}

const MediaUploadButton = ({ onClick, isUploading }: MediaUploadButtonProps) => {
  return (
    <div
      onClick={!isUploading ? onClick : undefined}
      className={`border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors ${
        isUploading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm font-medium mb-1">
{isUploading ? 'Fazendo upload...' : 'Clique para fazer upload'}
      </p>
      <p className="text-xs text-muted-foreground">
        Imagens, vídeos ou áudios até 50MB
      </p>
    </div>
  );
};

export default MediaUploadButton;
