import React, { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/react";

interface SVGPreviewProps {
  svgContent: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export const SVGPreview: React.FC<SVGPreviewProps> = ({ 
  svgContent, 
  isVisible, 
  onToggleVisibility 
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasError, setHasError] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.1));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.1, Math.min(5, prev * delta)));
  };

  // Validate SVG content
  React.useEffect(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");
      const parserError = doc.querySelector("parsererror");
      setHasError(!!parserError || !doc.querySelector("svg"));
    } catch {
      setHasError(true);
    }
  }, [svgContent]);

  if (!isVisible) {
    return (
      <div className="bg-content2 rounded-lg border border-divider p-6 text-center">
        <Icon icon="lucide:eye-off" className="w-12 h-12 mx-auto mb-4 text-default-400" />
        <p className="text-default-500 mb-4">Preview is hidden</p>
        <Button
          color="primary"
          variant="flat"
          onPress={onToggleVisibility}
          startContent={<Icon icon="lucide:eye" />}
        >
          Show Preview
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-content1 rounded-lg border border-divider overflow-hidden shadow-md">
      {/* Preview Header */}
      <div className="bg-content2 px-4 py-3 border-b border-divider flex items-center justify-between">
        <h3 className="text-sm font-medium">Live Preview</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
            LIVE
          </span>
          <div className="flex items-center gap-1">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => setShowGrid(!showGrid)}
              aria-label="Toggle grid"
            >
              <Icon icon="lucide:grid" size={14} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={handleZoomOut}
              aria-label="Zoom out"
            >
              <Icon icon="lucide:zoom-out" size={14} />
            </Button>
            <span className="text-xs text-default-500 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={handleZoomIn}
              aria-label="Zoom in"
            >
              <Icon icon="lucide:zoom-in" size={14} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={handleReset}
              aria-label="Reset view"
            >
              <Icon icon="lucide:rotate-ccw" size={14} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={onToggleVisibility}
              aria-label="Hide preview"
            >
              <Icon icon="lucide:eye-off" size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="relative h-80 overflow-hidden">
        <div
          ref={containerRef}
          className={`w-full h-full flex items-center justify-center ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {hasError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-danger/20 rounded-full flex items-center justify-center">
                  <Icon icon="lucide:x" className="w-8 h-8 text-danger" />
                </div>
                <p className="text-danger font-medium mb-2">Invalid SVG</p>
                <p className="text-default-500 text-sm">Please check your SVG syntax</p>
              </div>
            </div>
          ) : !svgContent.trim() ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Icon icon="lucide:upload" className="w-8 h-8 mx-auto mb-2 text-default-400 opacity-50" />
                <p className="text-default-500">Upload or paste SVG code to see preview</p>
              </div>
            </div>
          ) : (
            <div
              className="transition-transform duration-200 ease-out"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center"
              }}
            >
              <div
                className="text-foreground drop-shadow-md"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
          )}
        </div>

        {/* Grid Background */}
        {showGrid && (
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(128,128,128,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(128,128,128,0.3) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px"
            }}
          />
        )}

        {/* Pan indicator */}
        {(pan.x !== 0 || pan.y !== 0) && (
          <div className="absolute top-2 left-2 bg-content1/80 backdrop-blur-sm rounded px-2 py-1 text-xs font-mono text-default-600">
            <Icon icon="lucide:move" className="w-3 h-3 inline mr-1" />
            {Math.round(pan.x)}, {Math.round(pan.y)}
          </div>
        )}
      </div>

      {/* Preview Info */}
      <div className="bg-content2 px-4 py-2 border-t border-divider">
        <div className="flex items-center justify-between text-xs text-default-500">
          <span className={`px-2 py-1 rounded text-xs font-mono ${hasError ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
            {hasError ? "Error in SVG" : "Valid SVG"}
          </span>
          <span>
            Zoom: {Math.round(zoom * 100)}% | Pan: ({Math.round(pan.x)}, {Math.round(pan.y)})
          </span>
        </div>
      </div>
    </div>
  );
};