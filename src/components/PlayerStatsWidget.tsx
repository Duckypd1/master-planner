import React from 'react';
import { Flame, Trophy, Coins } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';

export function PlayerStatsWidget() {
  const { userStats } = useTaskStore();
  const { rank, tier, lp, coins, streakCount } = userStats;

  return (
    <div className="p-6 rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.1),inset_0_0_0_1px_rgba(255,255,255,0.3)]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Hồ sơ người chơi
        </h3>
        <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold rounded-full shadow-md shadow-purple-500/30">
          Hạng {rank} {tier > 0 ? tier : ''}
        </span>
      </div>

      <div className="space-y-6">
        {/* Level Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-slate-700">Tiến trình thăng hạng</span>
            <span className="text-slate-500">{lp} / 100 LP</span>
          </div>
          <div className="h-3 w-full bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full liquid-bar rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-all duration-500"
              style={{ width: `${lp}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/50 border border-white/60 flex flex-col items-center justify-center gap-2 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Coins className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-slate-800">{coins}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Coins</div>
            </div>
          </div>
          
          <div className="p-4 rounded-2xl bg-white/50 border border-white/60 flex flex-col items-center justify-center gap-2 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-slate-800">{streakCount}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ngày Streak</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
