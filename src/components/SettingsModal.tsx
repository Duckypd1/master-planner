import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Download, Upload, AlertTriangle, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTaskStore } from '../store/useTaskStore';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'data';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>('data');
  const { tasks, settings, importData, clearAllData, logout } = useTaskStore();
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEng = i18n.language === 'en' || i18n.language?.startsWith('en');

  if (!isOpen) return null;

  const tabs = [
    { id: 'data', label: isEng ? 'Data & Account' : 'Dữ liệu & Tài khoản', icon: Database }
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white/95 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] w-[92vw] max-w-[360px] md:max-w-4xl max-h-[85vh] md:h-[80vh] flex flex-col md:flex-row overflow-hidden relative"
        >
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
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center justify-center md:justify-start gap-3 p-3 md:px-4 md:py-3 rounded-xl text-sm font-medium transition-colors shrink-0", isActive ? "bg-white text-cyan-700 shadow-sm border border-slate-200" : "text-slate-600 hover:bg-white/50 hover:text-slate-900")}>
                    <Icon className={cn("w-6 h-6 md:w-5 md:h-5", isActive ? "text-cyan-500" : "text-slate-400")} />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
            <div className="hidden md:flex justify-end p-4 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur z-10">
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-safe hide-scrollbar">
              <div className="max-w-2xl mx-auto space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">{isEng ? 'Backup & Account' : 'Sao lưu & Tài khoản'}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleExport} className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50 transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center group-hover:bg-cyan-200 transition-colors"><Download className="w-6 h-6 text-cyan-600" /></div>
                      <div className="text-center">
                        <div className="font-semibold text-slate-800">{isEng ? 'Export Data' : 'Xuất Dữ liệu'}</div>
                        <div className="text-xs text-slate-500 mt-1">{isEng ? 'Save .json to device' : 'Lưu file JSON'}</div>
                      </div>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors"><Upload className="w-6 h-6 text-blue-600" /></div>
                      <div className="text-center">
                        <div className="font-semibold text-slate-800">{isEng ? 'Import Data' : 'Nhập Dữ liệu'}</div>
                        <div className="text-xs text-slate-500 mt-1">{isEng ? 'Restore from .json' : 'Khôi phục từ JSON'}</div>
                      </div>
                    </button>
                    <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />
                    
                    <button onClick={handleLogout} className="col-span-2 flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors group">
                      <LogOut className="w-5 h-5 text-orange-600" />
                      <div className="font-semibold text-orange-700">{isEng ? 'Log Out from Device' : 'Đăng xuất khỏi thiết bị'}</div>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                  <div className="p-6 rounded-xl border-2 border-red-100 bg-red-50/50">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{isEng ? 'Clear all data' : 'Xóa toàn bộ dữ liệu'}</h4>
                        <p className="text-sm text-slate-600 mt-1 mb-4">{isEng ? 'This action permanently deletes all tasks.' : 'Hành động này sẽ xóa vĩnh viễn tất cả công việc. Không thể hoàn tác.'}</p>
                        {showClearConfirm ? (
                          <div className="flex items-center gap-3">
                            <button onClick={handleClearData} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">{isEng ? 'Confirm Delete' : 'Xác nhận Xóa'}</button>
                            <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">{isEng ? 'Cancel' : 'Hủy'}</button>
                          </div>
                        ) : (
                          <button onClick={handleClearData} className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">{isEng ? 'Clear Data' : 'Xóa Dữ liệu'}</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}