import React, { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/react";

interface FileUploaderProps {
  onFileSelect: (content: string, fileName: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [svgPreview, setSvgPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === "image/svg+xml" || file.name.endsWith(".svg"))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileSelect(content, file.name);
        setSvgPreview(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileSelect(content, file.name);
        setSvgPreview(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer
        ${isDragging ? "border-primary bg-primary/10" : "border-default-200 hover:border-primary/50"}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
    >
      {svgPreview ? (
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-16 mb-4 text-primary"
            dangerouslySetInnerHTML={{ __html: svgPreview }}
          />
          <p className="text-default-600 mb-2 text-lg font-medium">SVG betöltve</p>
          <Button 
            color="primary"
            variant="flat"
            size="sm"
            className="mx-auto transform transition-transform hover:scale-105"
            startContent={<Icon icon="lucide:refresh" />}
            onPress={() => setSvgPreview(null)}
          >
            Másik feltöltése
          </Button>
        </div>
      ) : (
        <>
          <Icon 
            icon="lucide:upload" 
            className={`mx-auto w-12 h-12 mb-4 transition-colors ${
              isDragging ? "text-primary" : "text-default-400"
            }`}
          />
          <p className="text-default-600 mb-2 text-lg font-medium">
            {isDragging ? "Drop your SVG file here" : "Drag and drop your SVG file here"}
          </p>
          <p className="text-default-400 text-sm mb-4">or click to browse</p>
          <Button 
            color="primary"
            variant="solid"
            className="mx-auto transform transition-transform hover:scale-105 shadow-md"
            size="lg"
            startContent={<Icon icon="lucide:file" />}
          >
            Select SVG File
          </Button>
        </>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};