import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Target } from 'lucide-react';
import { Task } from '../store/useTaskStore';

interface RadarChartWidgetProps {
  tasks: Task[];
}

export function RadarChartWidget({ tasks }: RadarChartWidgetProps) {
  // Calculate focus based on completed tasks in the last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const recentTasks = tasks.filter(task => {
    if (task.progress !== 100 || !task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    return completedDate >= sevenDaysAgo && completedDate <= now;
  });

  const categoryCounts = recentTasks.reduce((acc, task) => {
    const cat = task.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Default categories if empty
  const defaultCategories = ['Work', 'Health', 'Study', 'Habit', 'Shopping'];
  const data = defaultCategories.map(cat => ({
    subject: cat,
    A: categoryCounts[cat] || 0,
    fullMark: Math.max(5, ...Object.values(categoryCounts)) + 2,
  }));

  return (
    <div className="p-6 rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.1),inset_0_0_0_1px_rgba(255,255,255,0.3)] mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-500" />
          Focus Radar (7 Ngày)
        </h3>
      </div>
      
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.5)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
            <Radar
              name="Focus"
              dataKey="A"
              stroke="#6366f1"
              fill="#8b5cf6"
              fillOpacity={0.5}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', backgroundColor: 'rgba(255,255,255,0.9)' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
