import React from "react";
import { Icon } from "@iconify/react";
import { Switch, Tooltip } from "@heroui/react";

export interface ConversionOptionsState {
  cleanupIds: boolean;
  quotes: boolean;
  memo: boolean;
  typescript: boolean;
  removeComments: boolean;
  formatCode: boolean;
  extractCss: boolean;
  optimizeSvg: boolean;
}

interface ConversionOptionsProps {
  options: ConversionOptionsState;
  setOptions: React.Dispatch<React.SetStateAction<ConversionOptionsState>>;
}

export const ConversionOptions: React.FC<ConversionOptionsProps> = ({ 
  options, 
  setOptions 
}) => {
  const handleToggle = (key: keyof ConversionOptionsState) => {
    setOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const ToggleOption: React.FC<{
    id: keyof ConversionOptionsState;
    label: string;
    checked: boolean;
    onChange: () => void;
    tooltip?: string;
  }> = ({ id, label, checked, onChange, tooltip }) => (
    <Tooltip content={tooltip || `Toggle ${label}`}>
      <div className="flex items-center gap-2 hover:bg-default-100 px-3 py-2 rounded-lg transition-colors">
        <Switch
          size="sm"
          isSelected={checked}
          onValueChange={onChange}
          aria-label={label}
          className={checked ? "group-hover:bg-primary" : ""}
        />
        <span className="text-xs font-medium">{label}</span>
      </div>
    </Tooltip>
  );

  return (
    <div className="flex flex-wrap items-center gap-4 md:gap-6">
      <div className="hidden md:flex items-center gap-3">
        <span className="text-default-500 text-sm">Input</span>
        <span className="font-mono text-sm bg-primary/10 text-primary px-2 py-1 rounded">SVG</span>
        <Icon icon="lucide:arrow-right" className="text-default-400" />
        <Icon icon="lucide:settings" className="text-primary" />
        <Icon icon="lucide:arrow-right" className="text-default-400" />
        <span className="font-mono text-sm bg-success/10 text-success px-2 py-1 rounded">JSX</span>
        <span className="text-default-500 text-sm">Output</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-1">
        <ToggleOption
          id="cleanupIds"
          label="Cleanup IDs"
          checked={options.cleanupIds}
          onChange={() => handleToggle("cleanupIds")}
          tooltip="Remove ID attributes from SVG elements"
        />
        
        <ToggleOption
          id="quotes"
          label="Quotes"
          checked={options.quotes}
          onChange={() => handleToggle("quotes")}
          tooltip="Format quotes in JSX output"
        />
        
        <ToggleOption
          id="memo"
          label="Memo"
          checked={options.memo}
          onChange={() => handleToggle("memo")}
          tooltip="Wrap component with React.memo"
        />
        
        <ToggleOption
          id="typescript"
          label="TypeScript"
          checked={options.typescript}
          onChange={() => handleToggle("typescript")}
          tooltip="Generate TypeScript component"
        />
        
        <ToggleOption
          id="removeComments"
          label="Remove Comments"
          checked={options.removeComments}
          onChange={() => handleToggle("removeComments")}
          tooltip="Remove comments from SVG"
        />
        
        <ToggleOption
          id="formatCode"
          label="Format Code"
          checked={options.formatCode}
          onChange={() => handleToggle("formatCode")}
          tooltip="Format output code"
        />
        
        <ToggleOption
          id="extractCss"
          label="Extract CSS"
          checked={options.extractCss}
          onChange={() => handleToggle("extractCss")}
          tooltip="Extract inline styles to separate CSS"
        />
        
        <ToggleOption
          id="optimizeSvg"
          label="Optimize SVG"
          checked={options.optimizeSvg}
          onChange={() => handleToggle("optimizeSvg")}
          tooltip="Optimize SVG by removing unnecessary attributes"
        />
      </div>
    </div>
  );
};