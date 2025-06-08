
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { CleaningOptions } from '@/utils/svg-cleaner';

interface AdvancedCleaningOptionsProps {
  options: CleaningOptions;
  onChange: (options: CleaningOptions) => void;
  precisionValue: number;
  onPrecisionChange: (value: number) => void;
}

export const AdvancedCleaningOptions: React.FC<AdvancedCleaningOptionsProps> = ({
  options,
  onChange,
  precisionValue,
  onPrecisionChange
}) => {
  const handleToggle = (key: keyof CleaningOptions) => {
    onChange({
      ...options,
      [key]: !options[key]
    });
  };

  const ToggleOption: React.FC<{
    id: keyof CleaningOptions;
    label: string;
    description: string;
    badge?: string;
    checked: boolean;
    onChange: () => void;
  }> = ({ id, label, description, badge, checked, onChange }) => (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-2">
          <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
            {label}
          </Label>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
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
        <CardTitle className="text-lg">Speciális tisztítási beállítások</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        <ToggleOption
          id="removeDuplicates"
          label="Duplikátumok eltávolítása"
          description="Azonos elemek automatikus felismerése és eltávolítása"
          badge="Gyors"
          checked={options.removeDuplicates}
          onChange={() => handleToggle("removeDuplicates")}
        />
        
        <ToggleOption
          id="cleanupDefinitions"
          label="Nem használt definíciók"
          description="Defs szakaszban lévő nem hivatkozott elemek eltávolítása"
          badge="Méret"
          checked={options.cleanupDefinitions}
          onChange={() => handleToggle("cleanupDefinitions")}
        />
        
        <div className="py-3 border-b border-border">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">
                    Pontosság optimalizálás
                  </Label>
                  <Badge variant="secondary" className="text-xs">
                    {precisionValue} tizedesjegy
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Számmértékek tizedesjegyeinek korlátozása
                </p>
              </div>
              <Switch
                checked={options.optimizePrecision}
                onCheckedChange={() => handleToggle("optimizePrecision")}
              />
            </div>
            {options.optimizePrecision && (
              <div className="space-y-2">
                <Slider
                  value={[precisionValue]}
                  onValueChange={(value) => onPrecisionChange(value[0])}
                  max={4}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Egész</span>
                  <span>Nagy pontosság</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <ToggleOption
          id="simplifyPaths"
          label="Útvonalak egyszerűsítése"
          description="Redundáns path parancsok eltávolítása és optimalizálás"
          badge="Teljesítmény"
          checked={options.simplifyPaths}
          onChange={() => handleToggle("simplifyPaths")}
        />
        
        <ToggleOption
          id="optimizeColors"
          label="Színoptimalizálás"
          description="RGB értékek hex formátumra konvertálása ahol lehetséges"
          badge="Méret"
          checked={options.optimizeColors}
          onChange={() => handleToggle("optimizeColors")}
        />
        
        <ToggleOption
          id="normalizeWhitespace"
          label="Szóközök normalizálása"
          description="Felesleges szóközök és sortörések eltávolítása"
          badge="Méret"
          checked={options.normalizeWhitespace}
          onChange={() => handleToggle("normalizeWhitespace")}
        />
        
        <ToggleOption
          id="removeUnusedStyles"
          label="Nem használt stílusok"
          description="Üres style elemek és nem hivatkozott CSS szabályok törlése"
          checked={options.removeUnusedStyles}
          onChange={() => handleToggle("removeUnusedStyles")}
        />
        
        <ToggleOption
          id="mergePaths"
          label="Útvonalak egyesítése"
          description="Azonos tulajdonságú path elemek kombinálása"
          badge="Kísérleti"
          checked={options.mergePaths}
          onChange={() => handleToggle("mergePaths")}
        />
      </CardContent>
    </Card>
  );
};
