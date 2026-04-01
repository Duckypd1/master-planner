import React from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { cn } from '../lib/utils';
import { Shield } from 'lucide-react';

export function RankBadge() {
  const { userStats } = useTaskStore();
  const { rank, tier, lp } = userStats;

  const getRankColor = () => {
    switch (rank) {
      case 'Đồng': return 'from-amber-700 to-amber-900 text-amber-100 border-amber-800/50 shadow-amber-900/50';
      case 'Bạc': return 'from-slate-300 to-slate-500 text-slate-900 border-slate-400/50 shadow-slate-400/50';
      case 'Vàng': return 'from-yellow-300 to-yellow-600 text-yellow-900 border-yellow-400/50 shadow-yellow-500/50';
      case 'Bạch Kim': return 'from-emerald-300 to-cyan-500 text-emerald-900 border-emerald-400/50 shadow-cyan-500/50';
      case 'Kim Cương': return 'from-blue-400 to-indigo-600 text-white border-blue-400/50 shadow-blue-500/50';
      case 'Cao Thủ': return 'from-purple-500 to-pink-600 text-white border-purple-400/50 shadow-purple-500/50';
      case 'Thách Đấu': return 'from-red-500 to-orange-600 text-white border-red-400/50 shadow-red-500/50';
      default: return 'from-slate-700 to-slate-900 text-white border-slate-700/50 shadow-slate-900/50';
    }
  };

  return (
    <div className={cn(
      "relative flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-br border shadow-lg backdrop-blur-xl",
      getRankColor()
    )}>
      <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 shadow-inner">
        <Shield className="w-5 h-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold tracking-wide uppercase">
          {rank} {tier > 0 ? tier : ''}
        </span>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-black/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/80 rounded-full transition-all duration-500"
              style={{ width: `${lp}%` }}
            />
          </div>
          <span className="text-[10px] font-bold opacity-90">{lp} LP</span>
        </div>
      </div>
    </div>
  );
}
