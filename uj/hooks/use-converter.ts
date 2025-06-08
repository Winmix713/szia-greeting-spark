import React from "react";
import { ConversionOptionsState } from "../components/conversion-options";
import { optimizeSvg } from "../utils/svg-utils";

export interface ConversionResult {
  jsx: string;
  css?: string;
}

export const useConverter = () => {
  const [svgInput, setSvgInput] = React.useState<string>(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`);

  const [jsxOutput, setJsxOutput] = React.useState<string>("");
  const [cssOutput, setCssOutput] = React.useState<string>("");
  const [fileName, setFileName] = React.useState<string>("LayersIcon");
  const [copied, setCopied] = React.useState<boolean>(false);

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

  const convertSvgToJsx = () => {
    try {
      // Optimize SVG if enabled
      let processedSvg = options.optimizeSvg ? optimizeSvg(svgInput) : svgInput;
      
      // Parse SVG and extract attributes
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(processedSvg, "image/svg+xml");
      const svgElement = svgDoc.querySelector("svg");
      
      if (!svgElement) {
        throw new Error("Invalid SVG format");
      }

      // Extract CSS if enabled
      let extractedCss = "";
      let jsxContent = processedSvg;
      
      if (options.extractCss) {
        const result = extractCssFromSvg(processedSvg);
        jsxContent = result.jsx;
        extractedCss = result.css;
      }

      // Convert SVG attributes to JSX format
      jsxContent = jsxContent
        .replace(/stroke-width/g, "strokeWidth")
        .replace(/stroke-linecap/g, "strokeLinecap")
        .replace(/stroke-linejoin/g, "strokeLinejoin")
        .replace(/fill-rule/g, "fillRule")
        .replace(/clip-rule/g, "clipRule")
        .replace(/class=/g, "className=")
        .replace(/style="([^"]*)"/g, (match, styleContent) => {
          // Convert style attribute to JSX style object
          const styleObject = styleContent
            .split(';')
            .filter(Boolean)
            .map(style => {
              const [property, value] = style.split(':').map(s => s.trim());
              // Convert kebab-case to camelCase
              const camelCaseProp = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
              return `${camelCaseProp}: "${value}"`;
            })
            .join(', ');
          
          return `style={{${styleObject}}}`;
        });

      // Clean up IDs if enabled
      if (options.cleanupIds) {
        jsxContent = jsxContent.replace(/\s*id="[^"]*"/g, "");
      }

      // Remove comments if enabled
      if (options.removeComments) {
        jsxContent = jsxContent.replace(/<!--[\s\S]*?-->/g, "");
      }

      // Format quotes if enabled
      if (options.quotes) {
        jsxContent = jsxContent.replace(/="/g, '="').replace(/"/g, '"');
      }

      // Generate component name from filename
      const componentName = fileName.replace(/[^a-zA-Z0-9]/g, "") || "SvgIcon";
      
      // Create CSS module import if CSS was extracted
      const cssImport = extractedCss ? `import styles from "./${componentName}.module.css";\n\n` : "";

      // Create the JSX component
      const jsxComponent = options.typescript 
        ? `${cssImport}import React${options.memo ? ", { memo }" : ""} from "react";

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
    ${jsxContent
      .replace(/width="[^"]*"/, 'width={size}')
      .replace(/height="[^"]*"/, 'height={size}')
      .replace(/stroke="currentColor"/, 'stroke={color || "currentColor"}')
      .replace(/class="([^"]*)"/g, 'className={`${styles.$1} ${className || ""}`}')}
  );
};

export default ${options.memo ? `memo(${componentName})` : componentName};`
        : `${cssImport}import React${options.memo ? ", { memo }" : ""} from "react";

const ${componentName} = ({ className, size = 24, color }) => {
  return (
    ${jsxContent
      .replace(/width="[^"]*"/, 'width={size}')
      .replace(/height="[^"]*"/, 'height={size}')
      .replace(/stroke="currentColor"/, 'stroke={color || "currentColor"}')
      .replace(/class="([^"]*)"/g, 'className={`${styles.$1} ${className || ""}`}')}
  );
};

export default ${options.memo ? `memo(${componentName})` : componentName};`;

      // Format code if enabled
      const formattedJsx = options.formatCode 
        ? formatJsxCode(jsxComponent) 
        : jsxComponent;

      setJsxOutput(formattedJsx);
      setCssOutput(extractedCss);
    } catch (error) {
      console.error("Conversion error:", error);
      setJsxOutput("// Error: Invalid SVG format. Please check your input.");
      setCssOutput("");
    }
  };

  // Extract CSS from SVG
  const extractCssFromSvg = (svgContent: string): ConversionResult => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
    
    // Find all style tags
    const styleTags = svgDoc.querySelectorAll("style");
    let cssContent = "";
    
    // Extract CSS from style tags
    styleTags.forEach(styleTag => {
      cssContent += styleTag.textContent + "\n";
      styleTag.remove(); // Remove the style tag from SVG
    });
    
    // Find all elements with inline styles
    const elementsWithStyle = svgDoc.querySelectorAll("[style]");
    const inlineStyles: Record<string, string> = {};
    
    // Extract inline styles
    elementsWithStyle.forEach((element, index) => {
      const style = element.getAttribute("style");
      if (style) {
        const className = `svg_element_${index}`;
        inlineStyles[className] = style;
        element.removeAttribute("style");
        element.setAttribute("class", className);
      }
    });
    
    // Convert inline styles to CSS
    if (Object.keys(inlineStyles).length > 0) {
      cssContent += "\n/* Extracted inline styles */\n";
      for (const [className, style] of Object.entries(inlineStyles)) {
        cssContent += `.${className} {\n  ${style.replace(/;/g, ";\n  ")}\n}\n`;
      }
    }
    
    // Serialize the modified SVG back to string
    const serializer = new XMLSerializer();
    const modifiedSvg = serializer.serializeToString(svgDoc);
    
    return {
      jsx: modifiedSvg,
      css: cssContent
    };
  };

  // Simple code formatter
  const formatJsxCode = (code: string): string => {
    try {
      // This is a simple formatter - in a real app you might use a library like prettier
      return code
        .replace(/\s{2,}/g, ' ')
        .replace(/> </g, '>\n<')
        .replace(/;/g, ';\n')
        .replace(/{/g, '{\n  ')
        .replace(/}/g, '\n}');
    } catch (error) {
      console.error("Formatting error:", error);
      return code;
    }
  };

  const copyToClipboard = async (content: string = jsxOutput) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const downloadFile = (extension: string, content: string = jsxOutput) => {
    const blob = new Blob([content], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCssFile = () => {
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
  };

  return {
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
  };
};