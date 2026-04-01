import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Palette, Settings as SettingsIcon, Link as LinkIcon, Download, Upload, AlertTriangle, Plus, Trash2, Bell, Globe, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTaskStore } from '../store/useTaskStore';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'data' | 'appearance' | 'preferences' | 'integrations';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>('data');
  const { tasks, settings, updateSettings, importData, clearAllData, logout } = useTaskStore();
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('bg-blue-500');

  const isEng = i18n.language === 'en' || i18n.language?.startsWith('en');

  if (!isOpen) return null;

  const tabs = [
    { id: 'data', label: isEng ? 'Data' : 'Dữ liệu', icon: Database },
    { id: 'appearance', label: isEng ? 'Appearance' : 'Giao diện & Ngôn ngữ', icon: Palette },
    { id: 'preferences', label: isEng ? 'Preferences' : 'Cấu hình', icon: SettingsIcon },
    { id: 'integrations', label: isEng ? 'Integrations' : 'Tích hợp', icon: LinkIcon },
  ] as const;

  const handleExport = () => {
    const data = { tasks, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `master-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.tasks || data.settings) {
          importData(data);
          alert(isEng ? 'Data imported successfully!' : 'Nhập dữ liệu thành công!');
        } else {
          alert(isEng ? 'Invalid file format.' : 'File không đúng định dạng.');
        }
      } catch (error) {
        alert(isEng ? 'Error reading JSON file.' : 'Lỗi khi đọc file JSON.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearData = () => {
    if (showClearConfirm) {
      clearAllData();
      setShowClearConfirm(false);
      alert(isEng ? 'All data cleared.' : 'Đã xóa toàn bộ dữ liệu.');
    } else {
      setShowClearConfirm(true);
    }
  };

  const handleLogout = () => {
    if (window.confirm(isEng ? 'Are you sure you want to log out?' : 'Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
      onClose();
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCategory = { id: Date.now().toString(), name: newCategoryName.trim(), color: newCategoryColor };
    updateSettings({ categories: [...settings.categories, newCategory] });
    setNewCategoryName('');
  };

  const handleDeleteCategory = (id: string) => {
    updateSettings({ categories: settings.categories.filter(c => c.id !== id) });
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert(isEng ? 'Your browser does not support notifications.' : 'Trình duyệt của bạn không hỗ trợ thông báo.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      alert(isEng ? 'Notification permission granted!' : 'Đã cấp quyền thông báo thành công!');
    } else {
      alert(isEng ? 'Notification permission denied.' : 'Bạn đã từ chối cấp quyền thông báo.');
    }
  };

  const renderDataTab = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{isEng ? 'Backup & Restore' : 'Sao lưu & Phục hồi'}</h3>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={handleExport} className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50 transition-colors group">
            <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
              <Download className="w-6 h-6 text-cyan-600" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-slate-800">{isEng ? 'Export Data' : 'Xuất Dữ liệu'}</div>
              <div className="text-xs text-slate-500 mt-1">{isEng ? 'Save .json to device' : 'Lưu file .json về máy'}</div>
            </div>
          </button>

          <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors group">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-slate-800">{isEng ? 'Import Data' : 'Nhập Dữ liệu'}</div>
              <div className="text-xs text-slate-500 mt-1">{isEng ? 'Restore from .json' : 'Khôi phục từ file .json'}</div>
            </div>
          </button>
          <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />

          {/* 👇 ĐÃ CHỐT: NÚT ĐĂNG XUẤT */}
          <button onClick={handleLogout} className="col-span-2 flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors group">
            <LogOut className="w-5 h-5 text-orange-600" />
            <div className="font-semibold text-orange-700">{isEng ? 'Log Out from Device' : 'Đăng xuất khỏi thiết bị này'}</div>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
        <div className="p-6 rounded-xl border-2 border-red-100 bg-red-50/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800">{isEng ? 'Clear all data' : 'Xóa toàn bộ dữ liệu'}</h4>
              <p className="text-sm text-slate-600 mt-1 mb-4">
                {isEng ? 'This action permanently deletes all tasks and settings. Cannot be undone.' : 'Hành động này sẽ xóa vĩnh viễn tất cả công việc và cài đặt. Không thể hoàn tác.'}
              </p>
              {showClearConfirm ? (
                <div className="flex items-center gap-3">
                  <button onClick={handleClearData} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                    {isEng ? 'Confirm Delete' : 'Xác nhận Xóa'}
                  </button>
                  <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                    {isEng ? 'Cancel' : 'Hủy'}
                  </button>
                </div>
              ) : (
                <button onClick={handleClearData} className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">
                  {isEng ? 'Clear Data' : 'Xóa Dữ liệu'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-8">
      {/* KHU VỰC NGÔN NGỮ */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" /> {isEng ? 'Language' : 'Ngôn ngữ'}
        </h3>
        <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
          <div>
            <div className="font-medium text-slate-800">{isEng ? 'English Display' : 'Hiển thị tiếng Anh'}</div>
            <div className="text-sm text-slate-500">{isEng ? 'Switch application language to English' : 'Chuyển đổi giao diện sang tiếng Anh'}</div>
          </div>
          <div className="relative inline-block w-12 h-6 rounded-full bg-slate-200">
            <input 
              type="checkbox" 
              className="peer sr-only"
              checked={isEng}
              onChange={() => i18n.changeLanguage(isEng ? 'vi' : 'en')}
            />
            <div className="absolute inset-0 rounded-full transition-colors peer-checked:bg-cyan-500"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6"></div>
          </div>
        </label>
      </div>

      {/* KHU VỰC GIAO DIỆN */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{isEng ? 'Appearance' : 'Giao diện'}</h3>
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <label className="block text-sm font-medium text-slate-700 mb-2">{isEng ? 'Theme' : 'Chủ đề (Theme)'}</label>
            <select
              value={settings.activeTheme || 'default'}
              onChange={(e) => updateSettings({ activeTheme: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="default">{isEng ? 'Default (Light)' : 'Mặc định (Sáng)'}</option>
              {useTaskStore.getState().userStats.unlockedThemes.includes('theme_dark') && <option value="theme_dark">Dark Mode</option>}
              {useTaskStore.getState().userStats.unlockedThemes.includes('theme_sakura') && <option value="theme_sakura">Sakura (Hoa anh đào)</option>}
              {useTaskStore.getState().userStats.unlockedThemes.includes('theme_cyberpunk') && <option value="theme_cyberpunk">Cyberpunk</option>}
            </select>
          </div>
        </div>
      </div>

      {/* KHU VỰC ÂM THANH */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{isEng ? 'Sound' : 'Âm thanh'}</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
            <div>
              <div className="font-medium text-slate-800">{isEng ? 'Sound Effects' : 'Hiệu ứng âm thanh'}</div>
              <div className="text-sm text-slate-500">{isEng ? 'Play sound on task completion' : 'Phát âm thanh khi hoàn thành công việc'}</div>
            </div>
            <div className="relative inline-block w-12 h-6 rounded-full bg-slate-200">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              />
              <div className="absolute inset-0 rounded-full transition-colors peer-checked:bg-cyan-500"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6"></div>
            </div>
          </label>

          {settings.soundEnabled && (
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <label className="block text-sm font-medium text-slate-700 mb-2">{isEng ? 'Completion Sound' : 'Âm thanh hoàn thành'}</label>
              <select
                value={settings.activeSound || 'default'}
                onChange={(e) => updateSettings({ activeSound: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="default">{isEng ? 'Default' : 'Mặc định'}</option>
                {useTaskStore.getState().userStats.unlockedSounds.includes('sound_mario') && <option value="sound_mario">Mario Coin</option>}
                {useTaskStore.getState().userStats.unlockedSounds.includes('sound_zelda') && <option value="sound_zelda">Zelda Secret</option>}
                {useTaskStore.getState().userStats.unlockedSounds.includes('sound_lofi') && <option value="sound_lofi">Lofi Chill</option>}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => {
    const colorOptions = [
      'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 
      'bg-emerald-500', 'bg-rose-500', 'bg-cyan-500', 'bg-amber-500'
    ];

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">{isEng ? 'Pomodoro Timer' : 'Thời gian Pomodoro'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{isEng ? 'Work time (min)' : 'Thời gian làm việc (phút)'}</label>
              <input type="number" value={settings.pomodoroWork} onChange={(e) => updateSettings({ pomodoroWork: Number(e.target.value) })} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{isEng ? 'Break time (min)' : 'Thời gian nghỉ (phút)'}</label>
              <input type="number" value={settings.pomodoroBreak} onChange={(e) => updateSettings({ pomodoroBreak: Number(e.target.value) })} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">{isEng ? 'Category Management' : 'Quản lý Danh mục'}</h3>
          <div className="space-y-3 mb-4">
            {settings.categories.map((category: any) => (
              <div key={category.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className={cn("w-4 h-4 rounded-full", category.color)} />
                  <span className="font-medium text-slate-700">{category.name}</span>
                </div>
                <button onClick={() => handleDeleteCategory(category.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
            <input type="text" placeholder={isEng ? 'New category name...' : 'Tên danh mục mới...'} value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="flex-1 bg-transparent border-none focus:outline-none text-slate-700" />
            <div className="flex gap-1">
              {colorOptions.map(color => (
                <button key={color} onClick={() => setNewCategoryColor(color)} className={cn("w-6 h-6 rounded-full border-2 transition-transform", color, newCategoryColor === color ? "border-slate-800 scale-110" : "border-transparent hover:scale-110")} />
              ))}
            </div>
            <button onClick={handleAddCategory} disabled={!newCategoryName.trim()} className="p-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">❄️</span> Streak Freeze Market
          </h3>
          <div className="p-6 rounded-xl border border-blue-200 bg-blue-50/50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800">{isEng ? 'Buy Streak Freeze' : 'Mua Khiên Bảo Vệ Chuỗi'}</h4>
                <p className="text-sm text-slate-600 mt-1">
                  {isEng ? 'Use 500 Coins to buy 1 day of protection.' : 'Sử dụng 500 Coins để mua 1 ngày bảo vệ Streak.'}
                </p>
              </div>
              <button 
                onClick={() => {
                  const success = useTaskStore.getState().buyItem('streak_freeze', 500, 'item');
                  if (success) {
                    alert(isEng ? 'Successfully purchased!' : 'Đã mua thành công!');
                  } else {
                    alert(isEng ? 'Not enough coins!' : 'Không đủ xu!');
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity shadow-md shadow-blue-500/30 whitespace-nowrap ml-4"
              >
                {isEng ? 'Buy (500 🪙)' : 'Mua (500 🪙)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderIntegrationsTab = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Telegram Bot</h3>
        <p className="text-sm text-slate-500 mb-4">
          {isEng ? 'Connect with Telegram Bot.' : 'Kết nối với Telegram Bot để nhận thông báo.'}
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Webhook URL</label>
            <input type="text" placeholder="https://..." value={settings.telegramWebhook} onChange={(e) => updateSettings({ telegramWebhook: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bot Token</label>
            <input type="password" placeholder="123456789:ABCdef..." value={settings.telegramToken} onChange={(e) => updateSettings({ telegramToken: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{isEng ? 'Browser Notifications' : 'Thông báo Trình duyệt'}</h3>
        <button onClick={requestNotificationPermission} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
          <Bell className="w-4 h-4" />
          {isEng ? 'Grant Permission' : 'Cấp quyền thông báo'}
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white/95 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] w-[92vw] max-w-[360px] md:max-w-4xl max-h-[85vh] md:h-[80vh] flex flex-col md:flex-row overflow-hidden relative"
          >
            {/* Top/Left Sidebar */}
            <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-4 md:p-6 flex flex-col shrink-0 sticky top-0 z-10">
              <div className="flex items-center justify-between mb-4 md:mb-8">
                <h2 className="text-xl font-bold text-slate-800">{isEng ? 'Settings' : 'Cài đặt'}</h2>
                <button onClick={onClose} className="md:hidden p-1.5 text-slate-400 bg-white border border-slate-200 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <nav className="flex md:flex-col justify-around md:justify-start gap-2 overflow-x-auto hide-scrollbar pb-2 md:pb-0">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center justify-center md:justify-start gap-3 p-3 md:px-4 md:py-3 rounded-xl text-sm font-medium transition-colors shrink-0",
                        isActive ? "bg-white text-cyan-700 shadow-sm border border-slate-200" : "text-slate-600 hover:bg-white/50 hover:text-slate-900"
                      )}
                    >
                      <Icon className={cn("w-6 h-6 md:w-5 md:h-5", isActive ? "text-cyan-500" : "text-slate-400")} />
                      <span className="hidden md:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right Content */}
            <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
              <div className="hidden md:flex justify-end p-4 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur z-10">
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-safe hide-scrollbar">
                <div className="max-w-2xl mx-auto">
                  {activeTab === 'data' && renderDataTab()}
                  {activeTab === 'appearance' && renderAppearanceTab()}
                  {activeTab === 'preferences' && renderPreferencesTab()}
                  {activeTab === 'integrations' && renderIntegrationsTab()}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}