/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ActionView } from './components/ActionView';
import { SettingsModal } from './components/SettingsModal';
import { PromotionModal } from './components/PromotionModal';
import { ShopModal } from './components/ShopModal';
import { ProfileModal } from './components/ProfileModal'; 
import { BottomNav } from './components/BottomNav'; 
import { AuthModal } from './components/AuthModal'; 
import { Inventory } from './components/Inventory'; 
import { AdminDashboard } from './components/AdminDashboard'; 
import { useTaskStore } from './store/useTaskStore';
// 👇 MỚI: Thêm icon ShieldAlert cho nút Admin
import { Plus, ShieldAlert } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [activeView, setActiveView] = useState('today');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); 
  const [isExternalModalOpen, setIsExternalModalOpen] = useState(false);
  
  const { tasks, initializeSupabaseSync, settings, user, userStats } = useTaskStore();

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'theme_dark':
        return 'bg-slate-900 text-slate-100 bg-[radial-gradient(circle_at_0%_0%,#1e3a8a_0%,transparent_50%),radial-gradient(circle_at_100%_100%,#4c1d95_0%,transparent_50%),radial-gradient(circle_at_100%_0%,#0f766e_0%,transparent_50%)]';
      case 'theme_sakura':
        return 'bg-pink-50 text-pink-900 bg-[radial-gradient(circle_at_0%_0%,#fbcfe8_0%,transparent_50%),radial-gradient(circle_at_100%_100%,#fce7f3_0%,transparent_50%),radial-gradient(circle_at_100%_0%,#fdf2f8_0%,transparent_50%)]';
      case 'theme_cyberpunk':
        return 'bg-zinc-950 text-cyan-400 bg-[radial-gradient(circle_at_0%_0%,#06b6d4_0%,transparent_50%),radial-gradient(circle_at_100%_100%,#ec4899_0%,transparent_50%),radial-gradient(circle_at_100%_0%,#eab308_0%,transparent_50%)]';
      default:
        return 'bg-slate-50 text-slate-900 bg-[radial-gradient(circle_at_0%_0%,#3b82f6_0%,transparent_50%),radial-gradient(circle_at_100%_100%,#8b5cf6_0%,transparent_50%),radial-gradient(circle_at_100%_0%,#14b8a6_0%,transparent_50%)]';
    }
  };

  useEffect(() => {
    if (user?.email) {
      initializeSupabaseSync(user.email);
    }
    
    const handleOpenShop = () => setIsShopOpen(true);
    const handleOpenProfile = () => setIsProfileOpen(true);
    const handleExternalModal = (e: any) => setIsExternalModalOpen(e.detail);
    
    window.addEventListener('openShopModal', handleOpenShop);
    window.addEventListener('openProfileModal', handleOpenProfile);
    window.addEventListener('toggleExternalModal', handleExternalModal);
    
    return () => {
      window.removeEventListener('openShopModal', handleOpenShop);
      window.removeEventListener('openProfileModal', handleOpenProfile);
      window.removeEventListener('toggleExternalModal', handleExternalModal);
    };
  }, [user?.email, initializeSupabaseSync]); 

  // 👇 MỚI: HỆ THỐNG PHÍM TẮT BÍ MẬT (Ctrl + Shift + A)
  useEffect(() => {
    const handleSecretKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        if ((userStats as any)?.role === 'admin') {
          setActiveView('admin');
        } else {
          alert('⚠️ HỆ THỐNG CẢNH BÁO: Bạn không có quyền truy cập khu vực quân sự này!');
        }
      }
    };
    window.addEventListener('keydown', handleSecretKey);
    return () => window.removeEventListener('keydown', handleSecretKey);
  }, [userStats]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkDeadlines = () => {
      if ('Notification' in window && Notification.permission === 'granted') {
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        
        tasks.forEach(task => {
          if (task.dueDate && task.progress !== 100) {
            const dueDate = new Date(task.dueDate);
            if (dueDate > now && dueDate <= oneHourFromNow && (dueDate.getTime() - now.getTime()) > 59 * 60 * 1000) {
              new Notification('Sắp đến hạn!', {
                body: `Công việc "${task.titleKey}" sắp đến hạn.`,
                icon: '/favicon.ico'
              });
            }
          }
        });
      }
    };

    const interval = setInterval(checkDeadlines, 60000);
    return () => clearInterval(interval);
  }, [tasks]);

  const isAnyModalOpen = isSettingsOpen || isShopOpen || isProfileOpen || isExternalModalOpen || userStats.promotionStatus === 'success';

  if (!user) return <AuthModal />; 

  return (
    <div className={cn("flex h-screen w-full overflow-hidden font-sans", getThemeClasses(settings.activeTheme))}>
      <div className={cn(
        "hidden md:block h-full relative z-20 transition-all duration-300",
        isAnyModalOpen && "md:!hidden"
      )}>
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)} 
        />
      </div>

      <main className="flex-1 relative z-10 pb-20 md:pb-0 h-full overflow-hidden overflow-y-auto hide-scrollbar">
        {['today', 'upcoming', 'category', 'completed'].includes(activeView) && (
          <ActionView activeView={activeView} />
        )}
        
        {activeView === 'inventory' && <Inventory />}

        {activeView === 'admin' && (userStats as any).role === 'admin' && (
          <AdminDashboard />
        )}

        {!['today', 'upcoming', 'category', 'completed', 'inventory', 'admin'].includes(activeView) && (
          <div className="flex items-center justify-center h-full text-slate-500 italic">
            Chức năng đang được khởi tạo...
          </div>
        )}
      </main>

      {!isAnyModalOpen && (
        <BottomNav 
          activeTab={activeView} 
          onTabChange={setActiveView} 
          onOpenShop={() => setIsShopOpen(true)} 
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* NÚT THÊM TASK (GÓC DƯỚI BÊN PHẢI) */}
      {!isAnyModalOpen && activeView !== 'admin' && (
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('openAddTaskModal'))}
          className="hidden md:flex fixed right-6 bottom-6 items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg hover:scale-105 active:scale-95 transition-all z-50"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* 👇 MỚI: NÚT VÀO ADMIN DASHBOARD (GÓC DƯỚI BÊN TRÁI - CHỈ HIỆN VỚI ADMIN) */}
      {!isAnyModalOpen && (userStats as any).role === 'admin' && activeView !== 'admin' && (
        <button
          onClick={() => setActiveView('admin')}
          className="fixed left-4 bottom-24 md:left-6 md:bottom-6 items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-800 text-rose-500 border-2 border-rose-500/50 shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:scale-105 active:scale-95 transition-all z-50 flex"
          title="Trạm Chỉ Huy Admin"
        >
          <ShieldAlert className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <PromotionModal />
    </div>
  );
}