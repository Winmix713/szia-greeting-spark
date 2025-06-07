
import React from 'react';
import { Moon, Sun, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationBarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  isDarkMode,
  onToggleTheme,
}) => {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">
              SVG to JSX Converter
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="hover:bg-accent"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
};
