
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConversionOptions, ConversionOptionsState } from '@/components/ConversionOptions';
import { AdvancedCleaningOptions } from '@/components/AdvancedCleaningOptions';
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';

interface AdvancedOptionsPanelProps {
  options: ConversionOptionsState;
  onOptionsChange: (options: ConversionOptionsState) => void;
  fileName: string;
  onFileNameChange: (name: string) => void;
  cleaningOptions: any;
  onCleaningOptionsChange: (options: any) => void;
  precisionValue: number;
  onPrecisionChange: (value: number) => void;
  config: any;
  performanceMonitor: ReturnType<typeof usePerformanceMonitor>;
}

export const AdvancedOptionsPanel: React.FC<AdvancedOptionsPanelProps> = ({
  options,
  onOptionsChange,
  fileName,
  onFileNameChange,
  cleaningOptions,
  onCleaningOptionsChange,
  precisionValue,
  onPrecisionChange,
  config,
  performanceMonitor
}) => {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">Alap</TabsTrigger>
        <TabsTrigger value="advanced">Speciális</TabsTrigger>
        <TabsTrigger value="performance">Teljesítmény</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="space-y-6">
        <ConversionOptions
          options={options}
          onChange={onOptionsChange}
          fileName={fileName}
          onFileNameChange={onFileNameChange}
        />
      </TabsContent>
      
      <TabsContent value="advanced" className="space-y-6">
        <AdvancedCleaningOptions
          options={cleaningOptions}
          onChange={onCleaningOptionsChange}
          precisionValue={precisionValue}
          onPrecisionChange={onPrecisionChange}
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
  );
};
