import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '../store/useTaskStore';
import { cn } from '../lib/utils';

// ĐÃ CẬP NHẬT ĐẦY ĐỦ TỪ ĐIỂN LINH THÚ THEO ẢNH
const PET_NAME_MAP: Record<string, string> = {
  // Hụt
  'miss': 'Gió',
  // Thường (50%)
  'dog': 'Chó Cỏ',
  'cat': 'Mèo Mướp',
  'rooster': 'Gà Trống',
  'rabbit': 'Thỏ Trắng',
  'ducky': 'Vịt Bầu',
  // Hiếm (4.49%)
  'wolf': 'Sói Xám',
  'fox': 'Cáo Đỏ',
  'bear': 'Gấu Nâu',
  'tiger': 'Hổ Vằn',
  'penguin': 'Chim Cánh Cụt',
  'polar_bear': 'Gấu Bắc Cực',
  // Sử thi (0.5%)
  'unicorn': 'Kỳ Lân',
  'reindeer': 'Tuần Lộc Tuyết',
  'gold_lion': 'Sư Tử Vàng',
  // Huyền thoại (0.01%)
  'phoenix': 'Phượng Hoàng',
  'dragon': 'Thần Long',
  'ninetails': 'Cửu Vĩ Hồ'
};

// KHÓA LẠI: Thêm onOpenProfile y hệt như Cài đặt
export function DuckyCompanion({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const { userStats, user, dailyCheckIn } = useTaskStore();
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    if (userStats.lastCheckIn === today) {
      setIsCheckedIn(true);
    }
  }, [userStats.lastCheckIn]);

  const petId = userStats.equippedPet?.id || 'ducky';
  const petDisplayName = PET_NAME_MAP[petId] || 'Linh Thú';
  const userName = user?.name || 'Thủ Lĩnh';

  const handlePetClick = () => {
    if (!isCheckedIn) {
      const result = dailyCheckIn();
      if (result.success) setIsCheckedIn(true);
    }
    
    // GỌI TRỰC TIẾP LỆNH MỞ MODAL (Không dùng event ngầm nữa)
    if (onOpenProfile) {
      onOpenProfile();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full relative z-10 px-1">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePetClick}
        className="relative outline-none transition-all"
      >
        {/* === CẬP NHẬT: LẤY ẢNH TRỰC TIẾP TỪ THƯ MỤC CỦA ĐỒNG CHÍ === */}
        <img 
          src={`/assets/pets/${petId}.png`} 
          alt={petDisplayName}
          className={cn("w-20 h-20 object-contain drop-shadow-lg", !isCheckedIn && "animate-bounce")}
          onError={(e) => { 
            // Nếu không tìm thấy ảnh (do gõ sai tên ID), hiện bé Vịt mặc định để tránh lỗi trắng trang
            e.currentTarget.src = "/assets/pets/ducky.png"; 
          }}
        />
        {!isCheckedIn && (
          <div className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-md border border-white">
            TAP!
          </div>
        )}
      </motion.button>

      <div className="bg-white rounded-[20px] p-3 w-full shadow-sm border border-slate-100 relative text-center">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-slate-100" />
        <h4 className="font-bold text-slate-800 text-xs mb-1 tracking-tight">
          {userName}'s {petDisplayName}
        </h4>
        {!isCheckedIn ? (
          <>
            <p className="text-[10px] text-slate-500 font-medium">Hôm nay rảnh rỗi, tuyệt vời!</p>
            <p className="text-[10px] text-orange-500 font-bold mt-0.5 animate-pulse">Chạm vào tôi điểm danh</p>
          </>
        ) : (
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Đã nhận quà hôm nay! ✨</p>
        )}
      </div>
    </div>
  );
}