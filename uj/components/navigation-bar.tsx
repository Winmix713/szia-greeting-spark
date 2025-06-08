import React from "react";
import { Icon } from "@iconify/react";
import { Switch } from "@heroui/react";
import { ConversionOptionsState } from "./conversion-options";

interface NavigationBarProps {
  options: ConversionOptionsState;
  onOptionsChange: (options: ConversionOptionsState) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ 
  options, 
  onOptionsChange 
}) => {
  const handleToggle = (key: keyof ConversionOptionsState) => {
    onOptionsChange({
      ...options,
      [key]: !options[key]
    });
  };

  const ToggleSwitch: React.FC<{
    id: keyof ConversionOptionsState;
    label: string;
    checked: boolean;
    onChange: () => void;
  }> = ({ id, label, checked, onChange }) => (
    <label 
      className="group flex items-center gap-3 cursor-pointer hover:bg-content2 px-3 py-2 rounded-lg transition-all duration-200" 
      htmlFor={id}
    >
      <small className="text-xs font-bold uppercase text-foreground tracking-wider">
        {label}
      </small>
      <div className={`relative w-11 h-6 transition-all duration-300 rounded-full ${
        checked ? 'bg-success' : 'bg-default-200'
      }`}>
        <div className={`absolute top-0.5 w-5 h-5 bg-background rounded-full transition-all duration-300 transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        } shadow-lg`} />
      </div>
      <input 
        id={id} 
        type="checkbox" 
        className="hidden" 
        checked={checked}
        onChange={onChange}
      />
    </label>
  );

  return (
    <div className="bg-content1 border-b border-divider py-4 px-6 shadow-md">
      <div className="max-w-7xl mx-auto grid grid-cols-12 items-center">
        {/* Left section with toggle switches */}
        <div className="col-span-12 lg:col-span-4 flex flex-wrap items-center justify-start gap-2 mb-4 lg:mb-0">
          <ToggleSwitch
            id="cleanupIds"
            label="Cleanup IDs"
            checked={options.cleanupIds}
            onChange={() => handleToggle('cleanupIds')}
          />
          <ToggleSwitch
            id="quotes"
            label="Quotes"
            checked={options.quotes}
            onChange={() => handleToggle('quotes')}
          />
          <ToggleSwitch
            id="memo"
            label="Memo"
            checked={options.memo}
            onChange={() => handleToggle('memo')}
          />
          <ToggleSwitch
            id="typescript"
            label="TypeScript"
            checked={options.typescript}
            onChange={() => handleToggle('typescript')}
          />
        </div>

        {/* Center section with conversion flow */}
        <div className="col-span-12 lg:col-span-4 flex items-center justify-center gap-4">
          <div className="flex items-center gap-3">
            <p className="text-sm text-default-500 font-mono">Input</p>
            <div className="px-3 py-1 bg-primary rounded-lg">
              <span className="text-white font-bold text-sm">SVG</span>
            </div>
          </div>
          
          <div className="bg-secondary w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 shadow-md">
            <Icon icon="lucide:arrow-right" className="text-white" />
          </div>
          
          <div className="flex items-center gap-3">
            <p className="text-sm text-default-500 font-mono">Preview</p>
            <div className="px-3 py-1 bg-secondary rounded-lg">
              <span className="text-white font-bold text-sm">LIVE</span>
            </div>
          </div>
          
          <div className="bg-secondary w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 shadow-md">
            <Icon icon="lucide:arrow-right" className="text-white" />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-success rounded-lg">
              <span className="text-white font-bold text-sm">JSX</span>
            </div>
            <p className="text-sm text-default-500 font-mono">Output</p>
          </div>
        </div>

        {/* Right section - empty but maintains grid structure */}
        <div className="col-span-12 lg:col-span-4"></div>
      </div>
    </div>
  );
};