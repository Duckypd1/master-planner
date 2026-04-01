import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Coins, Flame, X } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';

// 👇 ĐÃ FIX: Khai báo bảng LP trực tiếp để chống kẹt ở mức 100
const RANK_LP_REQ: Record<string, number> = {
  'Đồng': 1000,
  'Bạc': 3000,
  'Vàng': 10000,
  'Bạch Kim': 25000,
  'Kim Cương': 50000,
  'Cao Thủ': 100000,
  'Thách Đấu': 9999999
};

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { userStats, user, forceCheckRank } = useTaskStore();
  
  // 👇 ĐÃ FIX: Tự động rà soát thăng cấp khi mở bảng Profile
  useEffect(() => {
    if (isOpen && forceCheckRank) {
      forceCheckRank();
    }
  }, [isOpen, forceCheckRank]);

  const userName = user?.name || 'Thủ Lĩnh';

  // Tính toán LP tự động theo Rank
  const maxLp = RANK_LP_REQ[userStats?.rank || 'Đồng'] || 1000;
  const currentLp = userStats?.lp || 0;
  const progressPercent = Math.min((currentLp / maxLp) * 100, 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()} 
            className="w-[92vw] max-w-[340px] max-h-[85vh] overflow-y-auto hide-scrollbar bg-gradient-to-br from-[#cce2f1] to-[#b5cce6] rounded-[28px] p-6 shadow-2xl relative border border-white/50"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-white/30 text-slate-600 hover:bg-white/60 rounded-full transition-colors z-20">
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6 pr-6">
                <h4 className="font-bold text-[#1e293b] text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" /> {userName}
                </h4>
                <span className="bg-[#8b5cf6] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                  Hạng {userStats?.rank || 'Đồng'} {userStats?.tier || 4}
                </span>
              </div>

              {/* Thanh Tiến Trình LP Động */}
              <div className="mb-6">
                <div className="flex justify-between text-[13px] font-semibold text-slate-600/80 mb-2">
                  <span>Tiến trình thăng hạng</span>
                  <span>{currentLp} / {maxLp} LP</span>
                </div>
                <div className="w-full h-[10px] bg-white/30 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    className="h-full bg-white/70 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#eef4fb] rounded-[20px] p-5 flex flex-col items-center justify-center shadow-sm border border-white/60">
                  <div className="w-12 h-12 bg-[#fdf4c8] rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <Coins className="w-6 h-6 text-[#ca8a04]" />
                  </div>
                  <span className="font-black text-[#1e293b] text-[22px] leading-none mb-1">{userStats?.coins || 0}</span>
                  <span className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">COINS</span>
                </div>

                <div className="bg-[#eef4fb] rounded-[20px] p-5 flex flex-col items-center justify-center shadow-sm border border-white/60">
                  <div className="w-12 h-12 bg-[#feead3] rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <Flame className="w-6 h-6 text-[#ea580c]" />
                  </div>
                  <span className="font-black text-[#1e293b] text-[22px] leading-none mb-1">{userStats?.streak || 0}</span>
                  <span className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">NGÀY STREAK</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}