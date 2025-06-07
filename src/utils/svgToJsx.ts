
export interface ConversionOptions {
  removeComments: boolean;
  formatCode: boolean;
  componentName: string;
  addTypescript: boolean;
}

export function svgToJsx(svgContent: string, options: ConversionOptions): string {
  let processedSvg = svgContent.trim();

  // Remove XML declaration and DOCTYPE if present
  processedSvg = processedSvg.replace(/<\?xml[^>]*\?>/g, '');
  processedSvg = processedSvg.replace(/<!DOCTYPE[^>]*>/g, '');

  // Remove comments if requested
  if (options.removeComments) {
    processedSvg = processedSvg.replace(/<!--[\s\S]*?-->/g, '');
  }

  // Convert hyphenated attributes to camelCase
  const attributeMap: Record<string, string> = {
    'stroke-width': 'strokeWidth',
    'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin',
    'stroke-dasharray': 'strokeDasharray',
    'stroke-dashoffset': 'strokeDashoffset',
    'fill-rule': 'fillRule',
    'clip-rule': 'clipRule',
    'font-family': 'fontFamily',
    'font-size': 'fontSize',
    'font-weight': 'fontWeight',
    'text-anchor': 'textAnchor',
    'dominant-baseline': 'dominantBaseline',
    'alignment-baseline': 'alignmentBaseline',
    'baseline-shift': 'baselineShift',
    'stop-color': 'stopColor',
    'stop-opacity': 'stopOpacity',
    'marker-start': 'markerStart',
    'marker-mid': 'markerMid',
    'marker-end': 'markerEnd',
  };

  // Replace hyphenated attributes
  Object.entries(attributeMap).forEach(([hyphenated, camelCase]) => {
    const regex = new RegExp(`\\b${hyphenated}=`, 'g');
    processedSvg = processedSvg.replace(regex, `${camelCase}=`);
  });

  // Replace class with className
  processedSvg = processedSvg.replace(/\bclass=/g, 'className=');

  // Handle self-closing tags that need to be properly closed in JSX
  const selfClosingTags = ['path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'stop', 'use'];
  selfClosingTags.forEach(tag => {
    const regex = new RegExp(`<${tag}([^>]*[^/])>`, 'g');
    processedSvg = processedSvg.replace(regex, `<${tag}$1 />`);
  });

  // Clean up extra whitespace
  processedSvg = processedSvg.replace(/\s+/g, ' ').trim();

  // Add props handling to SVG element
  processedSvg = processedSvg.replace(
    /<svg([^>]*)>/,
    '<svg$1 {...props}>'
  );

  // Format the component
  const imports = options.addTypescript 
    ? "import React from 'react';\nimport { SVGProps } from 'react';\n\n"
    : "import React from 'react';\n\n";

  const propsType = options.addTypescript ? ': React.FC<SVGProps<SVGSVGElement>>' : '';

  let component = `${imports}const ${options.componentName}${propsType} = (props) => (\n  ${processedSvg}\n);\n\nexport default ${options.componentName};`;

  // Basic formatting if requested
  if (options.formatCode) {
    component = component
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .replace(/>\s*</g, '>\n  <')
      .replace(/  \s+/g, '  ');
  }

  return component;
}

export function validateSvg(content: string): { isValid: boolean; error?: string } {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'image/svg+xml');
    
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      return {
        isValid: false,
        error: 'Invalid SVG format: ' + parseError.textContent
      };
    }

    const svgElement = doc.querySelector('svg');
    if (!svgElement) {
      return {
        isValid: false,
        error: 'No SVG element found in the content'
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to parse SVG: ' + (error as Error).message
    };
  }
}
