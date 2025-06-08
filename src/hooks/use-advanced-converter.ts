
import React from "react";
import { ConversionOptionsState } from "../components/ConversionOptions";
import { CleaningOptions, SVGCleaner } from "../utils/svg-cleaner";
import { optimizeSvg } from "../utils/svg-utils";
import { usePerformanceMonitor } from "./use-performance-monitor";
import { useWebWorker } from "./use-web-worker";

export interface AdvancedConverterConfig {
  enableWebWorkers: boolean;
  enableStreaming: boolean;
  maxFileSize: number; // in bytes
  chunkSize: number; // for streaming
}

export const useAdvancedConverter = () => {
  const [svgInput, setSvgInput] = React.useState<string>("");
  const [jsxOutput, setJsxOutput] = React.useState<string>("");
  const [cssOutput, setCssOutput] = React.useState<string>("");
  const [fileName, setFileName] = React.useState<string>("SvgIcon");
  const [copied, setCopied] = React.useState<boolean>(false);
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = React.useState<number>(0);

  const [options, setOptions] = React.useState<ConversionOptionsState>({
    cleanupIds: true,
    quotes: true,
    memo: true,
    typescript: true,
    removeComments: true,
    formatCode: true,
    extractCss: true,
    optimizeSvg: true
  });

  const [cleaningOptions, setCleaningOptions] = React.useState<CleaningOptions>({
    removeDuplicates: true,
    cleanupDefinitions: true,
    optimizePrecision: true,
    simplifyPaths: true,
    optimizeColors: true,
    normalizeWhitespace: true,
    removeUnusedStyles: true,
    mergePaths: false
  });

  const [config, setConfig] = React.useState<AdvancedConverterConfig>({
    enableWebWorkers: true,
    enableStreaming: false,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    chunkSize: 100 * 1024 // 100KB
  });

  const performanceMonitor = usePerformanceMonitor();
  const webWorker = useWebWorker();
  const svgCleaner = React.useMemo(() => new SVGCleaner(), []);

  const convertSvgToJsx = React.useCallback(async () => {
    if (!svgInput.trim()) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    performanceMonitor.startMonitoring();

    try {
      // Check memory before processing
      if (performanceMonitor.isMemoryLimitReached()) {
        throw new Error("Memory limit reached. Please try with a smaller file.");
      }

      let processedSvg = svgInput;
      setProcessingProgress(10);

      // Advanced cleaning if enabled
      if (Object.values(cleaningOptions).some(v => v)) {
        setProcessingProgress(25);
        const cleaningResult = svgCleaner.clean(processedSvg, cleaningOptions);
        processedSvg = cleaningResult.cleanedSvg;
        console.log('Cleaning optimizations:', cleaningResult.optimizations);
      }

      // Basic SVG optimization
      if (options.optimizeSvg) {
        setProcessingProgress(40);
        processedSvg = optimizeSvg(processedSvg);
      }

      setProcessingProgress(60);

      // Use web worker for large files
      if (config.enableWebWorkers && processedSvg.length > config.maxFileSize / 10) {
        const result = await webWorker.executeTask({
          id: `convert-${Date.now()}`,
          type: 'convert',
          data: { svgContent: processedSvg, options }
        });

        if (result.success && result.result) {
          setJsxOutput(result.result.jsx);
          setCssOutput(result.result.css || '');
        } else {
          throw new Error(result.error || 'Worker conversion failed');
        }
      } else {
        // Process locally
        const conversionResult = await processLocally(processedSvg);
        setJsxOutput(conversionResult.jsx);
        setCssOutput(conversionResult.css);
      }

      setProcessingProgress(100);

      // Record performance metrics
      const metrics = performanceMonitor.stopMonitoring(
        svgInput.length,
        (svgInput.match(/<[^>]+>/g) || []).length,
        processedSvg.length
      );
      console.log('Processing metrics:', metrics);

    } catch (error) {
      console.error("Advanced conversion error:", error);
      setJsxOutput(`// Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCssOutput("");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessingProgress(0), 1000);
    }
  }, [svgInput, options, cleaningOptions, config, performanceMonitor, webWorker, svgCleaner]);

  const processLocally = React.useCallback(async (svgContent: string) => {
    // Enhanced local processing with streaming simulation
    return new Promise<{ jsx: string; css: string }>((resolve) => {
      setTimeout(() => {
        let processedSvg = svgContent;

        // Convert SVG attributes to JSX format
        processedSvg = processedSvg
          .replace(/stroke-width/g, "strokeWidth")
          .replace(/stroke-linecap/g, "strokeLinecap")
          .replace(/stroke-linejoin/g, "strokeLinejoin")
          .replace(/fill-rule/g, "fillRule")
          .replace(/clip-rule/g, "clipRule")
          .replace(/class=/g, "className=");

        // Clean up IDs if enabled
        if (options.cleanupIds) {
          processedSvg = processedSvg.replace(/\s*id="[^"]*"/g, "");
        }

        // Remove comments if enabled
        if (options.removeComments) {
          processedSvg = processedSvg.replace(/<!--[\s\S]*?-->/g, "");
        }

        // Generate component
        const componentName = fileName.replace(/[^a-zA-Z0-9]/g, "") || "SvgIcon";
        
        const jsxComponent = options.typescript 
          ? `import React${options.memo ? ", { memo }" : ""} from "react";

interface ${componentName}Props {
  className?: string;
  size?: number;
  color?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ 
  className, 
  size = 24,
  color
}) => {
  return (
    ${processedSvg
      .replace(/width="[^"]*"/, 'width={size}')
      .replace(/height="[^"]*"/, 'height={size}')
      .replace(/stroke="currentColor"/, 'stroke={color || "currentColor"}')}
  );
};

export default ${options.memo ? `memo(${componentName})` : componentName};`
          : `import React${options.memo ? ", { memo }" : ""} from "react";

const ${componentName} = ({ className, size = 24, color }) => {
  return (
    ${processedSvg
      .replace(/width="[^"]*"/, 'width={size}')
      .replace(/height="[^"]*"/, 'height={size}')
      .replace(/stroke="currentColor"/, 'stroke={color || "currentColor"}')}
  );
};

export default ${options.memo ? `memo(${componentName})` : componentName};`;

        resolve({
          jsx: jsxComponent,
          css: ""
        });
      }, 100); // Simulate processing time
    });
  }, [options, fileName]);

  const copyToClipboard = React.useCallback(async (content: string = jsxOutput) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [jsxOutput]);

  const downloadFile = React.useCallback((extension: string, content: string = jsxOutput) => {
    const blob = new Blob([content], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [fileName, jsxOutput]);

  const downloadCssFile = React.useCallback(() => {
    if (!cssOutput) return;
    
    const blob = new Blob([cssOutput], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.module.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [cssOutput, fileName]);

  return {
    // State
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
    
    // Actions
    convertSvgToJsx,
    copyToClipboard,
    downloadFile,
    downloadCssFile,
    
    // Advanced features
    performanceMonitor,
    webWorker
  };
};
