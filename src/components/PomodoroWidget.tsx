import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useTaskStore } from '../store/useTaskStore';
import { cn } from '../lib/utils';

export function PomodoroWidget() {
  const { settings } = useTaskStore();
  const [timeLeft, setTimeLeft] = useState(settings.pomodoroWork * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === 'work') {
        setMode('break');
        setTimeLeft(settings.pomodoroBreak * 60);
        // Dispatch event for pet animation
        window.dispatchEvent(new CustomEvent('pomodoroBreakStart'));
      } else {
        setMode('work');
        setTimeLeft(settings.pomodoroWork * 60);
        window.dispatchEvent(new CustomEvent('pomodoroWorkStart'));
      }
      
      if (settings.soundEnabled) {
        const audio = new Audio('/notification.mp3'); // Placeholder, we can use oscillator
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        oscillator.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, settings]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    if (!isActive && mode === 'work') {
      window.dispatchEvent(new CustomEvent('pomodoroWorkStart'));
    } else if (!isActive && mode === 'break') {
      window.dispatchEvent(new CustomEvent('pomodoroBreakStart'));
    } else {
      window.dispatchEvent(new CustomEvent('pomodoroPaused'));
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setMode('work');
    setTimeLeft(settings.pomodoroWork * 60);
    window.dispatchEvent(new CustomEvent('pomodoroPaused'));
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = mode === 'work' 
    ? 100 - (timeLeft / (settings.pomodoroWork * 60)) * 100 
    : 100 - (timeLeft / (settings.pomodoroBreak * 60)) * 100;

  return (
    <GlassCard className="p-6 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          {mode === 'work' ? '🍅 Tập trung' : <><Coffee className="w-5 h-5 text-amber-600" /> Nghỉ ngơi</>}
        </h3>
        <span className={cn(
          "text-xs font-bold px-2 py-1 rounded-md",
          mode === 'work' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
        )}>
          {mode === 'work' ? 'Work' : 'Break'}
        </span>
      </div>

      <div className="relative flex items-center justify-center py-6">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="60"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-100"
          />
          <circle
            cx="64"
            cy="64"
            r="60"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={377}
            strokeDashoffset={377 - (377 * progress) / 100}
            className={cn(
              "transition-all duration-1000 ease-linear",
              mode === 'work' ? "text-rose-500" : "text-amber-500"
            )}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold text-slate-800 tabular-nums">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={toggleTimer}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform active:scale-95 shadow-lg",
            isActive ? "bg-slate-800 hover:bg-slate-700" : (mode === 'work' ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/30" : "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30")
          )}
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
        </button>
        <button
          onClick={resetTimer}
          className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </GlassCard>
  );
}
