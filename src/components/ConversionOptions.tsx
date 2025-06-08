
import React from "react";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  onChange: (options: ConversionOptionsState) => void;
  fileName?: string;
  onFileNameChange?: (name: string) => void;
}

export const ConversionOptions: React.FC<ConversionOptionsProps> = ({
  options,
  onChange,
  fileName = "MyIcon",
  onFileNameChange
}) => {
  const handleToggle = (key: keyof ConversionOptionsState) => {
    onChange({
      ...options,
      [key]: !options[key]
    });
  };

  const ToggleOption: React.FC<{
    id: keyof ConversionOptionsState;
    label: string;
    description: string;
    checked: boolean;
    onChange: () => void;
  }> = ({ id, label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Konverziós beállítások</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {onFileNameChange && (
          <div className="space-y-2">
            <Label htmlFor="component-name" className="text-sm font-medium">
              Komponens neve
            </Label>
            <Input
              id="component-name"
              value={fileName}
              onChange={(e) => onFileNameChange(e.target.value)}
              placeholder="MyIcon"
            />
          </div>
        )}

        <div className="space-y-4">
          <ToggleOption
            id="cleanupIds"
            label="ID-k eltávolítása"
            description="Távolítsa el az ID attribútumokat az SVG elemekből"
            checked={options.cleanupIds}
            onChange={() => handleToggle("cleanupIds")}
          />
          
          <ToggleOption
            id="quotes"
            label="Idézőjelek formázása"
            description="Formázza az idézőjeleket a JSX kimenetben"
            checked={options.quotes}
            onChange={() => handleToggle("quotes")}
          />
          
          <ToggleOption
            id="memo"
            label="React.memo használata"
            description="Csomagolja be a komponenst React.memo-val"
            checked={options.memo}
            onChange={() => handleToggle("memo")}
          />
          
          <ToggleOption
            id="typescript"
            label="TypeScript típusok"
            description="Generáljon TypeScript komponenst típusokkal"
            checked={options.typescript}
            onChange={() => handleToggle("typescript")}
          />
          
          <ToggleOption
            id="removeComments"
            label="Megjegyzések eltávolítása"
            description="Távolítsa el a megjegyzéseket az SVG-ből"
            checked={options.removeComments}
            onChange={() => handleToggle("removeComments")}
          />
          
          <ToggleOption
            id="formatCode"
            label="Kód formázása"
            description="Formázza a kimeneti kódot"
            checked={options.formatCode}
            onChange={() => handleToggle("formatCode")}
          />
          
          <ToggleOption
            id="extractCss"
            label="CSS kinyerése"
            description="Nyerje ki az inline stílusokat külön CSS-be"
            checked={options.extractCss}
            onChange={() => handleToggle("extractCss")}
          />
          
          <ToggleOption
            id="optimizeSvg"
            label="SVG optimalizálása"
            description="Optimalizálja az SVG-t szükségtelen attribútumok eltávolításával"
            checked={options.optimizeSvg}
            onChange={() => handleToggle("optimizeSvg")}
          />
        </div>
      </CardContent>
    </Card>
  );
};
