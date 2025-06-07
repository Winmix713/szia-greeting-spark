
import React from 'react';
import { cn } from '@/lib/utils';

interface EditableCodeBlockProps {
  code: string;
  onChange: (code: string) => void;
  title: string;
  language?: string;
  readOnly?: boolean;
}

export const EditableCodeBlock: React.FC<EditableCodeBlockProps> = ({
  code,
  onChange,
  title,
  language = 'xml',
  readOnly = false,
}) => {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="bg-muted px-4 py-2 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {language && (
          <span className="text-xs text-muted-foreground uppercase">{language}</span>
        )}
      </div>
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          className={cn(
            "w-full h-64 p-4 bg-background text-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring",
            readOnly && "bg-muted/50"
          )}
          placeholder={readOnly ? "" : "Írd vagy illeszd be az SVG kódot..."}
          spellCheck={false}
        />
      </div>
    </div>
  );
};
