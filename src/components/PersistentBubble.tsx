
import { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
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

// Standalone bubble component for the popup window
const StandaloneBubble = ({
  timeLeft,
  isRunning,
  onToggleTimer,
  onResetTimer,
  currentMode,
  activeTask,
  onClose,
  onExpand
}: PersistentBubbleProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full bg-black text-white p-4 font-sans">
      <style>{`
        body { margin: 0; padding: 0; background: #000; overflow: hidden; }
        * { box-sizing: border-box; }
      `}</style>
      <Card className="bg-black/90 backdrop-blur-sm border-white/20 p-4 text-white shadow-2xl h-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">{currentMode}</h3>
          <div className="flex gap-1">
            <button
              onClick={onExpand}
              className="p-1 h-6 w-6 text-white hover:bg-white/20 rounded border-none bg-transparent cursor-pointer"
            >
              <Maximize2 size={12} />
            </button>
            <button
              onClick={onClose}
              className="p-1 h-6 w-6 text-white hover:bg-white/20 rounded border-none bg-transparent cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        </div>
        
        <div className="text-center mb-3">
          <div className="text-2xl font-mono font-bold">
            {formatTime(timeLeft)}
          </div>
        </div>
        
        <div className="flex gap-2 justify-center mb-3">
          <button
            onClick={onToggleTimer}
            className="bg-white text-black hover:bg-gray-200 px-3 py-1 rounded border-none cursor-pointer flex items-center gap-1"
          >
            {isRunning ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <button
            onClick={onResetTimer}
            className="border border-white text-white hover:bg-white hover:text-black px-3 py-1 rounded bg-transparent cursor-pointer flex items-center"
          >
            <SkipForward size={12} />
          </button>
        </div>
        
        {activeTask && (
          <div className="text-xs text-center border-t border-white/20 pt-2">
            <div className="truncate font-medium">Active Task:</div>
            <div className="truncate opacity-80">{activeTask}</div>
          </div>
        )}
        
        <div className="text-xs text-center opacity-60 mt-2">
          Persistent Timer Bubble
        </div>
      </Card>
    </div>
  );
};

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
  const popupRef = useRef<Window | null>(null);
  const rootRef = useRef<any>(null);

  useEffect(() => {
    if (isVisible && !popupRef.current) {
      // Open popup window
      const popup = window.open(
        '',
        'pomodoroTimer',
        'width=250,height=280,top=100,left=100,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=yes,alwaysRaised=yes'
      );

      if (popup) {
        popupRef.current = popup;
        
        // Set up the popup document
        popup.document.title = 'Pomodoro Timer';
        popup.document.head.innerHTML = `
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pomodoro Timer</title>
          <script src="https://cdn.tailwindcss.com"></script>
        `;
        
        // Create root element
        const rootElement = popup.document.createElement('div');
        rootElement.id = 'root';
        popup.document.body.appendChild(rootElement);
        
        // Create React root and render
        rootRef.current = createRoot(rootElement);
        
        // Handle popup close
        popup.addEventListener('beforeunload', () => {
          onClose();
          popupRef.current = null;
        });
      }
    }

    if (popupRef.current && rootRef.current) {
      // Update the popup content
      rootRef.current.render(
        <StandaloneBubble
          timeLeft={timeLeft}
          isRunning={isRunning}
          onToggleTimer={onToggleTimer}
          onResetTimer={onResetTimer}
          currentMode={currentMode}
          activeTask={activeTask}
          onClose={() => {
            if (popupRef.current) {
              popupRef.current.close();
            }
            onClose();
          }}
          onExpand={() => {
            if (popupRef.current) {
              popupRef.current.close();
            }
            onExpand();
          }}
          isVisible={isVisible}
          onExpand={onExpand}
        />
      );
    }

    return () => {
      if (!isVisible && popupRef.current) {
        popupRef.current.close();
        popupRef.current = null;
      }
    };
  }, [isVisible, timeLeft, isRunning, currentMode, activeTask, onClose, onExpand, onToggleTimer, onResetTimer]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (popupRef.current) {
        popupRef.current.close();
      }
    };
  }, []);

  // This component doesn't render anything in the main window
  return null;
};

export default PersistentBubble;
