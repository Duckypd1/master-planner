import React from 'react';
import { Home, CalendarDays, ShoppingBag, Settings, CheckSquare } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
}

export function BottomNav({ activeTab, onTabChange, onOpenShop, onOpenSettings }: BottomNavProps) {
  return (
    // =========================================================
    // CẬP NHẬT TỌA ĐỘ: 
    // - Sang phải 18px: Từ 'calc(50% - 18px)' -> 'calc(50%)' (Hết lệch trái)
    // - Xuống dưới 66px: Từ '67px' -> '1px' và '+ 43px' -> '- 23px'
    // =========================================================
    <div 
      className="md:hidden fixed z-[100] pointer-events-none"
      style={{ 
        width: 'calc(100vw - 44px)', 
        bottom: 'max(1px, calc(env(safe-area-inset-bottom) - 23px))', 
        left: '50%', 
        transform: 'translateX(-50%)'
      }}
    >
      {/* KHUNG CAPSULE: Giữ nguyên hoàn toàn giao diện bên trong */}
      <div className="bg-white/95 backdrop-blur-2xl border border-white/60 rounded-[2rem] w-full h-[56px] flex items-center justify-between px-3 shadow-[0_15px_35px_rgba(0,0,0,0.15)] pointer-events-auto relative">
        
        {/* NÚT 1: HÔM NAY */}
        <button onClick={() => onTabChange('today')} className="flex flex-col items-center justify-center w-[48px] h-full active:scale-95 transition-transform">
          <Home className={cn("w-[18px] h-[18px] mb-1", activeTab === 'today' ? "text-slate-800" : "text-slate-400")} />
          <span className={cn("text-[9px] font-semibold leading-none whitespace-nowrap", activeTab === 'today' ? "text-slate-800" : "text-slate-500")}>Hôm nay</span>
        </button>

        {/* NÚT 2: SẮP TỚI */}
        <button onClick={() => onTabChange('upcoming')} className="flex flex-col items-center justify-center w-[48px] h-full active:scale-95 transition-transform">
          <CalendarDays className={cn("w-[18px] h-[18px] mb-1", activeTab === 'upcoming' ? "text-slate-800" : "text-slate-400")} />
          <span className={cn("text-[9px] font-semibold leading-none whitespace-nowrap", activeTab === 'upcoming' ? "text-slate-800" : "text-slate-500")}>Sắp tới</span>
        </button>

        {/* NÚT 3: CỬA HÀNG (MÀU CAM) */}
        <div className="relative w-[60px] h-full flex justify-center z-20">
          <button 
            onClick={onOpenShop} 
            className="absolute -top-[20px] flex flex-col items-center justify-center active:scale-95 transition-transform"
          >
             <div className="w-[48px] h-[48px] rounded-full bg-gradient-to-tr from-[#ff9f1a] to-[#ff7f00] flex items-center justify-center shadow-[0_6px_15px_rgba(255,127,0,0.4)] border-[3px] border-white mb-[3px]">
                <ShoppingBag className="w-[20px] h-[20px] text-white" />
             </div>
             <span className="text-[10px] font-bold text-[#ff7f00] whitespace-nowrap leading-none">Cửa hàng</span>
          </button>
        </div>

        {/* NÚT 4: XONG */}
        <button onClick={() => onTabChange('completed')} className="flex flex-col items-center justify-center w-[48px] h-full active:scale-95 transition-transform">
          <CheckSquare className={cn("w-[18px] h-[18px] mb-1", activeTab === 'completed' ? "text-slate-800" : "text-slate-400")} />
          <span className={cn("text-[9px] font-semibold leading-none whitespace-nowrap", activeTab === 'completed' ? "text-slate-800" : "text-slate-500")}>Xong</span>
        </button>

        {/* NÚT 5: CÀI ĐẶT */}
        <button onClick={onOpenSettings} className="flex flex-col items-center justify-center w-[48px] h-full active:scale-95 transition-transform">
           <Settings className="w-[18px] h-[18px] mb-1 text-slate-400" />
           <span className="text-[9px] font-semibold leading-none whitespace-nowrap text-slate-500">Cài đặt</span>
        </button>

      </div>
    </div>
  );
}