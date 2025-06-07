
import React, { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (content: string, fileName: string) => void;
  isDragOver: boolean;
  onDragOver: (isDragOver: boolean) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  isDragOver,
  onDragOver,
}) => {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(true);
  }, [onDragOver]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(false);
  }, [onDragOver]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const svgFile = files.find(file => file.type === 'image/svg+xml' || file.name.endsWith('.svg'));
    
    if (svgFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onFileSelect(content, svgFile.name);
      };
      reader.readAsText(svgFile);
    }
  }, [onFileSelect, onDragOver]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onFileSelect(content, file.name);
      };
      reader.readAsText(file);
    }
  }, [onFileSelect]);

  return (
    <div
      className={cn(
        "border-2 border-dashed border-border rounded-lg p-8 text-center transition-all duration-200",
        isDragOver && "border-primary bg-primary/5 scale-105"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center gap-4">
        <div className={cn(
          "w-16 h-16 rounded-full border-2 border-border flex items-center justify-center transition-colors",
          isDragOver && "border-primary bg-primary/10"
        )}>
          {isDragOver ? (
            <FileText className="w-8 h-8 text-primary" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Húzd ide az SVG fájlodat
          </h3>
          <p className="text-muted-foreground mb-4">
            vagy kattints a tallózáshoz
          </p>
          <label className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            Fájl kiválasztása
            <input
              type="file"
              accept=".svg,image/svg+xml"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
