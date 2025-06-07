
import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { EditableCodeBlock } from '@/components/EditableCodeBlock';
import { NavigationBar } from '@/components/NavigationBar';
import { ConversionOptions } from '@/components/ConversionOptions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download, RefreshCw } from 'lucide-react';
import { svgToJsx, validateSvg, ConversionOptions as ConversionOptionsType } from '@/utils/svgToJsx';

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [svgContent, setSvgContent] = useState('');
  const [jsxOutput, setJsxOutput] = useState('');
  const [fileName, setFileName] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const [conversionOptions, setConversionOptions] = useState<ConversionOptionsType>({
    removeComments: true,
    formatCode: true,
    componentName: 'MyIcon',
    addTypescript: true,
  });

  // Apply theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleFileSelect = useCallback((content: string, name: string) => {
    const validation = validateSvg(content);
    
    if (!validation.isValid) {
      toast({
        title: "Érvénytelen SVG",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setSvgContent(content);
    setFileName(name);
    
    // Auto-generate component name from filename
    const baseName = name.replace(/\.svg$/, '');
    const componentName = baseName
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
    
    setConversionOptions(prev => ({
      ...prev,
      componentName: componentName || 'MyIcon'
    }));

    toast({
      title: "SVG betöltve",
      description: `${name} sikeresen betöltve`,
    });
  }, [toast]);

  const handleConvert = useCallback(async () => {
    if (!svgContent.trim()) {
      toast({
        title: "Nincs SVG tartalom",
        description: "Kérlek tölts fel egy SVG fájlt vagy illeszd be a kódot",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    
    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = svgToJsx(svgContent, conversionOptions);
      setJsxOutput(result);
      
      toast({
        title: "Konverzió sikeres",
        description: "Az SVG sikeresen átalakítva JSX komponenssé",
      });
    } catch (error) {
      toast({
        title: "Konverziós hiba",
        description: "Hiba történt az SVG átalakítása során",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  }, [svgContent, conversionOptions, toast]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!jsxOutput) return;

    try {
      await navigator.clipboard.writeText(jsxOutput);
      toast({
        title: "Másolva",
        description: "A JSX kód a vágólapra másolva",
      });
    } catch (error) {
      toast({
        title: "Másolási hiba",
        description: "Nem sikerült a vágólapra másolni",
        variant: "destructive",
      });
    }
  }, [jsxOutput, toast]);

  const handleDownload = useCallback(() => {
    if (!jsxOutput) return;

    const blob = new Blob([jsxOutput], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversionOptions.componentName}.${conversionOptions.addTypescript ? 'tsx' : 'jsx'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Letöltés megkezdve",
      description: "A JSX fájl letöltése elkezdődött",
    });
  }, [jsxOutput, conversionOptions, toast]);

  const handleSvgChange = useCallback((content: string) => {
    setSvgContent(content);
    if (jsxOutput) {
      setJsxOutput(''); // Clear output when SVG changes
    }
  }, [jsxOutput]);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar 
        isDarkMode={isDarkMode} 
        onToggleTheme={() => setIsDarkMode(!isDarkMode)} 
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              SVG to JSX Converter
            </h2>
            <p className="text-muted-foreground text-lg">
              Alakítsd át egyszerűen az SVG fájljaidat React JSX komponensekké
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Input */}
            <div className="lg:col-span-2 space-y-6">
              {!svgContent && (
                <Card>
                  <CardContent className="pt-6">
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      isDragOver={isDragOver}
                      onDragOver={setIsDragOver}
                    />
                  </CardContent>
                </Card>
              )}

              {svgContent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      SVG Input
                      {fileName && (
                        <span className="text-sm font-normal text-muted-foreground">
                          {fileName}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EditableCodeBlock
                      code={svgContent}
                      onChange={handleSvgChange}
                      title="SVG Kód"
                      language="xml"
                    />
                  </CardContent>
                </Card>
              )}

              {jsxOutput && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      JSX Output
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyToClipboard}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Másolás
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownload}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Letöltés
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EditableCodeBlock
                      code={jsxOutput}
                      onChange={() => {}}
                      title="React Komponens"
                      language="jsx"
                      readOnly
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Options */}
            <div className="space-y-6">
              <ConversionOptions
                options={conversionOptions}
                onChange={setConversionOptions}
              />

              <Button
                onClick={handleConvert}
                disabled={!svgContent.trim() || isConverting}
                className="w-full"
                size="lg"
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Konvertálás...
                  </>
                ) : (
                  'Konvertálás'
                )}
              </Button>

              {!svgContent && (
                <div className="text-center p-6 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground text-sm">
                    Tölts fel egy SVG fájlt a konverzió megkezdéséhez
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
