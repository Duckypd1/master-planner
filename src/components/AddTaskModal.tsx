import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { cn } from '../lib/utils';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const { addTask, settings } = useTaskStore();
  
  // State quản lý form - Y hệt các trường trong ảnh mẫu
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'fixed' | 'flexible'>('flexible');
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [quadrant, setQuadrant] = useState('DO_FIRST');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Tạo object task mới
    const newTask = {
      id: Date.now().toString(),
      titleKey: title,
      type,
      time: type === 'fixed' ? '09:00 AM - 10:00 AM' : 'Chưa xếp lịch',
      category,
      progress: 0,
      priority,
      dueDate: new Date(dueDate),
      eisenhowerQuadrant: quadrant,
    };

    // Gọi hàm addTask (Trong Store đã có sẵn logic khóa 12 việc/ngày)
    addTask(newTask as any);
    
    // Reset và đóng
    setTitle('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        // =======================================================
        // CẬP NHẬT TỌA ĐỘ PIXEL-PERFECT: Lên 32px, Trái 18px
        // =======================================================
        className="relative -top-[1px] -left-[0px] bg-[#f0f2f5] rounded-3xl shadow-2xl w-[92vw] max-w-[360px] md:max-w-lg max-h-[85vh] overflow-hidden flex flex-col border border-white"
      >
        {/* Header - */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-white shrink-0">
          <h2 className="text-lg font-bold text-[#1e293b]">Thêm công việc mới</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form - Thêm hide-scrollbar để cuộn mượt không bị hiện thanh cuộn xấu */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto hide-scrollbar flex-1">
          {/* Tên công việc */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Tên công việc</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Làm tài liệu chủ đề trẻ em..."
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-cyan-100 outline-none transition-all placeholder:text-slate-300"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Loại công việc */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Loại công việc</label>
              <div className="flex bg-white rounded-xl p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setType('flexible')}
                  className={cn("flex-1 py-1.5 text-xs font-bold rounded-lg transition-all", type === 'flexible' ? "bg-white text-cyan-500 shadow-sm border border-slate-100" : "text-slate-400")}
                >
                  Linh hoạt
                </button>
                <button
                  type="button"
                  onClick={() => setType('fixed')}
                  className={cn("flex-1 py-1.5 text-xs font-bold rounded-lg transition-all", type === 'fixed' ? "bg-white text-cyan-500 shadow-sm border border-slate-100" : "text-slate-400")}
                >
                  Cố định
                </button>
              </div>
            </div>

            {/* Danh mục */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Danh mục</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-cyan-100 outline-none font-medium text-slate-700"
              >
                <option value="Work">Work</option>
                <option value="Study">Study</option>
                <option value="Health">Health</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Độ ưu tiên */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Độ ưu tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white outline-none font-medium text-slate-700"
              >
                <option value="High">Cao</option>
                <option value="Medium">TB</option>
                <option value="Low">Thấp</option>
              </select>
            </div>

            {/* Hạn chót */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Hạn chót</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white outline-none font-medium text-slate-700"
              />
            </div>
          </div>

          {/* Ma trận Eisenhower */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Ma trận Eisenhower</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'DO_FIRST', label: 'Quan trọng & Khẩn', active: 'border-red-500 text-red-600 bg-red-50' },
                { id: 'SCHEDULE', label: 'Quan trọng, Không khẩn', active: 'border-blue-500 text-blue-600 bg-blue-50' },
                { id: 'DELEGATE', label: 'Khẩn, Không QT', active: 'border-orange-500 text-orange-600 bg-orange-50' },
                { id: 'DONT_DO', label: 'Không khẩn, Không QT', active: 'border-slate-500 text-slate-600 bg-slate-50' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setQuadrant(item.id)}
                  className={cn(
                    "p-2 rounded-xl border bg-white text-[10px] font-bold transition-all text-center leading-tight h-10 flex items-center justify-center",
                    quadrant === item.id ? item.active : "border-slate-100 text-slate-500 hover:border-slate-200"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Footer - */}
        <div className="p-4 border-t border-slate-200 bg-white shrink-0 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-5 py-2 bg-[#82cedb] hover:bg-[#6fbcc9] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-200 transition-all active:scale-95"
          >
            Thêm Task
          </button>
        </div>
      </motion.div>
    </div>
  );
}