
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, X, Maximize2 } from 'lucide-react';

interface PersistentBubbleProps {
  isVisible: boolean;
  onClose: () => void;
  onExpand: () => void;
  timeLeft: number;
  isRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  currentMode: string;
  activeTask?: string;
}

const PersistentBubble = ({
  isVisible,
  onClose,
  onExpand,
  timeLeft,
  isRunning,
  onToggleTimer,
  onResetTimer,
  currentMode,
  activeTask
}: PersistentBubbleProps) => {
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentHidden(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Show bubble when document is hidden (user switched tabs) or when explicitly visible
  const shouldShow = isVisible && (isDocumentHidden || isVisible);

  if (!shouldShow) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-auto">
      <Card className="bg-black/90 backdrop-blur-sm border-white/20 p-4 text-white min-w-[220px] shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">{currentMode}</h3>
          <div className="flex gap-1">
            <Button
              onClick={onExpand}
              size="sm"
              variant="ghost"
              className="p-1 h-6 w-6 text-white hover:bg-white/20"
            >
              <Maximize2 size={12} />
            </Button>
            <Button
              onClick={onClose}
              size="sm"
              variant="ghost"
              className="p-1 h-6 w-6 text-white hover:bg-white/20"
            >
              <X size={12} />
            </Button>
          </div>
        </div>
        
        <div className="text-center mb-3">
          <div className="text-2xl font-mono font-bold">
            {formatTime(timeLeft)}
          </div>
        </div>
        
        <div className="flex gap-2 justify-center mb-3">
          <Button
            onClick={onToggleTimer}
            size="sm"
            className="bg-white text-black hover:bg-gray-200 px-3 py-1"
          >
            {isRunning ? <Pause size={12} /> : <Play size={12} />}
          </Button>
          <Button
            onClick={onResetTimer}
            size="sm"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-black px-3 py-1"
          >
            <SkipForward size={12} />
          </Button>
        </div>
        
        {activeTask && (
          <div className="text-xs text-center border-t border-white/20 pt-2">
            <div className="truncate font-medium">Active Task:</div>
            <div className="truncate opacity-80">{activeTask}</div>
          </div>
        )}
        
        <div className="text-xs text-center opacity-60 mt-2">
          Switch back to focus mode
        </div>
      </Card>
    </div>
  );
};

export default PersistentBubble;
