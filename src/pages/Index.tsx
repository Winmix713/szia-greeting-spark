
import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { EditableCodeBlock } from '@/components/EditableCodeBlock';
import { NavigationBar } from '@/components/NavigationBar';
import { ConversionOptions } from '@/components/ConversionOptions';
import { AdvancedCleaningOptions } from '@/components/AdvancedCleaningOptions';
import { ProcessingQueue, QueueItem } from '@/components/ProcessingQueue';
import { SVGPreview } from '@/components/SVGPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download, RefreshCw, Settings, Zap, BarChart3, Cog } from 'lucide-react';
import { validateSvg, analyzeSvg } from '@/utils/svg-utils';
import { useAdvancedConverter } from '@/hooks/use-advanced-converter';

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [precisionValue, setPrecisionValue] = useState(2);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
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
    cleaningOptions,
    setCleaningOptions,
    config,
    setConfig,
    copied,
    isProcessing,
    processingProgress,
    convertSvgToJsx,
    copyToClipboard,
    downloadFile,
    downloadCssFile,
    performanceMonitor
  } = useAdvancedConverter();

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

    // Check if file is very large
    const fileSizeKB = content.length / 1024;
    if (fileSizeKB > 1000) { // > 1MB
      toast({
        title: "Nagy fájl észlelve",
        description: `${fileSizeKB.toFixed(0)} KB - speciális optimalizálás javasolt`,
        variant: "default",
      });
    }

    setSvgInput(content);
    
    // Auto-generate component name from filename
    const baseName = name.replace(/\.svg$/, '');
    const componentName = baseName
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
    
    setFileName(componentName || 'MyIcon');

    // Add to processing queue if large
    if (fileSizeKB > 500) {
      const queueItem: QueueItem = {
        id: `file-${Date.now()}`,
        name: componentName,
        size: content.length,
        status: 'pending',
        progress: 0
      };
      setQueueItems(prev => [...prev, queueItem]);
    }

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

    try {
      await convertSvgToJsx();
      
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

  // Queue management
  const handleQueuePause = useCallback((id: string) => {
    setQueueItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'paused' } : item
    ));
  }, []);

  const handleQueueResume = useCallback((id: string) => {
    setQueueItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'processing' } : item
    ));
  }, []);

  const handleQueueCancel = useCallback((id: string) => {
    setQueueItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleQueueRetry = useCallback((id: string) => {
    setQueueItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'pending', error: undefined } : item
    ));
  }, []);

  // Get SVG analysis for display
  const svgAnalysis = React.useMemo(() => {
    return svgInput ? analyzeSvg(svgInput) : null;
  }, [svgInput]);

  const totalQueueProgress = queueItems.length > 0 
    ? queueItems.reduce((sum, item) => sum + item.progress, 0) / queueItems.length 
    : 0;

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
              Advanced SVG to JSX Converter
            </h2>
            <p className="text-muted-foreground text-lg">
              Nagy SVG fájlok optimalizálásával és konvertálásával
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="secondary">
                <Zap className="w-3 h-3 mr-1" />
                Web Workers
              </Badge>
              <Badge variant="secondary">
                <BarChart3 className="w-3 h-3 mr-1" />
                Performance Monitor
              </Badge>
              <Badge variant="secondary">
                <Cog className="w-3 h-3 mr-1" />
                Advanced Cleaning
              </Badge>
            </div>
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Feldolgozás folyamatban...</span>
                    <span>{Math.round(processingProgress)}%</span>
                  </div>
                  <Progress value={processingProgress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing Queue */}
          <ProcessingQueue
            items={queueItems}
            onPause={handleQueuePause}
            onResume={handleQueueResume}
            onCancel={handleQueueCancel}
            onRetry={handleQueueRetry}
            totalProgress={totalQueueProgress}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
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

                  {/* Performance Metrics */}
                  {performanceMonitor.metrics && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Teljesítmény metrikák</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {performanceMonitor.metrics.processingTime.toFixed(0)}ms
                            </div>
                            <div className="text-xs text-muted-foreground">Feldolgozási idő</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {performanceMonitor.metrics.memoryUsage.toFixed(1)}MB
                            </div>
                            <div className="text-xs text-muted-foreground">Memóriahasználat</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {performanceMonitor.metrics.optimizationRatio.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Optimalizálás</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {performanceMonitor.metrics.elementCount}
                            </div>
                            <div className="text-xs text-muted-foreground">Elemek</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

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

            {/* Right Column - Advanced Options */}
            <div className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Alap</TabsTrigger>
                  <TabsTrigger value="advanced">Speciális</TabsTrigger>
                  <TabsTrigger value="performance">Teljesítmény</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-6">
                  <ConversionOptions
                    options={options}
                    onChange={setOptions}
                    fileName={fileName}
                    onFileNameChange={setFileName}
                  />
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-6">
                  <AdvancedCleaningOptions
                    options={cleaningOptions}
                    onChange={setCleaningOptions}
                    precisionValue={precisionValue}
                    onPrecisionChange={setPrecisionValue}
                  />
                </TabsContent>
                
                <TabsContent value="performance" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Teljesítmény beállítások</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        <p>Web Workers: {config.enableWebWorkers ? 'Engedélyezve' : 'Letiltva'}</p>
                        <p>Max fájlméret: {(config.maxFileSize / 1024 / 1024).toFixed(1)} MB</p>
                        <p>Jelenlegi memóriahasználat: {performanceMonitor.getMemoryUsage().toFixed(1)} MB</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Button
                onClick={handleConvert}
                disabled={!svgInput.trim() || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Konvertálás...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Speciális konvertálás
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
