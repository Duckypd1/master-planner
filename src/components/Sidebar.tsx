import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Settings, Flame, BarChart2, CheckSquare, LogOut, Globe, Menu, X, ShoppingBag, Backpack } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { useTaskStore } from '../store/useTaskStore';

// === COMPONENT: HUY HIỆU RANK KIM LOẠI ===
const DimensionalMetallicRankBadge = ({ rank, color, iconEmoji }: { rank: string; color: string; iconEmoji: string }) => {
  return (
    <div className="relative flex items-center justify-center w-10 h-10">
      <div className="absolute inset-0 rounded-full border-[3px]" style={{ borderColor: color, boxShadow: `0 0 8px ${color}` }} />
      <div className="absolute inset-[3px] rounded-full" style={{ backgroundColor: `${color}/30`, backgroundImage: `radial-gradient(circle_at_0%_0%,#ffffff30_0%,transparent_50%)` }} />
      <div className="absolute inset-[5px] flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ color: color }}>
          <path d="M50 15 C60 15 70 25 70 35 C70 45 60 55 50 55 C40 55 30 45 30 35 C30 25 40 15 50 15 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M25 65 L45 85" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M75 65 L55 85" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <span className="text-xl relative z-10">{iconEmoji}</span>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded-full bg-white/90 border border-black/5 shadow-sm text-center">
         <p className="text-[6px] font-black uppercase tracking-wider leading-none" style={{ color: color }}>{rank}</p>
      </div>
    </div>
  );
};

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void; 
}

export function Sidebar({ activeView, setActiveView, onOpenSettings, onOpenProfile }: SidebarProps) {
  const { i18n } = useTranslation(); 
  const { userStats, logout, user } = useTaskStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isEng = i18n.language === 'en';

  const getRankConfig = (rank: string) => {
    const defaultStyle = { color: '#4f46e5', bg: 'bg-indigo-100', icon: '⭐' }; 
    if (!rank) return defaultStyle;
    switch (rank) {
      case 'Đồng': return { color: '#a16207', bg: 'bg-[#cd7f32]/20', icon: '🥉' };
      case 'Bạc': return { color: '#111827', bg: 'bg-[#c0c0c0]/20', icon: '🥈' };
      case 'Vàng': return { color: '#ca8a04', bg: 'bg-[#ffd700]/20', icon: '🥇' };
      case 'Bạch Kim': return { color: '#0369a1', bg: 'bg-[#00ced1]/20', icon: '💎' };
      case 'Kim Cương': return { color: '#1e40af', bg: 'bg-[#4169e1]/20', icon: '💠' };
      case 'Cao Thủ': return { color: '#d946ef', bg: 'bg-[#ff00ff]/20', icon: '🔮' };
      case 'Thách Đấu': return { color: '#c2410c', bg: 'bg-orange-200', icon: '👑' };
      default: return defaultStyle;
    }
  };

  const currentRank = userStats?.rank || 'Đồng';
  const currentLP = userStats?.lp || 0;
  const r = getRankConfig(currentRank);

  const navItems = [
    { id: 'today', label: isEng ? 'Today' : 'Hôm nay', icon: Flame, color: 'text-orange-600' },
    { id: 'upcoming', label: isEng ? 'Upcoming' : 'Sắp tới', icon: CalendarDays, color: 'text-purple-600' },
    { id: 'category', label: isEng ? 'Categories' : 'Danh mục', icon: BarChart2, color: 'text-blue-600' },
    { id: 'inventory', label: isEng ? 'Inventory' : 'Kho đồ', icon: Backpack, color: 'text-pink-600' },
    { id: 'completed', label: isEng ? 'Done' : 'Xong', icon: CheckSquare, color: 'text-emerald-600' },
  ];

  return (
    <>
      {/* MOBILE SIDEBAR SECTION */}
      <div className="md:hidden block relative z-[60]">
        <div className={cn(
          "fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-slate-200 px-1 py-1.5 flex items-center justify-around pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)] transform",
          "translate-x-[15px] translate-y-[50px]"
        )}>
          <button onClick={() => setActiveView('today')} className={cn("flex flex-col items-center gap-1 p-2 min-w-[50px] transition-all", activeView === 'today' ? "text-orange-600 scale-110" : "text-slate-400 hover:text-slate-600")}>
             <Flame className="w-5 h-5 sm:w-6 sm:h-6" /><span className="text-[9px] sm:text-[10px] font-bold">Hôm nay</span>
          </button>
          
          <button onClick={() => setActiveView('upcoming')} className={cn("flex flex-col items-center gap-1 p-2 min-w-[50px] transition-all", activeView === 'upcoming' ? "text-purple-600 scale-110" : "text-slate-400 hover:text-slate-600")}>
             <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6" /><span className="text-[9px] sm:text-[10px] font-bold">Sắp tới</span>
          </button>
          
          <button onClick={() => window.dispatchEvent(new CustomEvent('openShopModal'))} className="flex flex-col items-center gap-1 p-2 text-amber-500 hover:text-amber-600 transition-all -translate-y-2 relative z-10">
             <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-amber-200 to-yellow-400 flex items-center justify-center shadow-lg border-2 border-white"><ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></div>
             <span className="text-[9px] sm:text-[10px] font-black tracking-tight mt-0.5">Cửa hàng</span>
          </button>

          <button onClick={() => setActiveView('inventory')} className={cn("flex flex-col items-center gap-1 p-2 min-w-[50px] transition-all", activeView === 'inventory' ? "text-pink-600 scale-110" : "text-slate-400 hover:text-slate-600")}>
             <Backpack className="w-5 h-5 sm:w-6 sm:h-6" /><span className="text-[9px] sm:text-[10px] font-bold">Kho đồ</span>
          </button>
          
          <button onClick={() => setActiveView('completed')} className={cn("flex flex-col items-center gap-1 p-2 min-w-[50px] transition-all", activeView === 'completed' ? "text-emerald-600 scale-110" : "text-slate-400 hover:text-slate-600")}>
             <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" /><span className="text-[9px] sm:text-[10px] font-bold">Xong</span>
          </button>
          
          <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center gap-1 p-2 min-w-[50px] text-slate-400 hover:text-slate-600">
             <Menu className="w-5 h-5 sm:w-6 sm:h-6" /><span className="text-[9px] sm:text-[10px] font-bold">Cài đặt</span>
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 bottom-0 w-72 bg-white z-[101] shadow-2xl p-6 flex flex-col pt-safe">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-black text-slate-800">Menu Hệ Thống</h2>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="mb-6">
                  <button onClick={() => { onOpenProfile(); setIsMobileMenuOpen(false); }} className={cn("w-full flex items-center gap-4 p-4 rounded-2xl border transition-active active:scale-95 shadow-sm", r.bg, "border-black/5")}>
                    <DimensionalMetallicRankBadge rank={currentRank} color={r.color} iconEmoji={r.icon} />
                    <div className="flex flex-col items-start leading-none ml-1">
                        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: r.color }}>Xếp hạng</span>
                        <span className="text-sm font-black tracking-tight text-slate-800">{currentRank} - {currentLP} LP</span>
                    </div>
                  </button>
                </div>

                <div className="space-y-3 flex-1">
                  <button onClick={() => { i18n.changeLanguage(isEng ? 'vi' : 'en'); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 p-4 text-blue-600 bg-blue-50 hover:bg-blue-100 font-bold rounded-2xl active:scale-95 transition-transform"><Globe className="w-6 h-6" /> {isEng ? 'Tiếng Việt' : 'English'}</button>
                  <button onClick={() => { onOpenSettings(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 p-4 text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold rounded-2xl active:scale-95 transition-transform"><Settings className="w-6 h-6" /> Cấu hình hệ thống</button>
                </div>

                <button onClick={logout} className="w-full flex items-center justify-center gap-2 p-4 text-red-600 bg-red-50 hover:bg-red-100 font-bold rounded-2xl active:scale-95 transition-transform mt-auto mb-safe"><LogOut className="w-5 h-5" /> Đăng xuất</button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* DESKTOP SIDEBAR SECTION */}
      {/* 👇 ĐÃ CHỈNH LẠI CHIỀU CAO THÀNH h-[calc(100vh-5rem)] ĐỂ CHỐNG BỊ TRÀN DO 50px DỊCH CHUYỂN DƯỚI */}
      <div className={cn(
        "hidden md:flex h-[calc(100vh-5rem)] flex-col p-3 lg:p-4 m-4 rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/40 shadow-xl transition-all duration-300 w-20 lg:w-64 z-10 relative transform overflow-y-auto hide-scrollbar",
        "translate-x-[15px] translate-y-[50px]"
      )}>
        {/* Hộp Rank */}
        <div className={cn("flex flex-col mb-4 p-2 lg:p-3 rounded-2xl border transition-all shadow-sm", r.bg, "border-black/5")}>
          <div className="flex items-center gap-2 lg:mb-2 justify-center lg:justify-start cursor-pointer group" onClick={onOpenProfile}>
             <div className="group-hover:scale-105 transition-transform"><DimensionalMetallicRankBadge rank={currentRank} color={r.color} iconEmoji={r.icon} /></div>
             <div className="hidden lg:block">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase leading-none mb-1">{isEng ? 'Rank' : 'Xếp hạng'}</h3>
              <p className="text-sm font-black leading-none group-hover:underline" style={{ color: r.color }}>{currentRank}</p>
            </div>
          </div>
          <div className="hidden lg:block w-full h-1.5 bg-white/50 rounded-full overflow-hidden shadow-inner mt-1">
            <motion.div className="h-full rounded-full bg-blue-900/80" initial={{ width: 0 }} animate={{ width: `${currentLP}%` }} style={{ backgroundImage: `linear-gradient(to right, ${r.color}, #0a2e6e)` }} /> 
          </div>
        </div>

        {/* Danh sách Menu */}
        <div className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className={cn("w-full flex items-center justify-center lg:justify-start gap-3 p-2.5 rounded-xl transition-all text-sm font-bold", activeView === item.id ? "bg-white shadow-sm border border-slate-200 text-slate-800" : "text-slate-500 hover:bg-white/60")}>
              <item.icon className={cn("w-6 h-6 lg:w-5 lg:h-5", item.color)} />
              <span className="hidden lg:block truncate">{item.label}</span>
            </button>
          ))}
        </div>

        {/* 👇 KHU VỰC DƯỚI CÙNG (Đã được bóp gọn khoảng cách lại) */}
        <div className="mt-auto space-y-1 pt-3 border-t border-white/20">
          
          {/* KHỐI THÔNG TIN TÀI KHOẢN */}
          <div className="hidden lg:block px-3 py-1.5 mb-1.5 bg-white/50 rounded-xl border border-white/60 shadow-sm">
            <p className="text-xs font-bold text-slate-700 truncate">{user?.name || (isEng ? 'Commander' : 'Chỉ huy')}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>

          <button onClick={() => i18n.changeLanguage(isEng ? 'vi' : 'en')} className="w-full flex items-center justify-center lg:justify-start gap-3 p-2 text-blue-500 text-sm font-bold hover:bg-blue-50 rounded-xl transition-all">
            <Globe className="w-5 h-5" /> <span className="hidden lg:block">{isEng ? 'Vietnamese' : 'Tiếng Việt'}</span>
          </button>
          
          <button onClick={onOpenSettings} className="w-full flex items-center justify-center lg:justify-start gap-3 p-2 text-slate-500 text-sm font-bold hover:bg-slate-50 rounded-xl transition-all">
            <Settings className="w-5 h-5" /> <span className="hidden lg:block">{isEng ? 'Settings' : 'Cài đặt'}</span>
          </button>
          
          <button onClick={logout} className="w-full flex items-center justify-center lg:justify-start gap-3 p-2 text-red-500 text-sm font-bold hover:bg-red-50 rounded-xl transition-all">
            <LogOut className="w-5 h-5" /> <span className="hidden lg:block">{isEng ? 'Logout' : 'Đăng xuất'}</span>
          </button>
        </div>
      </div>
    </>
  );
}