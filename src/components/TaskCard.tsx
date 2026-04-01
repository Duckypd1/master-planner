import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RotateCcw, Check, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { Task, useTaskStore } from '../store/useTaskStore';

interface TaskCardProps {
  task: Task;
  onDelete: (task: Task) => void;
  onUnschedule?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onUnschedule }) => {
  const { t } = useTranslation();
  const [isSwiping, setIsSwiping] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { settings, toggleTaskCompletion, userStats, useTimeBuffer } = useTaskStore();

  const hasTimeBuffer = (userStats.inventory['time_buffer'] || 0) > 0;

  const getCategoryColor = (categoryName: string) => {
    const category = settings.categories.find(c => c.name === categoryName);
    return category ? category.color : 'bg-slate-400';
  };

  const getColors = () => {
    if (task.progress === 100) {
      return {
        card: 'bg-white/40 backdrop-blur-md border-white/50',
        badge: 'bg-emerald-100/80 text-emerald-700',
      };
    }
    if (task.type === 'fixed') {
      return {
        card: 'bg-white/60 backdrop-blur-xl border-white/80 shadow-[0_4px_16px_0_rgba(31,38,135,0.05)]',
        badge: 'bg-orange-100/80 text-orange-700',
      };
    }
    return {
      card: 'bg-gradient-to-r from-cyan-50/60 to-white/60 backdrop-blur-xl border-white/80 shadow-[0_4px_16px_0_rgba(31,38,135,0.05)]',
      badge: 'bg-cyan-100/80 text-cyan-700',
    };
  };

  const colors = getColors();
  const categoryColor = getCategoryColor(task.category);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.progress !== 100) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
      
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
      
      if (settings.soundEnabled) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        if (settings.activeSound === 'sound_mario') {
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(987.77, audioCtx.currentTime); // B5
          oscillator.frequency.setValueAtTime(1318.51, audioCtx.currentTime + 0.1); // E6
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.3);
        } else if (settings.activeSound === 'sound_zelda') {
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(392.00, audioCtx.currentTime); // G4
          oscillator.frequency.setValueAtTime(440.00, audioCtx.currentTime + 0.1); // A4
          oscillator.frequency.setValueAtTime(493.88, audioCtx.currentTime + 0.2); // B4
          oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime + 0.3); // C5
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.5);
        } else if (settings.activeSound === 'sound_lofi') {
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(261.63, audioCtx.currentTime); // C4
          oscillator.frequency.exponentialRampToValueAtTime(130.81, audioCtx.currentTime + 0.5); // C3
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.5);
        } else {
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.1);
        }
      }
    }
    toggleTaskCompletion(task.id, e.clientX, e.clientY);
  };

  return (
    <div className="relative group mb-4">
      {/* Background Actions (revealed on swipe) */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-500/5 rounded-xl flex items-center justify-end px-4">
        <span className="text-red-500 font-medium text-sm flex items-center gap-2">
          {t('actionView.delete')} <Trash2 className="w-4 h-4" />
        </span>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        onDragStart={() => setIsSwiping(true)}
        onDragEnd={(e, info) => {
          setIsSwiping(false);
          if (info.offset.x < -50) {
            onDelete(task);
          }
        }}
        animate={showConfetti ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3 }}
        className={cn(
          "relative p-4 rounded-xl shadow-sm border cursor-grab active:cursor-grabbing flex gap-3",
          colors.card,
          task.progress === 100 ? 'opacity-60' : ''
        )}
      >
        {/* Master Tick Checkbox */}
        <div className="pt-1">
          <button
            onClick={handleToggle}
            className={cn(
              "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300",
              task.progress === 100 
                ? "bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                : "border-slate-300 hover:border-cyan-400 bg-white/50"
            )}
          >
            <AnimatePresence>
              {task.progress === 100 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
              <div className={cn("w-2.5 h-2.5 rounded-full", categoryColor)} title={task.category} />
              <h4 className={cn("font-medium text-slate-800 transition-all duration-300", task.progress === 100 ? 'line-through text-slate-500' : '')}>
                {t(`tasks.${task.titleKey}`)}
              </h4>
            </div>
            <span className={cn("text-xs font-semibold px-2 py-1 rounded-md", colors.badge)}>
              {t(`actionView.${task.type}`)}
            </span>
          </div>
          
          {task.description && (
            <p className="text-sm text-slate-500 mb-2">{task.description}</p>
          )}
          
          <div className="flex justify-between items-center mt-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs text-slate-500 font-medium">{task.time}</p>
              {task.dueDate && (
                <p className="text-xs text-purple-600 font-medium">
                  Hạn: {new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(task.dueDate))}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Hover Actions */}
        <AnimatePresence>
          {!isSwiping && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute right-2 top-2 bottom-2 flex flex-col gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {task.progress !== 100 && task.dueDate && hasTimeBuffer && (
                <button 
                  onClick={() => {
                    useTimeBuffer(task.id);
                    alert('Đã gia hạn thêm 24h!');
                  }}
                  className="p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 transition-colors shadow-sm"
                  title="Sử dụng Vé Gia Hạn (+24h)"
                >
                  <Clock className="w-4 h-4" />
                </button>
              )}
              {task.type === 'flexible' && onUnschedule && (
                <button 
                  onClick={() => onUnschedule(task)}
                  className="p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-500 hover:text-orange-500 hover:bg-orange-50 transition-colors shadow-sm"
                  title={t('actionView.unschedule')}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={() => onDelete(task)}
                className="p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                title={t('actionView.delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
