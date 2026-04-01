import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from './GlassCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Clock, Undo2, Trash2, Plus, ChevronDown, ChevronRight, CheckSquare, Share2, ShoppingBag, X } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { motion, AnimatePresence } from 'framer-motion';
import { AddTaskModal } from './AddTaskModal';
import { useTaskStore, Task } from '../store/useTaskStore';
import { UrgentRadarWidget } from './UrgentRadarWidget';
import { RadarChartWidget } from './RadarChartWidget';
import { PomodoroWidget } from './PomodoroWidget';
// 👇 IMPORT DUCKY COMPANION VÀO ĐÂY
import { DuckyCompanion } from './DuckyCompanion';

// === COMPONENT: ĐỒNG HỒ POMODORO (Góc phải ActionView trên Mobile) ===
const MobileClockButton = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <button 
      onClick={() => window.dispatchEvent(new CustomEvent('openPomodoroMobile'))}
      className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white rounded-2xl font-black shadow-[0_4px_15px_rgba(0,0,0,0.15)] active:scale-95 transition-transform"
    >
      <Clock className="w-4 h-4 text-rose-400" />
      <span className="tracking-wide text-sm">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    </button>
  );
};

export function ActionView({ activeView }: { activeView?: string }) {
  const { t, i18n } = useTranslation();
  const { tasks, addTask, updateTask, deleteTask, userStats, user, dailyCheckIn } = useTaskStore();
  
  const constraintsRef = useRef(null); 
  
  const [showWelcome, setShowWelcome] = useState(true);
  const [isPomodoroMobileOpen, setIsPomodoroMobileOpen] = useState(false);
  const petId = userStats?.equippedPet?.id || 'ducky';
  
  // 👇 ĐÃ XÓA BỎ BIẾN petName ("Vịt Ducky") THỪA THÃI Ở ĐÂY
  
  const userName = user?.name || 'Thủ Lĩnh';
  const isEng = i18n.language === 'en' || i18n.language?.startsWith('en');

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleOpenPomodoro = () => setIsPomodoroMobileOpen(true);
    window.addEventListener('openPomodoroMobile', handleOpenPomodoro);
    return () => window.removeEventListener('openPomodoroMobile', handleOpenPomodoro);
  }, []);

  const handlePetClick = () => {
    const today = new Date().toDateString();
    if (userStats?.lastCheckIn !== today) {
       dailyCheckIn();
    }
    window.dispatchEvent(new Event('openProfileModal'));
  };

  const todayTasks = useMemo(() => {
    const todayStart = new Date(); 
    todayStart.setHours(0, 0, 0, 0);
    const todayTime = todayStart.getTime();

    return tasks.filter(task => {
      if (task.progress === 100 || !task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() <= todayTime;
    });
  }, [tasks]);

  const upcomingTasks = useMemo(() => {
    const todayStart = new Date(); 
    todayStart.setHours(0, 0, 0, 0);
    const todayTime = todayStart.getTime();

    return tasks.filter(task => {
      if (task.progress === 100 || !task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() > todayTime;
    }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  }, [tasks]);

  const urgentTask = useMemo(() => todayTasks.length > 0 ? todayTasks[0] : upcomingTasks.length > 0 ? upcomingTasks[0] : null, [todayTasks, upcomingTasks]);
  const chatMessage = showWelcome ? `Chào ${userName}! Chúc một ngày năng suất nhé! ✨` : (urgentTask ? `Đừng quên: "${urgentTask.titleKey}" sắp đến hạn! ⏰` : `Tuyệt vời! Bạn đã xong hết việc hôm nay! 🎉`);

  const tasksByCategory = useMemo(() => {
    return tasks.filter(t => t.progress !== 100).reduce((acc, task) => {
      const cat = task.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = []; acc[cat].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);

  const completedTasksByMonth = useMemo(() => {
    return tasks.filter(t => t.progress === 100).reduce((acc, task) => {
      const dateValue = task.completedAt || task.dueDate || new Date();
      const dateObj = new Date(dateValue);
      const key = `Tháng ${new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(dateObj).replace('tháng ', '').replace(' năm ', ' ')}`;
      if (!acc[key]) acc[key] = []; acc[key].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);

  const [toast, setToast] = useState<{ id: string; task: Task; timeoutId: NodeJS.Timeout } | null>(null);
  const [recurringModal, setRecurringModal] = useState<Task | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const { floatingTexts, removeFloatingText } = useTaskStore();

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('toggleExternalModal', { detail: isAddModalOpen }));
  }, [isAddModalOpen]);

  useEffect(() => {
    const handleOpenModal = () => setIsAddModalOpen(true);
    window.addEventListener('openAddTaskModal', handleOpenModal);
    return () => window.removeEventListener('openAddTaskModal', handleOpenModal);
  }, []);

  const toggleCategory = (category: string) => setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  const data = [
    { name: t('actionView.completed'), value: tasks.filter(t => t.progress === 100).length, color: '#047857' },
    { name: t('actionView.inProgress'), value: tasks.filter(t => t.progress > 0 && t.progress < 100).length, color: '#1e40af' },
    { name: t('actionView.pending'), value: tasks.filter(t => t.progress === 0).length, color: '#c2410c' },
  ];

  const handleDelete = (task: Task) => task.isRecurring ? setRecurringModal(task) : executeSoftDelete(task);
  const executeSoftDelete = (task: Task) => {
    deleteTask(task.id);
    if (toast?.timeoutId) clearTimeout(toast.timeoutId);
    const timeoutId = setTimeout(() => setToast(null), 5000);
    setToast({ id: Date.now().toString(), task, timeoutId });
    setRecurringModal(null);
  };
  const handleUndo = () => { if (toast) { clearTimeout(toast.timeoutId); addTask(toast.task); setToast(null); } };
  const handleUnschedule = (task: Task) => updateTask(task.id, { time: 'Unscheduled' });

  const renderTodayView = () => (
    <div className="relative pl-4 border-l-2 border-slate-100 space-y-4">
      <AnimatePresence>
        {todayTasks.map((task) => (
          <motion.div key={task.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}>
            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-white z-10 bg-orange-500" />
            <TaskCard task={task} onDelete={handleDelete} onUnschedule={handleUnschedule} />
          </motion.div>
        ))}
        {todayTasks.length === 0 && <p className="text-slate-500 italic text-center py-4 bg-slate-50 rounded-xl">Không có công việc nào cho hôm nay. Nghỉ ngơi thôi!</p>}
      </AnimatePresence>
    </div>
  );

  const renderUpcomingView = () => (
    <div className="relative pl-4 border-l-2 border-slate-100 space-y-4">
      <AnimatePresence>
        {upcomingTasks.map((task) => (
          <motion.div key={task.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}>
            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-white z-10 bg-purple-500" />
            <TaskCard task={task} onDelete={handleDelete} onUnschedule={handleUnschedule} />
          </motion.div>
        ))}
        {upcomingTasks.length === 0 && <p className="text-slate-500 italic text-center py-4 bg-slate-50 rounded-xl">Không có công việc nào sắp tới.</p>}
      </AnimatePresence>
    </div>
  );

  const renderCategoryView = () => (
    <div className="space-y-6">
      {Object.entries(tasksByCategory).map(([category, catTasks]: [string, Task[]]) => (
        <div key={category} className="border border-white/80 rounded-3xl overflow-hidden bg-white/60 backdrop-blur-xl shadow-sm">
          <button onClick={() => toggleCategory(category)} className="w-full flex items-center justify-between p-4 bg-white/40 hover:bg-white/60 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <h3 className="font-semibold text-slate-800">{category}</h3>
              <span className="text-xs font-medium text-slate-600 bg-white/80 px-2 py-0.5 rounded-full">{catTasks.length}</span>
            </div>
            {expandedCategories[category] === false ? <ChevronRight className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          <AnimatePresence>
            {expandedCategories[category] !== false && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-4 space-y-4 bg-white/20">
                  {catTasks.map(task => <TaskCard key={task.id} task={task} onDelete={handleDelete} onUnschedule={handleUnschedule} />)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      {Object.keys(tasksByCategory).length === 0 && <p className="text-slate-500 italic text-center py-4">Trống rỗng.</p>}
    </div>
  );

  const renderCompletedView = () => (
    <div className="space-y-8">
      {Object.entries(completedTasksByMonth).map(([month, monthTasks]: [string, Task[]]) => (
        <div key={month}>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-500" /> {month}
          </h3>
          <div className="space-y-4">
            {monthTasks.map(task => <TaskCard key={task.id} task={task} onDelete={handleDelete} />)}
          </div>
        </div>
      ))}
      {Object.keys(completedTasksByMonth).length === 0 && <p className="text-slate-500 italic text-center py-4">Chưa có gì hoàn thành.</p>}
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'upcoming': return renderUpcomingView();
      case 'category': return renderCategoryView();
      case 'completed': return renderCompletedView();
      case 'today': default: return renderTodayView();
    }
  };

  const getTitle = () => {
    switch (activeView) {
      case 'upcoming': return 'Sắp tới';
      case 'category': return 'Danh mục';
      case 'completed': return 'Đã hoàn thành';
      case 'today': default: return 'Hôm nay';
    }
  };

  const currentDate = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <div ref={constraintsRef} className="p-4 pt-6 md:p-8 h-full overflow-y-auto relative pb-32 hide-scrollbar">
      
      {/* DESKTOP HEADER (Ẩn trên Mobile) */}
      <header className="hidden md:flex mb-8 justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{getTitle()}</h2>
          <p className="text-slate-500 mt-1 capitalize">{currentDate}</p>
        </div>
        <div className="flex gap-3 relative z-10">
          <button onClick={() => window.dispatchEvent(new CustomEvent('openShopModal'))} className="px-5 py-2.5 bg-white/60 backdrop-blur-md border border-white/80 rounded-xl text-sm font-medium text-slate-700 hover:bg-white/80 transition-colors shadow-sm flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-500" /> Cửa hàng
          </button>
          <button onClick={() => alert('Co-op Mode đang phát triển!')} className="px-5 py-2.5 bg-white/60 backdrop-blur-md border border-white/80 rounded-xl text-sm font-medium text-slate-700 hover:bg-white/80 transition-colors shadow-sm flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-500" /> Share Project
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-sm font-medium text-white shadow-lg items-center gap-2 flex hover:scale-105 transition-transform">
            <Plus className="w-4 h-4" /> {t('actionView.newTask')}
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MOBILE HERO SECTION: TIÊU ĐỀ, ĐỒNG HỒ & LINH THÚ          */}
      {/* ========================================================= */}
      <div className="md:hidden flex flex-col items-center justify-center mb-10 relative">
        <div className="flex justify-between items-end w-full px-2 mb-6">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none drop-shadow-sm">{getTitle()}</h2>
            <p className="text-xs font-bold text-slate-500 mt-1.5 capitalize">{currentDate}</p>
          </div>
          <div className="mb-1">
             <MobileClockButton />
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
          className="bg-white px-5 py-3 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 text-sm font-bold text-slate-700 relative mb-4 max-w-[85%] text-center z-10"
        >
          {chatMessage}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-b border-r border-slate-100" />
        </motion.div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePetClick}
          className="relative outline-none transition-transform flex flex-col items-center"
        >
          <motion.img 
            animate={{ y: [0, -10, 0] }} 
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} 
            src={`/assets/pets/${petId}.png`} 
            alt="Pet"
            className="w-40 h-40 object-contain drop-shadow-2xl" 
            onError={(e) => { e.currentTarget.src = "/assets/pets/ducky.png" }} 
          />
          {userStats?.lastCheckIn !== new Date().toDateString() && (
             <div className="absolute top-0 -right-4 bg-rose-500 text-white text-[11px] font-black px-3 py-1 rounded-full animate-bounce shadow-md border-2 border-white z-20">TAP!</div>
          )}
          {/* 👇 ĐÃ XÓA TÊN VỊT DUCKY HIỂN THỊ THỪA THÃI Ở MOBILE */}
        </motion.button>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-12 gap-6 relative z-10">
        
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          
          <div className="hidden md:flex flex-col items-center justify-center mb-2 mt-2 relative z-10">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePetClick}
              className="relative outline-none transition-transform flex flex-col items-center z-20"
            >
              <motion.img 
                animate={{ y: [0, -12, 0] }} 
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} 
                src={`/assets/pets/${petId}.png`} 
                alt="Pet"
                className="w-48 h-48 lg:w-56 lg:h-56 object-contain drop-shadow-2xl" 
                onError={(e) => { e.currentTarget.src = "/assets/pets/ducky.png" }} 
              />
              {userStats?.lastCheckIn !== new Date().toDateString() && (
                 <div className="absolute top-2 -right-2 bg-rose-500 text-white text-xs font-black px-4 py-1.5 rounded-full animate-bounce shadow-md border-2 border-white z-20">TAP!</div>
              )}
              {/* 👇 ĐÃ XÓA TÊN VỊT DUCKY HIỂN THỊ THỪA THÃI Ở DESKTOP */}
            </motion.button>

            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
              className="bg-white/95 backdrop-blur-md px-8 py-5 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 text-base lg:text-lg font-bold text-slate-700 relative mt-5 max-w-[90%] text-center z-10"
            >
              {chatMessage}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rotate-45 border-t border-l border-slate-100" />
            </motion.div>
          </div>

          <GlassCard className="p-5 md:p-6 min-h-[40vh] shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100/50 pb-3">
              <h3 className="text-xl font-black text-slate-800 pr-2">
                 {activeView === 'category' ? 'Danh sách công việc' : activeView === 'completed' ? 'Lịch sử hoàn thành' : activeView === 'upcoming' ? 'Công việc sắp tới' : t('actionView.timelineTitle')}
              </h3>
              {(!activeView || activeView === 'today' || activeView === 'upcoming') && (
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="md:hidden flex items-center justify-center w-11 h-11 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full text-white shadow-[0_6px_16px_rgba(99,102,241,0.4)] active:scale-90 transition-transform shrink-0"
                >
                  <Plus className="w-6 h-6 drop-shadow-sm" />
                </button>
              )}
            </div>
            {renderContent()}
          </GlassCard>

          <div className="md:hidden">
            <GlassCard className="p-6 mb-8 shadow-sm">
                <h3 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-100/50 pb-3">Tiến độ trong ngày</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-5 text-sm mt-6">
                  {data.map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-700 font-bold">{item.name}</span>
                    </div>
                  ))}
                </div>
            </GlassCard>
          </div>
        </div>

        <div className="hidden lg:block col-span-12 lg:col-span-4 space-y-6">
          <GlassCard className="p-6"><PomodoroWidget /></GlassCard>
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{t('actionView.dailyProgress')}</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
          <UrgentRadarWidget tasks={tasks} />
          <RadarChartWidget tasks={tasks} />
        </div>

      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="fixed bottom-32 md:bottom-8 right-4 md:right-8 bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-4 z-[95]">
            <span className="text-sm font-medium">{t('actionView.taskDeleted')}</span>
            <button onClick={handleUndo} className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm font-bold bg-white/10 px-3 py-1.5 rounded-xl transition-colors">
              <Undo2 className="w-4 h-4" /> {t('actionView.undo')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      <AnimatePresence>
        {isPomodoroMobileOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setIsPomodoroMobileOpen(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              onClick={e => e.stopPropagation()} 
              className="w-full max-w-sm relative"
            >
              <button onClick={() => setIsPomodoroMobileOpen(false)} className="absolute -top-14 right-0 p-3 bg-white/20 text-white rounded-full backdrop-blur-md active:scale-95 hover:bg-white/30 transition-colors shadow-lg">
                <X className="w-6 h-6"/>
              </button>
              
              <GlassCard className="p-6 overflow-hidden border border-white/50 shadow-2xl">
                 <PomodoroWidget />
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {floatingTexts.map(ft => (
          <motion.div key={ft.id} initial={{ opacity: 0, y: ft.y, x: ft.x, scale: 0.5 }} animate={{ opacity: 1, y: ft.y - 50, scale: 1.2 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 1, ease: "easeOut" }} onAnimationComplete={() => removeFloatingText(ft.id)} className="fixed z-[300] pointer-events-none text-xl font-black text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" style={{ left: 0, top: 0 }}>
            {ft.text}
          </motion.div>
        ))}
      </AnimatePresence>

    </div>
  );
}