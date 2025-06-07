
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface ConversionOptionsProps {
  options: {
    removeComments: boolean;
    formatCode: boolean;
    componentName: string;
    addTypescript: boolean;
  };
  onChange: (options: any) => void;
}

export const ConversionOptions: React.FC<ConversionOptionsProps> = ({
  options,
  onChange,
}) => {
  const updateOption = (key: string, value: any) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className="space-y-6 p-4 border border-border rounded-lg bg-card">
      <h3 className="text-lg font-semibold text-foreground">Konverziós beállítások</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="remove-comments" className="text-sm font-medium">
            Megjegyzések eltávolítása
          </Label>
          <Switch
            id="remove-comments"
            checked={options.removeComments}
            onCheckedChange={(checked) => updateOption('removeComments', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="format-code" className="text-sm font-medium">
            Kód formázása
          </Label>
          <Switch
            id="format-code"
            checked={options.formatCode}
            onCheckedChange={(checked) => updateOption('formatCode', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="add-typescript" className="text-sm font-medium">
            TypeScript típusok hozzáadása
          </Label>
          <Switch
            id="add-typescript"
            checked={options.addTypescript}
            onCheckedChange={(checked) => updateOption('addTypescript', checked)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="component-name" className="text-sm font-medium">
            Komponens neve
          </Label>
          <Input
            id="component-name"
            value={options.componentName}
            onChange={(e) => updateOption('componentName', e.target.value)}
            placeholder="MyIcon"
          />
        </div>
      </div>
    </div>
  );
};
