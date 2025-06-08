
import { useState, useCallback, useRef } from 'react';

export interface PerformanceMetrics {
  memoryUsage: number;
  processingTime: number;
  fileSize: number;
  elementCount: number;
  optimizationRatio: number;
}

export interface PerformanceMonitor {
  startMonitoring: () => void;
  stopMonitoring: () => PerformanceMetrics;
  getMemoryUsage: () => number;
  isMemoryLimitReached: () => boolean;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const startTimeRef = useRef<number>(0);
  const memoryLimitMB = 500; // 500MB limit

  const getMemoryUsage = useCallback((): number => {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }
    return 0;
  }, []);

  const isMemoryLimitReached = useCallback((): boolean => {
    return getMemoryUsage() > memoryLimitMB;
  }, [getMemoryUsage]);

  const startMonitoring = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const stopMonitoring = useCallback((fileSize: number, elementCount: number, optimizedSize: number): PerformanceMetrics => {
    const processingTime = performance.now() - startTimeRef.current;
    const memoryUsage = getMemoryUsage();
    const optimizationRatio = ((fileSize - optimizedSize) / fileSize) * 100;

    const newMetrics: PerformanceMetrics = {
      memoryUsage,
      processingTime,
      fileSize,
      elementCount,
      optimizationRatio
    };

    setMetrics(newMetrics);
    return newMetrics;
  }, [getMemoryUsage]);

  return {
    metrics,
    startMonitoring,
    stopMonitoring,
    getMemoryUsage,
    isMemoryLimitReached
  };
};
