import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Task } from '../store/useTaskStore';
import { cn } from '../lib/utils';

interface UrgentRadarWidgetProps {
  tasks: Task[];
}

export function UrgentRadarWidget({ tasks }: UrgentRadarWidgetProps) {
  // Filter tasks due within 24 hours and not completed
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  const urgentTasks = tasks.filter(task => {
    if (task.progress === 100 || !task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate > now && dueDate <= tomorrow;
  }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()).slice(0, 3);

  if (urgentTasks.length === 0) return null;

  return (
    <div className="p-6 rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.1),inset_0_0_0_1px_rgba(255,255,255,0.3)] mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
          Urgent Radar
        </h3>
        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
          {urgentTasks.length} Task{urgentTasks.length > 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="space-y-3">
        {urgentTasks.map(task => (
          <div key={task.id} className="p-3 bg-white/50 border border-red-100 rounded-xl shadow-sm flex items-start gap-3">
            <Clock className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-700">{task.titleKey}</p>
              <p className="text-xs text-red-500 font-semibold mt-1">
                Hạn chót: {new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }).format(new Date(task.dueDate!))}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
