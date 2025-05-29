import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Plus, Check, X, Minimize2, Settings, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import TimerSettings from '@/components/TimerSettings';
import RingtoneSettings from '@/components/RingtoneSettings';
import PersistentBubble from '@/components/PersistentBubble';
import { getRandomSuccessMessage, getRandomMotivationalMessage } from '@/utils/motivationalMessages';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  status: 'pending' | 'in-progress' | 'completed';
  timeSpent: number;
  startTime?: number;
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
  const [isBubbleMode, setIsBubbleMode] = useState(false);
  const [showPersistentBubble, setShowPersistentBubble] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [customRingtone, setCustomRingtone] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const taskTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Task timer effect
  useEffect(() => {
    if (isRunning && activeTaskId && mode === 'pomodoro') {
      taskTimerRef.current = setInterval(() => {
        setTasks(prev => prev.map(task => 
          task.id === activeTaskId 
            ? { ...task, timeSpent: task.timeSpent + 1 }
            : task
        ));
      }, 1000);
    } else {
      if (taskTimerRef.current) {
        clearInterval(taskTimerRef.current);
      }
    }

    return () => {
      if (taskTimerRef.current) {
        clearInterval(taskTimerRef.current);
      }
    };
  }, [isRunning, activeTaskId, mode]);

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
    if (customRingtone) {
      try {
        const audio = new Audio(customRingtone);
        audio.volume = 0.5;
        audio.play().catch(() => {
          // Fallback to default sound if custom ringtone fails
          playDefaultSound();
        });
      } catch {
        playDefaultSound();
      }
    } else {
      playDefaultSound();
    }
  };

  const playDefaultSound = () => {
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
      const wasTaskCompleted = activeTaskId !== null;
      
      if (activeTaskId) {
        setTasks(prev => prev.map(task => 
          task.id === activeTaskId 
            ? { ...task, status: 'completed' as const, completed: true }
            : task
        ));
        setActiveTaskId(null);
      }

      if (wasTaskCompleted) {
        const successMsg = getRandomSuccessMessage();
        setAlertTitle('🎉 Task Completed!');
        setAlertDescription(successMsg);
        toast({
          title: "Task Completed!",
          description: successMsg,
        });
      } else {
        setAlertTitle('⏰ Pomodoro Complete!');
        setAlertDescription('Great work! Time for a well-deserved break. Take a moment to relax and recharge.');
        toast({
          title: "Pomodoro Complete!",
          description: "Time for a break. Great work!",
        });
      }
    } else {
      setAlertTitle('🔄 Break Complete!');
      setAlertDescription('Break time is over! Ready to get back to work and be productive?');
      toast({
        title: "Break Complete!",
        description: "Ready to get back to work?",
      });
    }
    setShowAlert(true);
  };

  // Handle incomplete tasks (when timer is reset or mode switched during active task)
  const handleIncompleteTask = () => {
    if (activeTaskId && isRunning && mode === 'pomodoro') {
      const motivationalMsg = getRandomMotivationalMessage();
      toast({
        title: "Keep Going! 💪",
        description: motivationalMsg,
      });
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (isRunning) {
      handleIncompleteTask();
    }
    setIsRunning(false);
    setTimeLeft(modeConfig[mode].duration);
  };

  const switchMode = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    if (isRunning && mode !== newMode) {
      handleIncompleteTask();
    }
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
        completed: false,
        status: 'pending',
        timeSpent: 0
      }]);
      setNewTask('');
    }
  };

  const startTask = (id: number) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, status: 'in-progress' as const, startTime: Date.now() }
        : { ...task, status: task.status === 'completed' ? 'completed' : 'pending' }
    ));
    setActiveTaskId(id);
    if (mode !== 'pomodoro') {
      switchMode('pomodoro');
    }
  };

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { 
        ...task, 
        completed: !task.completed,
        status: !task.completed ? 'completed' as const : 'pending' as const
      } : task
    ));
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
  };

  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'in-progress': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const currentConfig = modeConfig[mode];
  const activeTask = tasks.find(task => task.id === activeTaskId);

  const handleBubbleMode = () => {
    setShowPersistentBubble(true);
    // Don't set isBubbleMode to true anymore since we're using popup
  };

  return (
    <>
      <PersistentBubble
        isVisible={showPersistentBubble}
        onClose={() => setShowPersistentBubble(false)}
        onExpand={() => {
          setShowPersistentBubble(false);
        }}
        timeLeft={timeLeft}
        isRunning={isRunning}
        onToggleTimer={toggleTimer}
        onResetTimer={resetTimer}
        currentMode={currentConfig.label}
        activeTask={activeTask?.text}
      />

      <div className={`min-h-screen transition-all duration-1000 ${currentConfig.bgClass} ${currentConfig.textColor}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2">
                <Button
                  onClick={handleBubbleMode}
                  variant="ghost"
                  className="text-white hover:bg-white/20 px-3 py-2"
                >
                  <Minimize2 size={16} className="mr-2" />
                  Bubble Mode
                </Button>
              </div>
              
              <h1 className="text-4xl font-bold">Pomofocus</h1>
              
              <div className="flex gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" className="text-white hover:bg-white/20 px-3 py-2">
                      <Settings size={16} className="mr-2" />
                      Sounds
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Notification Settings</SheetTitle>
                      <SheetDescription>
                        Customize your timer notification sounds
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <RingtoneSettings
                        currentRingtone={customRingtone}
                        onRingtoneChange={setCustomRingtone}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
                
                <TimerSettings
                  pomodoroTime={customTimes.pomodoroTime}
                  shortBreakTime={customTimes.shortBreakTime}
                  longBreakTime={customTimes.longBreakTime}
                  onSettingsChange={handleSettingsChange}
                />
              </div>
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
          <div className="max-w-2xl mx-auto">
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
                  tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-lg bg-white/10 transition-all ${
                        task.completed ? 'opacity-60' : ''
                      } ${activeTaskId === task.id ? 'bg-white/20 border border-white/40' : ''}`}
                    >
                      <div className="text-sm font-mono text-white/70 w-8">
                        #{index + 1}
                      </div>
                      
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
                      
                      <div className="flex-1">
                        <div className={`${task.completed ? 'line-through' : ''} mb-1`}>
                          {task.text}
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className={`${getStatusColor(task.status)} font-medium`}>
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </span>
                          <span className="text-white/60">
                            Time: {formatTime(task.timeSpent)}
                          </span>
                        </div>
                      </div>
                      
                      {!task.completed && task.status !== 'in-progress' && (
                        <Button
                          onClick={() => startTask(task.id)}
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1"
                        >
                          Start
                        </Button>
                      )}
                      
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
    </>
  );
};

export default Index;
