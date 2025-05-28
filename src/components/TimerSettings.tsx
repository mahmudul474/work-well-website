
import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface TimerSettingsProps {
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  onSettingsChange: (settings: {
    pomodoroTime: number;
    shortBreakTime: number;
    longBreakTime: number;
  }) => void;
}

const TimerSettings = ({
  pomodoroTime,
  shortBreakTime,
  longBreakTime,
  onSettingsChange,
}: TimerSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState({
    pomodoroTime: Math.floor(pomodoroTime / 60),
    shortBreakTime: Math.floor(shortBreakTime / 60),
    longBreakTime: Math.floor(longBreakTime / 60),
  });

  const handleSave = () => {
    onSettingsChange({
      pomodoroTime: tempSettings.pomodoroTime * 60,
      shortBreakTime: tempSettings.shortBreakTime * 60,
      longBreakTime: tempSettings.longBreakTime * 60,
    });
    setIsOpen(false);
  };

  const handleReset = () => {
    const defaultSettings = {
      pomodoroTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
    };
    setTempSettings(defaultSettings);
    onSettingsChange({
      pomodoroTime: defaultSettings.pomodoroTime * 60,
      shortBreakTime: defaultSettings.shortBreakTime * 60,
      longBreakTime: defaultSettings.longBreakTime * 60,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 p-2"
          onClick={() => {
            setTempSettings({
              pomodoroTime: Math.floor(pomodoroTime / 60),
              shortBreakTime: Math.floor(shortBreakTime / 60),
              longBreakTime: Math.floor(longBreakTime / 60),
            });
          }}
        >
          <Settings size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-800">Timer Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pomodoro" className="text-gray-700">
              Pomodoro (minutes)
            </Label>
            <Input
              id="pomodoro"
              type="number"
              min="1"
              max="60"
              value={tempSettings.pomodoroTime}
              onChange={(e) =>
                setTempSettings(prev => ({
                  ...prev,
                  pomodoroTime: parseInt(e.target.value) || 1,
                }))
              }
              className="text-gray-800"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shortBreak" className="text-gray-700">
              Short Break (minutes)
            </Label>
            <Input
              id="shortBreak"
              type="number"
              min="1"
              max="30"
              value={tempSettings.shortBreakTime}
              onChange={(e) =>
                setTempSettings(prev => ({
                  ...prev,
                  shortBreakTime: parseInt(e.target.value) || 1,
                }))
              }
              className="text-gray-800"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longBreak" className="text-gray-700">
              Long Break (minutes)
            </Label>
            <Input
              id="longBreak"
              type="number"
              min="1"
              max="60"
              value={tempSettings.longBreakTime}
              onChange={(e) =>
                setTempSettings(prev => ({
                  ...prev,
                  longBreakTime: parseInt(e.target.value) || 1,
                }))
              }
              className="text-gray-800"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Settings
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex-1">
              Reset to Default
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimerSettings;
