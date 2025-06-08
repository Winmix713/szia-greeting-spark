
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates if the provided content is a valid SVG
 */
export const validateSvg = (content: string): ValidationResult => {
  // Check if content is empty
  if (!content.trim()) {
    return {
      isValid: false,
      error: "SVG content is empty"
    };
  }

  try {
    // Try to parse the SVG
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(content, "image/svg+xml");
    
    // Check for parsing errors
    const parserError = svgDoc.querySelector("parsererror");
    if (parserError) {
      return {
        isValid: false,
        error: "Invalid SVG format: XML parsing error"
      };
    }
    
    // Check if root element is SVG
    const rootElement = svgDoc.documentElement;
    if (rootElement.nodeName !== "svg") {
      return {
        isValid: false,
        error: "Root element is not an SVG"
      };
    }
    
    // Validate required attributes
    if (!rootElement.hasAttribute("viewBox") && 
        (!rootElement.hasAttribute("width") || !rootElement.hasAttribute("height"))) {
      return {
        isValid: false,
        error: "SVG missing required viewBox or width/height attributes"
      };
    }
    
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: "Failed to parse SVG: " + (error instanceof Error ? error.message : String(error))
    };
  }
};

/**
 * Optimizes SVG by removing unnecessary attributes and elements
 */
export const optimizeSvg = (content: string): string => {
  try {
    // Parse SVG
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(content, "image/svg+xml");
    
    // Remove comments
    const comments = svgDoc.querySelectorAll("comment");
    comments.forEach(comment => comment.remove());
    
    // Remove empty groups
    const emptyGroups = svgDoc.querySelectorAll("g:empty");
    emptyGroups.forEach(group => group.remove());
    
    // Remove unused defs
    const defs = svgDoc.querySelectorAll("defs");
    defs.forEach(def => {
      if (!def.hasChildNodes()) {
        def.remove();
      }
    });
    
    // Remove unnecessary attributes
    const allElements = svgDoc.querySelectorAll("*");
    allElements.forEach(el => {
      // Remove data-* attributes
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith("data-")) {
          el.removeAttribute(attr.name);
        }
      });
      
      // Remove Figma-specific attributes
      ["figma:type", "figma:id"].forEach(attr => {
        if (el.hasAttribute(attr)) {
          el.removeAttribute(attr);
        }
      });
    });
    
    // Serialize back to string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgDoc);
  } catch (error) {
    console.error("SVG optimization failed:", error);
    return content; // Return original content if optimization fails
  }
};

/**
 * Analyzes SVG complexity to provide insights
 */
export const analyzeSvg = (content: string) => {
  try {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(content, "image/svg+xml");
    
    return {
      elementCount: svgDoc.querySelectorAll("*").length,
      pathCount: svgDoc.querySelectorAll("path").length,
      groupCount: svgDoc.querySelectorAll("g").length,
      defsCount: svgDoc.querySelectorAll("defs").length,
      styleCount: svgDoc.querySelectorAll("style").length,
      hasInlineStyles: svgDoc.querySelectorAll("[style]").length > 0,
      fileSize: new Blob([content]).size,
      hasFigmaAttributes: Array.from(svgDoc.querySelectorAll("*")).some(el => 
        el.hasAttribute("figma:type") || el.hasAttribute("figma:id")
      )
    };
  } catch (error) {
    console.error("SVG analysis failed:", error);
    return null;
  }
};
