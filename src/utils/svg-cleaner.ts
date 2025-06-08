
export interface CleaningOptions {
  removeDuplicates: boolean;
  cleanupDefinitions: boolean;
  optimizePrecision: boolean;
  simplifyPaths: boolean;
  optimizeColors: boolean;
  normalizeWhitespace: boolean;
  removeUnusedStyles: boolean;
  mergePaths: boolean;
}

export interface CleaningResult {
  cleanedSvg: string;
  removedElements: number;
  sizeReduction: number;
  optimizations: string[];
}

export class SVGCleaner {
  private parser: DOMParser;
  private serializer: XMLSerializer;

  constructor() {
    this.parser = new DOMParser();
    this.serializer = new XMLSerializer();
  }

  clean(svgContent: string, options: CleaningOptions): CleaningResult {
    const originalSize = svgContent.length;
    let svgDoc = this.parser.parseFromString(svgContent, 'image/svg+xml');
    const optimizations: string[] = [];
    let removedElements = 0;

    // Remove duplicates
    if (options.removeDuplicates) {
      const removed = this.removeDuplicateElements(svgDoc);
      removedElements += removed;
      if (removed > 0) optimizations.push(`Removed ${removed} duplicate elements`);
    }

    // Cleanup unused definitions
    if (options.cleanupDefinitions) {
      const removed = this.cleanupUnusedDefinitions(svgDoc);
      removedElements += removed;
      if (removed > 0) optimizations.push(`Cleaned up ${removed} unused definitions`);
    }

    // Optimize precision
    if (options.optimizePrecision) {
      const optimized = this.optimizePrecision(svgDoc);
      if (optimized > 0) optimizations.push(`Optimized precision in ${optimized} elements`);
    }

    // Simplify paths
    if (options.simplifyPaths) {
      const simplified = this.simplifyPaths(svgDoc);
      if (simplified > 0) optimizations.push(`Simplified ${simplified} paths`);
    }

    // Optimize colors
    if (options.optimizeColors) {
      const optimized = this.optimizeColors(svgDoc);
      if (optimized > 0) optimizations.push(`Optimized ${optimized} color values`);
    }

    // Normalize whitespace
    if (options.normalizeWhitespace) {
      this.normalizeWhitespace(svgDoc);
      optimizations.push('Normalized whitespace');
    }

    // Remove unused styles
    if (options.removeUnusedStyles) {
      const removed = this.removeUnusedStyles(svgDoc);
      if (removed > 0) optimizations.push(`Removed ${removed} unused styles`);
    }

    // Merge paths
    if (options.mergePaths) {
      const merged = this.mergePaths(svgDoc);
      if (merged > 0) optimizations.push(`Merged ${merged} compatible paths`);
    }

    const cleanedSvg = this.serializer.serializeToString(svgDoc);
    const sizeReduction = ((originalSize - cleanedSvg.length) / originalSize) * 100;

    return {
      cleanedSvg,
      removedElements,
      sizeReduction,
      optimizations
    };
  }

  private removeDuplicateElements(svgDoc: Document): number {
    const elements = svgDoc.querySelectorAll('*');
    const seen = new Set<string>();
    let removed = 0;

    elements.forEach(element => {
      const serialized = this.serializer.serializeToString(element);
      if (seen.has(serialized) && element.parentNode) {
        element.parentNode.removeChild(element);
        removed++;
      } else {
        seen.add(serialized);
      }
    });

    return removed;
  }

  private cleanupUnusedDefinitions(svgDoc: Document): number {
    const defs = svgDoc.querySelectorAll('defs *[id]');
    const usedIds = new Set<string>();
    let removed = 0;

    // Find all referenced IDs
    svgDoc.querySelectorAll('*').forEach(element => {
      const attributes = ['fill', 'stroke', 'filter', 'clip-path', 'mask', 'href', 'xlink:href'];
      attributes.forEach(attr => {
        const value = element.getAttribute(attr);
        if (value && value.startsWith('url(#')) {
          const id = value.slice(5, -1);
          usedIds.add(id);
        }
      });
    });

    // Remove unused definitions
    defs.forEach(def => {
      const id = def.getAttribute('id');
      if (id && !usedIds.has(id) && def.parentNode) {
        def.parentNode.removeChild(def);
        removed++;
      }
    });

    return removed;
  }

  private optimizePrecision(svgDoc: Document): number {
    const elements = svgDoc.querySelectorAll('*');
    let optimized = 0;

    elements.forEach(element => {
      Array.from(element.attributes).forEach(attr => {
        const value = attr.value;
        if (/^\d+\.\d{3,}$/.test(value)) {
          const rounded = parseFloat(value).toFixed(2);
          element.setAttribute(attr.name, rounded);
          optimized++;
        }
      });
    });

    return optimized;
  }

  private simplifyPaths(svgDoc: Document): number {
    const paths = svgDoc.querySelectorAll('path');
    let simplified = 0;

    paths.forEach(path => {
      const d = path.getAttribute('d');
      if (d) {
        // Basic path simplification - remove redundant commands
        const simplified_d = d
          .replace(/\s+/g, ' ')
          .replace(/([ML])\s*([ML])/g, '$2')
          .replace(/Z\s*Z/g, 'Z')
          .trim();
        
        if (simplified_d !== d) {
          path.setAttribute('d', simplified_d);
          simplified++;
        }
      }
    });

    return simplified;
  }

  private optimizeColors(svgDoc: Document): number {
    const elements = svgDoc.querySelectorAll('*');
    let optimized = 0;

    elements.forEach(element => {
      ['fill', 'stroke'].forEach(attr => {
        const value = element.getAttribute(attr);
        if (value) {
          // Convert rgb() to hex if shorter
          const rgbMatch = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (rgbMatch) {
            const [, r, g, b] = rgbMatch;
            const hex = `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
            element.setAttribute(attr, hex);
            optimized++;
          }
        }
      });
    });

    return optimized;
  }

  private normalizeWhitespace(svgDoc: Document): void {
    const walker = svgDoc.createTreeWalker(
      svgDoc.documentElement,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes: Text[] = [];
    let node: Node | null;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }

    textNodes.forEach(textNode => {
      if (textNode.nodeValue) {
        textNode.nodeValue = textNode.nodeValue.trim();
        if (!textNode.nodeValue) {
          textNode.parentNode?.removeChild(textNode);
        }
      }
    });
  }

  private removeUnusedStyles(svgDoc: Document): number {
    const styleElements = svgDoc.querySelectorAll('style');
    let removed = 0;

    styleElements.forEach(styleElement => {
      if (!styleElement.textContent?.trim()) {
        styleElement.parentNode?.removeChild(styleElement);
        removed++;
      }
    });

    return removed;
  }

  private mergePaths(svgDoc: Document): number {
    const paths = svgDoc.querySelectorAll('path');
    let merged = 0;

    // Group paths by similar attributes
    const pathGroups: { [key: string]: Element[] } = {};
    
    paths.forEach(path => {
      const key = `${path.getAttribute('fill')}-${path.getAttribute('stroke')}-${path.getAttribute('stroke-width')}`;
      if (!pathGroups[key]) pathGroups[key] = [];
      pathGroups[key].push(path);
    });

    // Merge compatible paths
    Object.values(pathGroups).forEach(group => {
      if (group.length > 1) {
        const firstPath = group[0];
        const mergedD = group.map(path => path.getAttribute('d')).join(' ');
        firstPath.setAttribute('d', mergedD);
        
        // Remove other paths
        for (let i = 1; i < group.length; i++) {
          group[i].parentNode?.removeChild(group[i]);
          merged++;
        }
      }
    });

    return merged;
  }
}
