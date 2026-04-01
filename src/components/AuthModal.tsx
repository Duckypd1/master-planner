import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, Loader2, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';

export function AuthModal() {
  const { login } = useTaskStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [imgError, setImgError] = useState(false);

  let monkeyState = 'idle';
  if (showPassword) monkeyState = 'peek';
  else if (isPasswordFocused) monkeyState = 'cover';

  const monkeys = {
    idle: { url: "https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Animals/Monkey%20Face.png", emoji: "🐵" },
    cover: { url: "https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Animals/See-No-Evil%20Monkey.png", emoji: "🙈" },
    peek: { url: "https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Animals/Speak-No-Evil%20Monkey.png", emoji: "🙊" }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        login(data.user?.user_metadata?.full_name || "Người dùng", email);
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (error) throw error;
        login(name || "Người dùng", email);
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi trong quá trình xác thực.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        // =======================================================
        // ĐÃ ÁP DỤNG CÔNG THỨC MOBILE PIXEL-PERFECT
        // =======================================================
        className="relative w-[92vw] max-w-[360px] md:max-w-md max-h-[85vh] overflow-y-auto hide-scrollbar bg-white/95 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-2xl p-6 md:p-8"
      >
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center shadow-inner relative overflow-hidden border-4 border-white">
            {Object.entries(monkeys).map(([key, data]) => {
              const isActive = monkeyState === key;
              return (
                <motion.div key={key} initial={false} animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1.1 : 0.8, y: isActive ? 0 : 20, zIndex: isActive ? 10 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="absolute inset-0 flex items-center justify-center">
                  {imgError ? <span className="text-[40px] leading-none drop-shadow-md">{data.emoji}</span> : <img src={data.url} alt={`Khỉ ${key}`} className="w-14 h-14 object-contain drop-shadow-xl" onError={() => setImgError(true)} />}
                </motion.div>
              );
            })}
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">{isLogin ? "Chào mừng trở lại!" : "Tạo tài khoản"}</h2>
        </div>

        {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600 shadow-sm text-sm"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}</motion.div>}

        <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
          {!isLogin && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên hiển thị" onFocus={() => setIsPasswordFocused(false)} className="w-full pl-10 pr-4 py-3 text-sm bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </motion.div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email của bạn" onFocus={() => setIsPasswordFocused(false)} className="w-full pl-10 pr-4 py-3 text-sm bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu" onFocus={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)} className="w-full pl-10 pr-10 py-3 text-sm bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" minLength={6} />
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 mt-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 text-sm group">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{isLogin ? 'Đăng nhập' : 'Đăng ký ngay'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1" /></>}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button type="button" onClick={() => { setIsLogin(!isLogin); setEmail(''); setPassword(''); setName(''); setError(null); setIsPasswordFocused(false); setShowPassword(false); }} className="text-xs text-slate-500 hover:text-indigo-600 font-semibold">
            {isLogin ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}