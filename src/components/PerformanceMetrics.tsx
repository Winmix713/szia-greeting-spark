
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceMetrics as PerformanceMetricsType } from '@/hooks/use-performance-monitor';

interface PerformanceMetricsProps {
  metrics: PerformanceMetricsType;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Teljesítmény metrikák</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {metrics.processingTime.toFixed(0)}ms
            </div>
            <div className="text-xs text-muted-foreground">Feldolgozási idő</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {metrics.memoryUsage.toFixed(1)}MB
            </div>
            <div className="text-xs text-muted-foreground">Memóriahasználat</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {metrics.optimizationRatio.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Optimalizálás</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {metrics.elementCount}
            </div>
            <div className="text-xs text-muted-foreground">Elemek</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
