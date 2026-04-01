import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '../store/useTaskStore';
import { cn } from '../lib/utils';
import { Sparkles, Dog, Cat, Moon, Music } from 'lucide-react';

export function PetDisplay() {
  const { userStats, tasks } = useTaskStore();
  const [state, setState] = useState<'idle' | 'happy' | 'sad' | 'sleeping' | 'focus'>('idle');

  useEffect(() => {
    const checkState = () => {
      if (state === 'focus' || state === 'sleeping') return; // Don't override pomodoro states
      const now = new Date();
      const hasOverdue = tasks.some(t => t.progress < 100 && t.dueDate && new Date(t.dueDate) < now);
      
      if (hasOverdue) {
        setState('sad');
      } else {
        setState('idle');
      }
    };
    
    checkState();
    const interval = setInterval(checkState, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks, state]);

  useEffect(() => {
    const handleTaskCompleted = () => {
      setState('happy');
      setTimeout(() => {
        // Re-evaluate state after being happy
        const now = new Date();
        const hasOverdue = tasks.some(t => t.progress < 100 && t.dueDate && new Date(t.dueDate) < now);
        setState(hasOverdue ? 'sad' : 'idle');
      }, 3000);
    };

    const handlePomodoroWork = () => setState('focus');
    const handlePomodoroBreak = () => setState('sleeping');
    const handlePomodoroPaused = () => {
      const now = new Date();
      const hasOverdue = tasks.some(t => t.progress < 100 && t.dueDate && new Date(t.dueDate) < now);
      setState(hasOverdue ? 'sad' : 'idle');
    };

    window.addEventListener('taskCompleted', handleTaskCompleted);
    window.addEventListener('pomodoroWorkStart', handlePomodoroWork);
    window.addEventListener('pomodoroBreakStart', handlePomodoroBreak);
    window.addEventListener('pomodoroPaused', handlePomodoroPaused);
    return () => {
      window.removeEventListener('taskCompleted', handleTaskCompleted);
      window.removeEventListener('pomodoroWorkStart', handlePomodoroWork);
      window.removeEventListener('pomodoroBreakStart', handlePomodoroBreak);
      window.removeEventListener('pomodoroPaused', handlePomodoroPaused);
    };
  }, [tasks]);

  if (!userStats.equippedPet) return null;

  const getPetIcon = (id: string, skin: string) => {
    switch (id) {
      case 'ducky': 
        if (skin === 'cyberpunk_ducky') return <div className="relative"><Sparkles className="w-16 h-16 text-fuchsia-500" /><div className="absolute top-0 right-0 w-4 h-4 bg-cyan-400 rounded-full animate-pulse" /></div>;
        return <Sparkles className="w-16 h-16 text-yellow-400" />;
      case 'corgi': 
        if (skin === 'astronaut_corgi') return <div className="relative"><Dog className="w-16 h-16 text-slate-200" /><div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full opacity-50" /></div>;
        return <Dog className="w-16 h-16 text-orange-500" />;
      case 'slime': 
        if (skin === 'king_slime') return <div className="relative"><Cat className="w-16 h-16 text-emerald-400" /><div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl">👑</div></div>;
        return <Cat className="w-16 h-16 text-emerald-400" />;
      default: return <Sparkles className="w-16 h-16 text-slate-400" />;
    }
  };

  const getAnimation = () => {
    switch (state) {
      case 'happy': return { y: [0, -20, 0], rotate: [0, 10, -10, 0], transition: { repeat: Infinity, duration: 1 } };
      case 'sad': return { y: [0, 5, 0], opacity: 0.8, transition: { repeat: Infinity, duration: 2 } };
      case 'sleeping': return { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 3 } };
      case 'focus': return { y: [0, -2, 0], scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 0.5 } };
      default: return { y: [0, -5, 0], transition: { repeat: Infinity, duration: 2 } }; // idle
    }
  };

  return (
    <div className="fixed bottom-44 right-6 md:bottom-24 md:right-6 z-30 flex flex-col items-center pointer-events-none">
      <AnimatePresence>
        {state === 'sleeping' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0 }}
            className="absolute -top-8 text-slate-400"
          >
            <Moon className="w-6 h-6" />
          </motion.div>
        )}
        {state === 'happy' && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -top-8 text-pink-400"
          >
            <Music className="w-6 h-6" />
          </motion.div>
        )}
        {state === 'focus' && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -top-8 text-rose-500 font-bold text-lg"
          >
            🔥
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        animate={getAnimation()}
        className={cn(
          "relative flex items-center justify-center w-24 h-24 bg-white/50 backdrop-blur-md rounded-full shadow-xl border-2 border-white/60",
          state === 'sleeping' && "grayscale opacity-80",
          state === 'focus' && "border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]"
        )}
      >
        {getPetIcon(userStats.equippedPet.id, userStats.equippedPet.skin)}
      </motion.div>
      
      <div className="mt-2 text-xs font-bold text-slate-600 bg-white/80 px-3 py-1 rounded-full shadow-sm backdrop-blur-md">
        {userStats.equippedPet.id.toUpperCase()}
      </div>
    </div>
  );
}
