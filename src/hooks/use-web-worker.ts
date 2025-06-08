
import { useCallback, useRef } from 'react';

export interface WorkerTask {
  id: string;
  type: 'convert' | 'clean' | 'analyze';
  data: any;
}

export interface WorkerResult {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
}

export const useWebWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const tasksRef = useRef<Map<string, (result: WorkerResult) => void>>(new Map());

  const initWorker = useCallback(() => {
    if (!workerRef.current) {
      // Create worker from inline script for simplicity
      const workerScript = `
        self.onmessage = function(e) {
          const { id, type, data } = e.data;
          
          try {
            let result;
            
            switch (type) {
              case 'convert':
                result = convertSvgToJsx(data);
                break;
              case 'clean':
                result = cleanSvg(data);
                break;
              case 'analyze':
                result = analyzeSvg(data);
                break;
              default:
                throw new Error('Unknown task type: ' + type);
            }
            
            self.postMessage({ id, success: true, result });
          } catch (error) {
            self.postMessage({ id, success: false, error: error.message });
          }
        };
        
        function convertSvgToJsx(data) {
          const { svgContent, options } = data;
          // Simplified conversion logic for worker
          return {
            jsx: svgContent.replace(/class=/g, 'className=').replace(/stroke-width/g, 'strokeWidth'),
            css: ''
          };
        }
        
        function cleanSvg(data) {
          const { svgContent, options } = data;
          // Simplified cleaning logic for worker
          return {
            cleanedSvg: svgContent.replace(/\\s+/g, ' ').trim(),
            optimizations: ['Normalized whitespace'],
            sizeReduction: 10
          };
        }
        
        function analyzeSvg(data) {
          const { svgContent } = data;
          const elementCount = (svgContent.match(/<[^>]+>/g) || []).length;
          const pathCount = (svgContent.match(/<path/g) || []).length;
          
          return {
            elementCount,
            pathCount,
            fileSize: svgContent.length,
            complexity: elementCount > 1000 ? 'high' : elementCount > 100 ? 'medium' : 'low'
          };
        }
      `;

      const blob = new Blob([workerScript], { type: 'application/javascript' });
      workerRef.current = new Worker(URL.createObjectURL(blob));

      workerRef.current.onmessage = (e) => {
        const result: WorkerResult = e.data;
        const callback = tasksRef.current.get(result.id);
        if (callback) {
          callback(result);
          tasksRef.current.delete(result.id);
        }
      };
    }
  }, []);

  const executeTask = useCallback((task: WorkerTask): Promise<WorkerResult> => {
    return new Promise((resolve) => {
      initWorker();
      
      if (!workerRef.current) {
        resolve({ id: task.id, success: false, error: 'Worker not available' });
        return;
      }

      tasksRef.current.set(task.id, resolve);
      workerRef.current.postMessage(task);
    });
  }, [initWorker]);

  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      tasksRef.current.clear();
    }
  }, []);

  return {
    executeTask,
    terminateWorker
  };
};
