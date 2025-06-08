
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SvgAnalysisData {
  elementCount: number;
  pathCount: number;
  groupCount: number;
  fileSize: number;
}

interface SvgAnalysisProps {
  analysis: SvgAnalysisData;
}

export const SvgAnalysis: React.FC<SvgAnalysisProps> = ({ analysis }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SVG Analízis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {analysis.elementCount}
            </div>
            <div className="text-xs text-muted-foreground">Elements</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {analysis.pathCount}
            </div>
            <div className="text-xs text-muted-foreground">Paths</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {analysis.groupCount}
            </div>
            <div className="text-xs text-muted-foreground">Groups</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {(analysis.fileSize / 1024).toFixed(1)} KB
            </div>
            <div className="text-xs text-muted-foreground">File Size</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
