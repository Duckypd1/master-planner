import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';

export function PromotionModal() {
  const { userStats, dismissPromotion } = useTaskStore();
  const { promotionStatus, rank, tier } = userStats;

  if (promotionStatus !== 'success') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          // =======================================================
          // ĐÃ ÁP DỤNG CÔNG THỨC MOBILE PIXEL-PERFECT
          // =======================================================
          className="relative w-[92vw] max-w-[360px] md:max-w-md max-h-[85vh] overflow-y-auto hide-scrollbar p-6 md:p-8 rounded-[2rem] bg-gradient-to-b from-indigo-500 to-purple-700 shadow-2xl border border-white/20"
        >
          {/* Confetti/Sparkles background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div 
                key={i} 
                initial={{ y: '100%', x: `${Math.random() * 100}%`, opacity: 0 }} 
                animate={{ 
                  y: '-10%', 
                  x: `${Math.random() * 100}%`, 
                  opacity: [0, 1, 0], 
                  rotate: Math.random() * 360 
                }} 
                transition={{ 
                  duration: 2 + Math.random() * 2, 
                  repeat: Infinity, 
                  delay: Math.random() * 2 
                }} 
                className="absolute w-1.5 h-1.5 bg-white rounded-full blur-[1px]" 
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.div 
              initial={{ rotate: -180, scale: 0 }} 
              animate={{ rotate: 0, scale: 1 }} 
              transition={{ type: 'spring', delay: 0.2 }} 
              className="flex items-center justify-center w-20 h-20 mb-5 rounded-full bg-gradient-to-tr from-yellow-300 to-yellow-500 shadow-[0_0_30px_rgba(253,224,71,0.6)] border-4 border-white/30"
            >
              <Trophy className="w-10 h-10 text-yellow-900" />
            </motion.div>
            
            <h2 className="mb-2 text-2xl font-black text-white uppercase tracking-widest drop-shadow-lg">
              Thăng Hạng!
            </h2>
            
            <p className="mb-6 text-sm text-purple-100 font-medium">
              Chúc mừng bạn đã đạt được <br/>
              <span className="text-xl font-bold text-yellow-300 drop-shadow-md">
                {rank} {tier > 0 ? tier : ''}
              </span>
            </p>
            
            <button 
              onClick={dismissPromotion} 
              className="w-full py-3.5 text-sm font-bold text-indigo-900 uppercase bg-white rounded-xl active:scale-95 shadow-lg transition-transform"
            >
              Tiếp tục chiến đấu
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}