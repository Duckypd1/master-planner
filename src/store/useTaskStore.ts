import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export const RANK_LP_REQ: Record<string, number> = {
  'Đồng': 1000, 'Bạc': 3000, 'Vàng': 10000, 'Bạch Kim': 25000, 'Kim Cương': 50000, 'Cao Thủ': 100000, 'Thách Đấu': 9999999
};

export interface Task {
  id: string; titleKey: string; description?: string; type: 'fixed' | 'flexible';
  time: string; isRecurring?: boolean; category: string; progress: number;
  priority: 'High' | 'Medium' | 'Low'; dueDate?: Date | string;
  completedAt?: Date | string; createdAt?: Date | string; eisenhowerQuadrant?: string;
}

export interface UserStats {
  lp: number; rank: string; tier: number; promotionStatus: 'none' | 'active' | 'success';
  coins: number; unlockedThemes: string[]; unlockedSounds: string[];
  inventory: Record<string, number>; streak: number; lastCheckIn: string | null;
  equippedPet: { id: string; skin: string } | null; 
  ownedPets: string[]; ownedSkins: string[]; mythicCount: number; epicCount: number;
  activeEffects: { x2ExpUntil?: number; streakShieldActive?: boolean; };
  role?: string; 
}

interface TaskState {
  user: { name: string; email: string; id?: string } | null;
  login: (name: string, email: string) => void;
  logout: () => void;
  tasks: Task[];
  settings: any;
  userStats: UserStats;
  floatingTexts: { id: string; text: string; x: number; y: number }[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  initializeSupabaseSync: (userId: string) => Promise<void>;
  dailyCheckIn: () => Promise<{ success: boolean; message: string; reward?: number }>;
  toggleTaskCompletion: (id: string, x?: number, y?: number) => void;
  openMysteryBox: () => { type: string; id: string; rarity?: string } | null;
  mergePets: (consumedPetIds: string[]) => { success: boolean; message: string; newPetId?: string };
  equipPet: (petId: string, skinId: string) => void;
  updateUserStats: (updates: Partial<UserStats>) => void;
  forceCheckRank: () => void; 
  
  buyItem: (itemId: string, cost: number, type: string) => boolean; 
  importData: (data: any) => void; 
  clearAllData: () => void; 
  dismissPromotion: () => void; 
  useItem: (itemId: string) => void; 
  useTimeBuffer: (taskId: string) => void; 
  removeFloatingText: (id: string) => void; 
  resetInventory: () => void; 
  updateSettings: (updates: any) => void;
}

const INITIAL_USER_STATS: UserStats = {
  lp: 0, rank: 'Đồng', tier: 4, promotionStatus: 'none', coins: 500,
  unlockedThemes: [], unlockedSounds: [], inventory: {}, streak: 0,
  lastCheckIn: null, equippedPet: { id: 'ducky', skin: 'default' },
  ownedPets: ['ducky'], ownedSkins: [], mythicCount: 0, epicCount: 0, activeEffects: {},
  role: 'user', 
};

const PET_TIERS = {
  common: ['dog', 'cat', 'rooster', 'rabbit', 'ducky'],
  rare: ['wolf', 'fox', 'bear', 'tiger', 'penguin', 'polar_bear'],
  epic: ['unicorn', 'reindeer', 'lion'],
  mythic: ['phoenix', 'dragon', 'ninetails']
};

const getPetRarity = (petId: string) => {
  if (PET_TIERS.common.includes(petId)) return 'common';
  if (PET_TIERS.rare.includes(petId)) return 'rare';
  if (PET_TIERS.epic.includes(petId)) return 'epic';
  if (PET_TIERS.mythic.includes(petId)) return 'mythic';
  return 'common';
};

const getNextRarity = (rarity: string) => {
  if (rarity === 'common') return 'rare';
  if (rarity === 'rare') return 'epic';
  if (rarity === 'epic') return 'mythic';
  return null;
};

const rollRankUpPet = () => {
  const roll = Math.random() * 100;
  let type = 'common';
  let pool = PET_TIERS.common;
  if (roll < 0.1) { type = 'mythic'; pool = PET_TIERS.mythic; }
  else if (roll < 5.1) { type = 'epic'; pool = PET_TIERS.epic; }
  else if (roll < 25.1) { type = 'rare'; pool = PET_TIERS.rare; }
  return { id: pool[Math.floor(Math.random() * pool.length)], rarity: type };
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      user: null, login: (name, email) => set({ user: { name, email, id: email } }), logout: () => set({ user: null }),
      tasks: [], settings: { soundEnabled: true, activeTheme: 'default', activeSound: 'default', pomodoroWork: 25, pomodoroBreak: 5, categories: [], telegramWebhook: '', telegramToken: '' },
      userStats: INITIAL_USER_STATS, floatingTexts: [],

      _syncTask: async (task: any) => { const uId = get().user?.id; if (uId) await supabase.from('tasks').upsert({ ...task, user_id: uId }); },
      _syncStats: async () => { const uId = get().user?.id; if (uId) await supabase.from('user_stats').upsert({ user_id: uId, stats_json: get().userStats }); },

      // 👇 ĐÃ FIX: THUẬT TOÁN SMART MERGE CHỐNG MẤT DỮ LIỆU KHI F5
      initializeSupabaseSync: async (userId) => {
        if (!userId) return;
        const { data: tData } = await supabase.from('tasks').select('*').eq('user_id', userId);
        const { data: sData } = await supabase.from('user_stats').select('*').eq('user_id', userId).single();
        const { data: setData } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
        
        const localTasks = get().tasks;

        if (tData && tData.length > 0) {
          if (localTasks.length === 0) {
            set({ tasks: tData });
          } else {
            // Chống đè dữ liệu: Giữ nguyên Local làm gốc, chỉ thêm vào các task từ mây nếu Local thiếu
            const mergedTasks = [...localTasks];
            let needsCloudUpdate = false;

            tData.forEach(cloudTask => {
              const localIndex = mergedTasks.findIndex(t => t.id === cloudTask.id);
              if (localIndex === -1) {
                mergedTasks.push(cloudTask);
              } else {
                // Nếu Cloud đang lưu là 0% nhưng dưới máy tính đã là 100%, 
                // Không được đè bản Cloud xuống, mà phải đánh dấu để đẩy bản Local lên lại!
                if (mergedTasks[localIndex].progress !== cloudTask.progress || mergedTasks[localIndex].completedAt !== cloudTask.completedAt) {
                  needsCloudUpdate = true;
                }
              }
            });

            set({ tasks: mergedTasks });

            // Ép Mây phải cập nhật lại theo máy tính nếu phát hiện Mây bị "trễ"
            if (needsCloudUpdate) {
              const tasksToSync = mergedTasks.map(t => ({ ...t, user_id: userId }));
              supabase.from('tasks').upsert(tasksToSync).then();
            }
          }
        } else if (localTasks.length > 0) {
          const tasksWithUserId = localTasks.map(t => ({ ...t, user_id: userId }));
          await supabase.from('tasks').upsert(tasksWithUserId);
        }

        if (sData) {
          set((state) => ({ userStats: { ...state.userStats, ...(sData.stats_json || {}), role: sData.role || 'user' } }));
        } else {
          await (get() as any)._syncStats();
        }

        if (setData?.settings_json) {
          set({ settings: { ...get().settings, ...setData.settings_json } });
        }
      },

      forceCheckRank: () => {
        let hasRankedUp = false;
        let earnedPets: string[] = [];
        
        set((state) => {
          let ns = { ...state.userStats };
          let req = RANK_LP_REQ[ns.rank] || 1000;
          
          while (ns.lp >= req && ns.rank !== 'Thách Đấu') {
             ns.lp -= req;
             ns.promotionStatus = 'success';
             hasRankedUp = true;
             
             const rewardPet = rollRankUpPet();
             ns.ownedPets = [...ns.ownedPets, rewardPet.id];
             if (rewardPet.rarity === 'mythic') ns.mythicCount = (ns.mythicCount || 0) + 1;
             if (rewardPet.rarity === 'epic') ns.epicCount = (ns.epicCount || 0) + 1;
             earnedPets.push(rewardPet.id);

             if (ns.tier > 1) {
               ns.tier -= 1;
             } else {
               const ranks = ['Đồng', 'Bạc', 'Vàng', 'Bạch Kim', 'Kim Cương', 'Cao Thủ', 'Thách Đấu'];
               const idx = ranks.indexOf(ns.rank);
               if (idx < ranks.length - 1) {
                 ns.rank = ranks[idx + 1];
                 ns.tier = 4;
               } else {
                 ns.lp = req; break; 
               }
             }
             req = RANK_LP_REQ[ns.rank] || 1000;
          }
          return hasRankedUp ? { userStats: ns } : state;
        });
        
        if (hasRankedUp) {
          (get() as any)._syncStats();
          setTimeout(() => alert(`🎉 CHÚC MỪNG THĂNG CẤP!\nThưởng: ${earnedPets.map(p => p.toUpperCase()).join(', ')}`), 300);
        }
      },

      dailyCheckIn: async () => {
        const { data: serverDate } = await supabase.rpc('get_server_date');
        const today = serverDate || new Date().toISOString().split('T')[0];
        const state = get();
        if (state.userStats.lastCheckIn === today) return { success: false, message: "Hôm nay bạn đã điểm danh rồi! 😉" };
        
        const yesterdayDate = new Date(); yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];
        const newStreak = state.userStats.lastCheckIn === yesterday ? state.userStats.streak + 1 : 1;
        const rewardCoins = 500 + (newStreak % 10 === 0 ? 1000 : 0);
        
        set({ userStats: { ...state.userStats, coins: state.userStats.coins + rewardCoins, streak: newStreak, lastCheckIn: today, lp: state.userStats.lp + 50 } });
        await (get() as any)._syncStats();
        get().forceCheckRank(); 
        return { success: true, message: `Điểm danh thành công! +${rewardCoins} xu.` };
      },

      toggleTaskCompletion: (id, x, y) => {
        let syncedTask: Task | null = null;
        set((state) => {
          const task = state.tasks.find(t => t.id === id);
          if (!task) return state;
          const newProgress = task.progress === 100 ? 0 : 100;
          let ns = { ...state.userStats };
          let ftText = '';

          if (newProgress === 100) {
            let baseLp = task.priority === 'High' ? 50 : task.priority === 'Medium' ? 25 : 10;
            let finalLp = Math.round(baseLp * (1 + (ns.streak || 0) * 0.05));
            let finalCoins = Math.round((baseLp + 50) + (ns.streak || 0) * 5);
            ns.lp += finalLp;
            ns.coins += finalCoins;
            ftText = `+${finalLp} LP / +${finalCoins} 🪙`;
          }
          
          syncedTask = { ...task, progress: newProgress };
          
          return { 
            tasks: state.tasks.map(t => t.id === id ? syncedTask! : t), 
            userStats: ns,
            floatingTexts: ftText && x !== undefined ? [...state.floatingTexts, { id: Math.random().toString(), text: ftText, x, y: y! }] : state.floatingTexts 
          };
        });
        
        if (syncedTask) (get() as any)._syncTask(syncedTask); 
        (get() as any)._syncStats();
        get().forceCheckRank(); 
      },

      openMysteryBox: () => { return null; },

      mergePets: (consumedPetIds) => {
        const state = get();
        let currentOwned = [...state.userStats.ownedPets];
        
        if (consumedPetIds.length !== 5) return { success: false, message: "❌ Báo lỗi: Cần nạp đủ 5 phôi!" };

        const firstPetRarity = getPetRarity(consumedPetIds[0]);

        for (const pId of consumedPetIds) {
          if (getPetRarity(pId) !== firstPetRarity) return { success: false, message: "❌ Lò luyện yêu cầu 5 linh thú phải CÙNG CẤP ĐỘ!" };
        }

        const nextRarity = getNextRarity(firstPetRarity);
        if (!nextRarity) return { success: false, message: "❌ Linh thú Huyền Thoại đã đạt cảnh giới tối cao, không thể luyện hóa thêm!" };

        for (const pId of consumedPetIds) {
          const idx = currentOwned.indexOf(pId);
          if (idx > -1) currentOwned.splice(idx, 1);
          else return { success: false, message: "❌ Lỗi: Phôi thú không tồn tại trong kho!" };
        }

        let successRate = firstPetRarity === 'common' ? 0.50 : firstPetRarity === 'rare' ? 0.30 : 0.10; 
        const isSuccess = Math.random() < successRate;
        let resId = '';

        if (isSuccess) {
          const pool = PET_TIERS[nextRarity as keyof typeof PET_TIERS];
          resId = pool[Math.floor(Math.random() * pool.length)];
        } else {
          const pool = PET_TIERS[firstPetRarity as keyof typeof PET_TIERS];
          resId = pool[Math.floor(Math.random() * pool.length)];
        }

        currentOwned.push(resId);
        set((s) => ({ userStats: { ...s.userStats, ownedPets: currentOwned } }));
        (get() as any)._syncStats();

        if (isSuccess) return { success: true, message: `🔥 ĐỘT PHÁ THÀNH CÔNG! Chúc mừng bạn nhận được ${resId.toUpperCase()}!`, newPetId: resId };
        else return { success: true, message: `💥 THẤT BẠI! Lò nổ, nhận an ủi 1 ${resId.toUpperCase()} (Cùng cấp).`, newPetId: resId };
      },

      addTask: (task) => { const newTask = { ...task, createdAt: new Date() }; set((s) => ({ tasks: [...s.tasks, newTask] })); (get() as any)._syncTask(newTask); },
      
      updateTask: (id, updates) => { 
        let updatedTask: Task | null = null;
        set((s) => ({ 
          tasks: s.tasks.map(t => {
            if (t.id === id) {
              updatedTask = { ...t, ...updates };
              return updatedTask;
            }
            return t;
          }) 
        })); 
        if (updatedTask) (get() as any)._syncTask(updatedTask);
      },
      
      deleteTask: async (id) => { set((s) => ({ tasks: s.tasks.filter(t => t.id !== id) })); const uId = get().user?.id; if (uId) await supabase.from('tasks').delete().eq('id', id).eq('user_id', uId); },
      equipPet: (p, s) => { set(state => ({ userStats: { ...state.userStats, equippedPet: { id: p, skin: s } } })); (get() as any)._syncStats(); },
      updateUserStats: (updates) => { set(s => ({ userStats: { ...s.userStats, ...updates } })); (get() as any)._syncStats(); },
      
      buyItem: (i, c, t) => false, 
      importData: (data) => { 
        if (data.tasks) set({ tasks: data.tasks });
        if (data.settings) set({ settings: { ...get().settings, ...data.settings } });
      }, 
      clearAllData: () => {
        set({ tasks: [], userStats: INITIAL_USER_STATS, settings: { soundEnabled: true, activeTheme: 'default', activeSound: 'default', pomodoroWork: 25, pomodoroBreak: 5, categories: [], telegramWebhook: '', telegramToken: '' } });
        (get() as any)._syncStats();
      }, 
      dismissPromotion: () => {}, 
      useItem: (i) => {}, 
      useTimeBuffer: (t) => {}, 
      removeFloatingText: (i) => set((s) => ({ floatingTexts: s.floatingTexts.filter(f => f.id !== i) })), 
      resetInventory: () => {}, 
      updateSettings: (u) => set((s) => ({ settings: { ...s.settings, ...u } }))
    }),
    { name: 'master-planner-v2', merge: (persistedState: any, currentState) => { if (!persistedState) return currentState; return { ...currentState, ...persistedState, userStats: { ...currentState.userStats, ...persistedState.userStats } }; } }
  )
);