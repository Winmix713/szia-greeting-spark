
import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { EditableCodeBlock } from '@/components/EditableCodeBlock';
import { NavigationBar } from '@/components/NavigationBar';
import { ConversionOptions } from '@/components/ConversionOptions';
import { SVGPreview } from '@/components/SVGPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download, RefreshCw, Settings } from 'lucide-react';
import { validateSvg, analyzeSvg } from '@/utils/svg-utils';
import { useConverter } from '@/hooks/use-converter';

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const {
    svgInput,
    setSvgInput,
    jsxOutput,
    cssOutput,
    fileName,
    setFileName,
    options,
    setOptions,
    convertSvgToJsx,
    copyToClipboard,
    downloadFile,
    downloadCssFile,
    copied
  } = useConverter();

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

    setSvgInput(content);
    
    // Auto-generate component name from filename
    const baseName = name.replace(/\.svg$/, '');
    const componentName = baseName
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
    
    setFileName(componentName || 'MyIcon');

    toast({
      title: "SVG betöltve",
      description: `${name} sikeresen betöltve`,
    });
  }, [toast, setSvgInput, setFileName]);

  const handleConvert = useCallback(async () => {
    if (!svgInput.trim()) {
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
      
      convertSvgToJsx();
      
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
  }, [svgInput, convertSvgToJsx, toast]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!jsxOutput) return;

    try {
      await copyToClipboard();
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
  }, [jsxOutput, copyToClipboard, toast]);

  const handleDownload = useCallback(() => {
    if (!jsxOutput) return;

    downloadFile(options.typescript ? 'tsx' : 'jsx');

    toast({
      title: "Letöltés megkezdve",
      description: "A JSX fájl letöltése elkezdődött",
    });
  }, [jsxOutput, downloadFile, options.typescript, toast]);

  const handleSvgChange = useCallback((content: string) => {
    setSvgInput(content);
  }, [setSvgInput]);

  // Get SVG analysis for display
  const svgAnalysis = React.useMemo(() => {
    return svgInput ? analyzeSvg(svgInput) : null;
  }, [svgInput]);

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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Input and Preview */}
            <div className="lg:col-span-2 space-y-6">
              {!svgInput && (
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

              {svgInput && (
                <>
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
                        code={svgInput}
                        onChange={handleSvgChange}
                        title="SVG Kód"
                        language="xml"
                      />
                    </CardContent>
                  </Card>

                  <SVGPreview svgContent={svgInput} />

                  {/* SVG Analysis */}
                  {svgAnalysis && (
                    <Card>
                      <CardHeader>
                        <CardTitle>SVG Analízis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {svgAnalysis.elementCount}
                            </div>
                            <div className="text-xs text-muted-foreground">Elements</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {svgAnalysis.pathCount}
                            </div>
                            <div className="text-xs text-muted-foreground">Paths</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {svgAnalysis.groupCount}
                            </div>
                            <div className="text-xs text-muted-foreground">Groups</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {(svgAnalysis.fileSize / 1024).toFixed(1)} KB
                            </div>
                            <div className="text-xs text-muted-foreground">File Size</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
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
                          {copied ? "Másolva" : "Másolás"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownload}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Letöltés
                        </Button>
                        {cssOutput && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadCssFile}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            CSS
                          </Button>
                        )}
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
            <div className="lg:col-span-2 space-y-6">
              <ConversionOptions
                options={options}
                onChange={setOptions}
                fileName={fileName}
                onFileNameChange={setFileName}
              />

              <Button
                onClick={handleConvert}
                disabled={!svgInput.trim() || isConverting}
                className="w-full"
                size="lg"
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Konvertálás...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Konvertálás
                  </>
                )}
              </Button>

              {!svgInput && (
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
