import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/react";

interface CodeEditorProps {
  code: string;
  language: "svg" | "jsx";
  onChange?: (code: string) => void;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  language, 
  onChange,
  readOnly = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(code);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    setEditedCode(code);
    setLineCount(code.split("\n").length);
  }, [code]);

  useEffect(() => {
    setLineCount(editedCode.split("\n").length);
  }, [editedCode]);

  const handleSave = () => {
    onChange?.(editedCode);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedCode(code);
    setIsEditing(false);
  };

  const formatCode = (code: string): string => {
    if (!code) return "";
    
    // Simple syntax highlighting
    return code
      .replace(/(<\/?[^>]+>)/g, '<span class="text-primary">$1</span>')
      .replace(/(className|fill|viewBox|d|width|height|stroke|strokeWidth|strokeLinecap|strokeLinejoin)=/g, '<span class="text-warning">$1=')
      .replace(/("([^"]*)")/g, '<span class="text-success">$1</span>')
      .replace(/(const|export|default|React|FC|interface|import|from)/g, '<span class="text-secondary">$1</span>');
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between px-4 py-2 bg-content2 border-b border-divider">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono px-2 py-1 rounded ${
            language === 'svg' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
          }`}>
            {language.toUpperCase()}
          </span>
          <span className="text-xs text-default-500 bg-default-100 px-2 py-1 rounded">
            {lineCount} lines
          </span>
        </div>
        <div className="flex items-center gap-1">
          {!readOnly && !isEditing && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => setIsEditing(true)}
              aria-label="Edit code"
            >
              <Icon icon="lucide:edit-3" className="text-default-500" size={16} />
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                isIconOnly
                size="sm"
                color="success"
                variant="flat"
                onPress={handleSave}
                aria-label="Save changes"
              >
                <Icon icon="lucide:check" size={16} />
              </Button>
              <Button
                isIconOnly
                size="sm"
                color="danger"
                variant="flat"
                onPress={handleCancel}
                aria-label="Cancel editing"
              >
                <Icon icon="lucide:x" size={16} />
              </Button>
            </>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <div className="relative">
          <textarea
            value={editedCode}
            onChange={(e) => setEditedCode(e.target.value)}
            className="w-full h-[400px] bg-content1 text-foreground font-mono text-sm p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            spellCheck={false}
            placeholder={`Enter your ${language.toUpperCase()} code here...`}
          />
        </div>
      ) : (
        <div className="relative">
          <pre className="text-sm text-foreground font-mono p-4 overflow-x-auto max-h-[400px] min-h-[200px]">
            <code dangerouslySetInnerHTML={{ __html: formatCode(code) }} />
          </pre>
          {code && (
            <div className="absolute top-2 right-2 bg-content1/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-default-500">
              {code.length} characters
            </div>
          )}
        </div>
      )}
    </div>
  );
};