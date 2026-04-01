import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { GlassCard } from './GlassCard'; 
import { ShieldAlert, Coins, Trophy, Flame, Search, Package, ListTodo, X, CheckCircle2, Clock, BarChart3, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AVAILABLE_PETS = [
  'dog', 'cat', 'rooster', 'rabbit', 'ducky', 
  'wolf', 'fox', 'bear', 'tiger', 'penguin', 
  'polar_bear', 'unicorn', 'reindeer', 'gold_lion', 
  'phoenix', 'dragon', 'ninetails'
];

export function AdminDashboard() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State cho "Soi Task"
  const [selectedUserTasks, setSelectedUserTasks] = useState<any[] | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('user_stats').select('*').order('user_id', { ascending: true });
    if (!error) setStats(data || []);
    setLoading(false);
  };

  const handleUpdate = async (userId: string, currentStatsJson: any, newUpdates: any) => {
    const updatedStatsJson = { ...currentStatsJson, ...newUpdates };
    const { error } = await supabase.from('user_stats').update({ stats_json: updatedStatsJson }).eq('user_id', userId);
    if (error) alert("❌ Lỗi cập nhật: " + error.message);
    else setStats(stats.map(s => s.user_id === userId ? { ...s, stats_json: updatedStatsJson } : s));
  };

  const handleGrantPet = async (userRow: any, petId: string) => {
    if (!petId) return;
    const currentStatsJson = userRow.stats_json || {};
    const currentPets = currentStatsJson.ownedPets || [];
    await handleUpdate(userRow.user_id, currentStatsJson, { ownedPets: [...currentPets, petId] });
  };

  // TÍNH NĂNG 1: SOI TASK
  const handleViewTasks = async (userId: string) => {
    setViewingUserId(userId);
    setLoadingTasks(true);
    const { data, error } = await supabase.from('tasks').select('*').eq('user_id', userId).order('createdAt', { ascending: false }).limit(50);
    if (!error) setSelectedUserTasks(data || []);
    else setSelectedUserTasks([]);
    setLoadingTasks(false);
  };

  // TÍNH NĂNG 2: RADAR THỐNG KÊ (Tính toán tự động)
  const totalUsers = stats.length;
  const totalCoins = stats.reduce((acc, curr) => acc + (curr.stats_json?.coins || 0), 0);
  const totalPets = stats.reduce((acc, curr) => acc + (curr.stats_json?.ownedPets?.length || 0), 0);

  const filteredStats = stats.filter(s => s.user_id?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="p-10 text-center font-bold text-slate-500 animate-pulse">ĐANG KHỞI ĐỘNG TRẠM CHỈ HUY...</div>;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen pb-32">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-rose-500 rounded-2xl shadow-lg shadow-rose-200"><ShieldAlert className="w-6 h-6 text-white" /></div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Trung Tâm Chỉ Huy</h1>
          </div>
          <p className="text-slate-500 font-medium">Bảo mật cấp độ cao nhất. Cẩn thận với mọi thao tác.</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* RADAR THỐNG KÊ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <GlassCard className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none shadow-lg shadow-indigo-200">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm"><Users className="w-8 h-8"/></div>
                 <div><p className="text-blue-100 font-bold uppercase text-xs tracking-wider">Tổng Quân Sư</p><h3 className="text-4xl font-black">{totalUsers}</h3></div>
              </div>
           </GlassCard>
           <GlassCard className="p-6 bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-none shadow-lg shadow-orange-200">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm"><Coins className="w-8 h-8"/></div>
                 <div><p className="text-yellow-100 font-bold uppercase text-xs tracking-wider">Xu Lưu Hành</p><h3 className="text-4xl font-black">{totalCoins.toLocaleString()}</h3></div>
              </div>
           </GlassCard>
           <GlassCard className="p-6 bg-gradient-to-br from-emerald-400 to-teal-500 text-white border-none shadow-lg shadow-teal-200">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm"><Package className="w-8 h-8"/></div>
                 <div><p className="text-emerald-100 font-bold uppercase text-xs tracking-wider">Linh Thú Bắt Được</p><h3 className="text-4xl font-black">{totalPets.toLocaleString()}</h3></div>
              </div>
           </GlassCard>
        </div>

        {/* BỘ LỌC TÌM KIẾM */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" placeholder="Tìm quân sư theo email..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl shadow-sm outline-none font-black text-slate-700 focus:border-indigo-500 transition-all text-lg"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* DANH SÁCH USER (CÓ TÍCH HỢP NÚT SOI TASK) */}
        <div className="space-y-4">
          {filteredStats.map((s) => {
            const userStatsJson = s.stats_json || {};
            return (
              <div key={s.user_id}>
                <GlassCard className="p-4 md:p-6 border-white shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all">
                  <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center">
                    
                    <div className="flex items-center justify-between w-full xl:w-auto gap-4 min-w-[250px]">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white font-black shadow-inner shrink-0">
                          {s.user_id?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="font-black text-slate-800 truncate text-sm" title={s.user_id}>{s.user_id}</h3>
                          <div className="flex gap-2 mt-1">
                            {s.role === 'admin' && <span className="bg-rose-100 text-rose-600 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">Admin</span>}
                            <span className="bg-slate-100 text-slate-500 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">Lv: {userStatsJson.rank || 'Tân binh'}</span>
                          </div>
                        </div>
                      </div>
                      {/* NÚT SOI TASK MOBILE */}
                      <button onClick={() => handleViewTasks(s.user_id)} className="xl:hidden p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 shadow-sm active:scale-95">
                        <ListTodo className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 flex-1 w-full text-center">
                      <div className="bg-slate-50 p-2 md:p-3 rounded-xl border border-slate-100 focus-within:ring-2 ring-yellow-400 transition-all">
                        <label className="text-[9px] md:text-[10px] font-black text-yellow-600 uppercase flex items-center justify-center gap-1 mb-1"><Coins className="w-3 h-3"/> Coins</label>
                        <input type="number" className="w-full bg-transparent font-black text-slate-800 text-center outline-none" defaultValue={userStatsJson.coins || 0} onBlur={(e) => handleUpdate(s.user_id, userStatsJson, { coins: Number(e.target.value) })} />
                      </div>
                      <div className="bg-slate-50 p-2 md:p-3 rounded-xl border border-slate-100 focus-within:ring-2 ring-blue-400 transition-all">
                        <label className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase flex items-center justify-center gap-1 mb-1"><Trophy className="w-3 h-3"/> LP</label>
                        <input type="number" className="w-full bg-transparent font-black text-slate-800 text-center outline-none" defaultValue={userStatsJson.lp || 0} onBlur={(e) => handleUpdate(s.user_id, userStatsJson, { lp: Number(e.target.value) })} />
                      </div>
                      <div className="bg-slate-50 p-2 md:p-3 rounded-xl border border-slate-100 focus-within:ring-2 ring-orange-400 transition-all">
                        <label className="text-[9px] md:text-[10px] font-black text-orange-600 uppercase flex items-center justify-center gap-1 mb-1"><Flame className="w-3 h-3"/> Streak</label>
                        <input type="number" className="w-full bg-transparent font-black text-slate-800 text-center outline-none" defaultValue={userStatsJson.streak || 0} onBlur={(e) => handleUpdate(s.user_id, userStatsJson, { streak: Number(e.target.value) })} />
                      </div>
                    </div>

                    <div className="flex gap-3 w-full xl:w-auto">
                      <div className="flex-1 xl:w-48">
                        <select className="w-full p-3 bg-slate-800 text-white text-[11px] font-black rounded-xl outline-none cursor-pointer hover:bg-slate-700 transition-all shadow-md" onChange={(e) => handleGrantPet(s, e.target.value)} value="">
                            <option value="" disabled>+ TẶNG PET ({userStatsJson.ownedPets?.length || 0})</option>
                            {AVAILABLE_PETS.map(p => <option key={p} value={p} className="text-slate-800 bg-white">{p.toUpperCase()}</option>)}
                        </select>
                      </div>
                      
                      {/* NÚT SOI TASK PC */}
                      <button 
                        onClick={() => handleViewTasks(s.user_id)}
                        className="hidden xl:flex items-center gap-2 px-5 py-3 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 hover:shadow-md font-black text-[11px] uppercase rounded-xl transition-all active:scale-95"
                      >
                        <ListTodo className="w-4 h-4" /> Soi Task
                      </button>
                    </div>

                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL MÀN HÌNH RADAR - SOI TASK */}
      <AnimatePresence>
        {viewingUserId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-100"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
                <div>
                  <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <BarChart3 className="text-indigo-500 w-5 h-5"/> Giám sát tiến độ
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">{viewingUserId}</p>
                </div>
                <button onClick={() => setViewingUserId(null)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
                {loadingTasks ? (
                  <div className="text-center py-10 text-slate-500 font-bold animate-pulse">Đang quét dữ liệu radar...</div>
                ) : selectedUserTasks?.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 italic">Quân sư này đang lười biếng, chưa tạo công việc nào!</div>
                ) : (
                  <div className="space-y-3">
                    {selectedUserTasks?.map(task => (
                      <div key={task.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-indigo-200 transition-colors">
                        {task.progress === 100 ? (
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0"><Clock className="w-5 h-5 text-orange-600" /></div>
                        )}
                        <div className="flex-1 overflow-hidden">
                          <h4 className={`font-bold text-sm truncate ${task.progress === 100 ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                            {task.titleKey}
                          </h4>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{task.category || 'Không phân loại'}</span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${task.priority === 'High' ? 'bg-rose-100 text-rose-600' : task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}`}>
                              {task.priority || 'Normal'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}