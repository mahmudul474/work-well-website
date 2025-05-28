import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import TimerSettings from '@/components/TimerSettings';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

const Index = () => {
  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [customTimes, setCustomTimes] = useState({
    pomodoroTime: 25 * 60,
    shortBreakTime: 5 * 60,
    longBreakTime: 15 * 60,
  });
  const [timeLeft, setTimeLeft] = useState(customTimes.pomodoroTime);
  const [isRunning, setIsRunning] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDescription, setAlertDescription] = useState('');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const modeConfig = {
    pomodoro: { 
      duration: customTimes.pomodoroTime, 
      label: 'Pomodoro',
      bgClass: 'bg-gradient-to-br from-red-400 via-red-500 to-pink-500',
      textColor: 'text-white'
    },
    shortBreak: { 
      duration: customTimes.shortBreakTime, 
      label: 'Short Break',
      bgClass: 'bg-gradient-to-br from-green-400 via-green-500 to-teal-500',
      textColor: 'text-white'
    },
    longBreak: { 
      duration: customTimes.longBreakTime, 
      label: 'Long Break',
      bgClass: 'bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500',
      textColor: 'text-white'
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            playNotification();
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const playNotification = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleTimerComplete = () => {
    if (mode === 'pomodoro') {
      setCompletedPomodoros(prev => prev + 1);
      setAlertTitle('Task Time Complete!');
      setAlertDescription('Great work! Time for a well-deserved break. Take a moment to relax and recharge.');
      toast({
        title: "Pomodoro Complete!",
        description: "Time for a break. Great work!",
      });
    } else {
      setAlertTitle('Break Time Complete!');
      setAlertDescription('Break time is over! Ready to get back to work and be productive?');
      toast({
        title: "Break Complete!",
        description: "Ready to get back to work?",
      });
    }
    setShowAlert(true);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(modeConfig[mode].duration);
  };

  const switchMode = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(modeConfig[newMode].duration);
  };

  const handleSettingsChange = (newSettings: {
    pomodoroTime: number;
    shortBreakTime: number;
    longBreakTime: number;
  }) => {
    setCustomTimes(newSettings);
    // Reset current timer to new duration if not running
    if (!isRunning) {
      const newDuration = newSettings[`${mode}Time` as keyof typeof newSettings];
      setTimeLeft(newDuration);
    }
  };

  const addTask = () => {
    if (newTask.trim()) {
      setTasks(prev => [...prev, {
        id: Date.now(),
        text: newTask.trim(),
        completed: false
      }]);
      setNewTask('');
    }
  };

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentConfig = modeConfig[mode];

  return (
    <div className={`min-h-screen transition-all duration-1000 ${currentConfig.bgClass} ${currentConfig.textColor}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-2">
            <div></div>
            <h1 className="text-4xl font-bold">Pomofocus</h1>
            <TimerSettings
              pomodoroTime={customTimes.pomodoroTime}
              shortBreakTime={customTimes.shortBreakTime}
              longBreakTime={customTimes.longBreakTime}
              onSettingsChange={handleSettingsChange}
            />
          </div>
          <p className="text-lg opacity-90">A Pomodoro Timer to Boost Your Productivity</p>
        </div>

        {/* Mode Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 flex gap-1">
            {(Object.keys(modeConfig) as Array<keyof typeof modeConfig>).map((modeKey) => (
              <Button
                key={modeKey}
                onClick={() => switchMode(modeKey)}
                variant={mode === modeKey ? "default" : "ghost"}
                className={`px-6 py-2 rounded-md transition-all ${
                  mode === modeKey 
                    ? 'bg-white text-gray-800 shadow-lg' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                {modeConfig[modeKey].label}
              </Button>
            ))}
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className="text-8xl font-bold mb-6 font-mono tracking-wider">
            {formatTime(timeLeft)}
          </div>
          
          <div className="flex justify-center gap-4">
            <Button
              onClick={toggleTimer}
              size="lg"
              className="bg-white text-gray-800 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-full shadow-lg transition-all hover:scale-105"
            >
              {isRunning ? (
                <>
                  <Pause className="mr-2" size={20} />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2" size={20} />
                  Start
                </>
              )}
            </Button>
            
            <Button
              onClick={resetTimer}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-gray-800 px-6 py-3 rounded-full transition-all"
            >
              <SkipForward size={20} />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="text-center mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 inline-block">
            <div className="text-2xl font-bold">{completedPomodoros}</div>
            <div className="text-sm opacity-80">Pomodoros Completed</div>
          </div>
        </div>

        {/* Task Section */}
        <div className="max-w-md mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Tasks</h2>
            
            {/* Add Task */}
            <div className="flex gap-2 mb-4">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="Add a task..."
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
              />
              <Button
                onClick={addTask}
                size="sm"
                className="bg-white text-gray-800 hover:bg-gray-100 px-3"
              >
                <Plus size={16} />
              </Button>
            </div>

            {/* Task List */}
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <p className="text-center text-white/60 py-4">No tasks yet. Add one above!</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-lg bg-white/10 transition-all ${
                      task.completed ? 'opacity-60' : ''
                    }`}
                  >
                    <Button
                      onClick={() => toggleTask(task.id)}
                      size="sm"
                      variant="ghost"
                      className={`p-1 rounded-full ${
                        task.completed 
                          ? 'bg-green-500 text-white' 
                          : 'border-2 border-white/40 hover:bg-white/20'
                      }`}
                    >
                      {task.completed && <Check size={12} />}
                    </Button>
                    
                    <span className={`flex-1 ${task.completed ? 'line-through' : ''}`}>
                      {task.text}
                    </span>
                    
                    <Button
                      onClick={() => deleteTask(task.id)}
                      size="sm"
                      variant="ghost"
                      className="p-1 hover:bg-red-500/20 text-red-200 hover:text-red-100"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-800 text-xl">
              {alertTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              {alertDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction 
            onClick={() => setShowAlert(false)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            OK
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
