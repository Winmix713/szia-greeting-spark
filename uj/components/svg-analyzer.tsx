import React from "react";
import { Card, CardBody, CardHeader, Divider, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { analyzeSvg } from "../utils/svg-utils";

interface SVGAnalyzerProps {
  svgContent: string;
}

export const SVGAnalyzer: React.FC<SVGAnalyzerProps> = ({ svgContent }) => {
  const analysis = React.useMemo(() => {
    return analyzeSvg(svgContent);
  }, [svgContent]);

  if (!analysis) {
    return null;
  }

  // Calculate complexity score (0-100)
  const calculateComplexity = () => {
    const elementScore = Math.min(analysis.elementCount / 100, 1) * 30; // Max 30 points
    const pathScore = Math.min(analysis.pathCount / 50, 1) * 30; // Max 30 points
    const styleScore = (analysis.styleCount > 0 || analysis.hasInlineStyles ? 1 : 0) * 20; // 20 points
    const sizeScore = Math.min(analysis.fileSize / 10000, 1) * 20; // Max 20 points
    
    return Math.min(Math.round(elementScore + pathScore + styleScore + sizeScore), 100);
  };

  const complexity = calculateComplexity();
  
  // Determine complexity level
  const getComplexityLevel = () => {
    if (complexity < 30) return { level: "Simple", color: "success" };
    if (complexity < 70) return { level: "Moderate", color: "warning" };
    return { level: "Complex", color: "danger" };
  };
  
  const { level, color } = getComplexityLevel();

  return (
    <Card className="shadow-md">
      <CardHeader>
        <h3 className="text-lg font-medium">SVG Analysis</h3>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Complexity</span>
              <span className="text-sm font-medium">{complexity}%</span>
            </div>
            <Progress 
              value={complexity} 
              color={color as "success" | "warning" | "danger"} 
              className="h-2"
              aria-label="SVG complexity"
            />
            <div className="text-right mt-1">
              <span className={`text-xs text-${color}`}>{level}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="flex flex-col items-center p-3 bg-content2 rounded-lg">
              <Icon icon="lucide:layers" className="text-primary mb-2" size={20} />
              <div className="text-xl font-bold">{analysis.elementCount}</div>
              <div className="text-xs text-default-500">Elements</div>
            </div>
            
            <div className="flex flex-col items-center p-3 bg-content2 rounded-lg">
              <Icon icon="lucide:pen-tool" className="text-primary mb-2" size={20} />
              <div className="text-xl font-bold">{analysis.pathCount}</div>
              <div className="text-xs text-default-500">Paths</div>
            </div>
            
            <div className="flex flex-col items-center p-3 bg-content2 rounded-lg">
              <Icon icon="lucide:folder" className="text-primary mb-2" size={20} />
              <div className="text-xl font-bold">{analysis.groupCount}</div>
              <div className="text-xs text-default-500">Groups</div>
            </div>
            
            <div className="flex flex-col items-center p-3 bg-content2 rounded-lg">
              <Icon icon="lucide:file" className="text-primary mb-2" size={20} />
              <div className="text-xl font-bold">{(analysis.fileSize / 1024).toFixed(1)} KB</div>
              <div className="text-xs text-default-500">File Size</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {analysis.styleCount > 0 && (
              <div className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full">
                Contains {analysis.styleCount} style tag{analysis.styleCount > 1 ? 's' : ''}
              </div>
            )}
            
            {analysis.hasInlineStyles && (
              <div className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full">
                Has inline styles
              </div>
            )}
            
            {analysis.hasFigmaAttributes && (
              <div className="px-2 py-1 bg-info/10 text-info text-xs rounded-full">
                Figma export
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};