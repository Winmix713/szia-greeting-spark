
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Pause, Play, X, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export interface QueueItem {
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'paused';
  progress: number;
  error?: string;
  result?: any;
}

interface ProcessingQueueProps {
  items: QueueItem[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  totalProgress: number;
}

export const ProcessingQueue: React.FC<ProcessingQueueProps> = ({
  items,
  onPause,
  onResume,
  onCancel,
  onRetry,
  totalProgress
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getStatusIcon = (status: QueueItem['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'processing':
        return <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: QueueItem['status']) => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      completed: 'default',
      error: 'destructive',
      paused: 'outline'
    } as const;

    return (
      <Badge variant={variants[status] || 'secondary'} className="text-xs">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (items.length === 0) return null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            Feldolgozási sor
            <Badge variant="outline">{items.length} elemek</Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Összezárás' : 'Kibontás'}
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Összesített haladás</span>
            <span>{Math.round(totalProgress)}%</span>
          </div>
          <Progress value={totalProgress} className="w-full" />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
            >
              <div className="flex-shrink-0">
                {getStatusIcon(item.status)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">
                    {item.name}
                  </span>
                  {getStatusBadge(item.status)}
                </div>
                
                <div className="text-xs text-muted-foreground mb-2">
                  {(item.size / 1024).toFixed(1)} KB
                </div>

                {item.status === 'processing' && (
                  <Progress value={item.progress} className="w-full h-1" />
                )}

                {item.error && (
                  <div className="text-xs text-red-500 mt-1">
                    {item.error}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 flex gap-1">
                {item.status === 'processing' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPause(item.id)}
                  >
                    <Pause className="w-3 h-3" />
                  </Button>
                )}

                {item.status === 'paused' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResume(item.id)}
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                )}

                {item.status === 'error' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRetry(item.id)}
                  >
                    Újra
                  </Button>
                )}

                {(item.status === 'pending' || item.status === 'paused') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCancel(item.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
};
