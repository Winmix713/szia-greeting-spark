
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SVGPreviewProps {
  svgContent: string;
  className?: string;
}

export const SVGPreview: React.FC<SVGPreviewProps> = ({
  svgContent,
  className,
}) => {
  const [previewError, setPreviewError] = React.useState<string | null>(null);

  // Clean and validate SVG content for preview
  const getCleanSvgContent = (content: string) => {
    if (!content.trim()) return null;
    
    try {
      // Remove XML declaration and DOCTYPE if present
      let cleanContent = content.trim();
      cleanContent = cleanContent.replace(/<\?xml[^>]*\?>/g, '');
      cleanContent = cleanContent.replace(/<!DOCTYPE[^>]*>/g, '');
      cleanContent = cleanContent.trim();
      
      // Basic validation - check if it starts with <svg
      if (!cleanContent.toLowerCase().startsWith('<svg')) {
        throw new Error('Nem érvényes SVG tartalom');
      }
      
      return cleanContent;
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : 'Ismeretlen hiba');
      return null;
    }
  };

  const cleanSvgContent = React.useMemo(() => {
    setPreviewError(null);
    return getCleanSvgContent(svgContent);
  }, [svgContent]);

  if (!svgContent.trim()) {
    return (
      <Card className={cn("h-64 flex items-center justify-center", className)}>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Nincs SVG tartalom az előnézethez
          </p>
        </CardContent>
      </Card>
    );
  }

  if (previewError || !cleanSvgContent) {
    return (
      <Card className={cn("h-64 flex items-center justify-center", className)}>
        <CardContent className="text-center">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive text-sm">
            {previewError || 'Nem sikerült az SVG betöltése'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">SVG Előnézet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/30 border border-border rounded-lg p-4 min-h-[200px] flex items-center justify-center">
          <div 
            className="max-w-full max-h-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: cleanSvgContent }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
