import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Sparkles, Box, Trophy, Coins, Zap } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { cn } from '../lib/utils';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ITEM_DATABASE: Record<string, { name: string; rarityName: string; color: string; bg: string }> = {
  'miss': { name: 'Gió thoảng mây bay', rarityName: 'Hụt', color: 'text-slate-500', bg: 'bg-slate-100' },
  'dog': { name: 'Chó Cỏ', rarityName: 'Thường', color: 'text-slate-600', bg: 'bg-slate-100' },
  'cat': { name: 'Mèo Mướp', rarityName: 'Thường', color: 'text-slate-600', bg: 'bg-slate-100' },
  'rooster': { name: 'Gà Trống', rarityName: 'Thường', color: 'text-slate-600', bg: 'bg-slate-100' },
  'rabbit': { name: 'Thỏ Trắng', rarityName: 'Thường', color: 'text-slate-600', bg: 'bg-slate-100' },
  'ducky': { name: 'Vịt Bầu', rarityName: 'Thường', color: 'text-slate-600', bg: 'bg-slate-100' },
  'wolf': { name: 'Sói Xám', rarityName: 'Hiếm', color: 'text-blue-600', bg: 'bg-blue-100' },
  'fox': { name: 'Cáo Đỏ', rarityName: 'Hiếm', color: 'text-blue-600', bg: 'bg-blue-100' },
  'bear': { name: 'Gấu Nâu', rarityName: 'Hiếm', color: 'text-blue-600', bg: 'bg-blue-100' },
  'tiger': { name: 'Hổ Vằn', rarityName: 'Hiếm', color: 'text-blue-600', bg: 'bg-blue-100' },
  'penguin': { name: 'Chim Cánh Cụt', rarityName: 'Hiếm', color: 'text-blue-600', bg: 'bg-blue-100' },
  'polar_bear': { name: 'Gấu Bắc Cực', rarityName: 'Hiếm', color: 'text-blue-600', bg: 'bg-blue-100' },
  'unicorn': { name: 'Kỳ Lân', rarityName: 'Sử thi', color: 'text-purple-600', bg: 'bg-purple-100' },
  'reindeer': { name: 'Tuần Lộc Tuyết', rarityName: 'Sử thi', color: 'text-purple-600', bg: 'bg-purple-100' },
  'lion': { name: 'Sư Tử Vàng', rarityName: 'Sử thi', color: 'text-purple-600', bg: 'bg-purple-100' },
  'phoenix': { name: 'Phượng Hoàng', rarityName: 'Huyền thoại', color: 'text-amber-500', bg: 'bg-amber-100' },
  'dragon': { name: 'Thần Long', rarityName: 'Huyền thoại', color: 'text-amber-500', bg: 'bg-amber-100' },
  'ninetails': { name: 'Cửu Vĩ Hồ', rarityName: 'Huyền thoại', color: 'text-amber-500', bg: 'bg-amber-100' }
};

interface GachaResultType {
  id: string;
  name: string;
  rarityName: string;
  color: string;
  bg: string;
  isMiss: boolean;
}

export function ShopModal({ isOpen, onClose }: ShopModalProps) {
  const { userStats, openMysteryBox, equipPet, mergePets } = useTaskStore();
  
  // 👇 ĐÃ KHÔI PHỤC: TAB GACHA VÀ INVENTORY
  const [activeTab, setActiveTab] = useState<'gacha' | 'inventory'>('gacha'); 
  const [gachaResult, setGachaResult] = useState<GachaResultType | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const GACHA_COST = 100;
  
  const [isAlchemyMode, setIsAlchemyMode] = useState(false);
  const [alchemySelection, setAlchemySelection] = useState<string[]>([]);

  // 👇 ĐÃ CHỐT BẢN VÁ: BỘ LỌC CHỐNG LỖI RÁC DỮ LIỆU TRONG KHO
  const uniquePets = useMemo(() => {
    const rawPets = userStats.ownedPets || [];
    const validPets = rawPets.filter(petId => {
      return petId && petId.trim() !== '' && petId !== 'miss' && ITEM_DATABASE[petId];
    });

    const counts = validPets.reduce((acc, petId) => {
      acc[petId] = (acc[petId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts);
  }, [userStats.ownedPets]);

  const totalPets = uniquePets.reduce((sum, [, count]) => sum + count, 0);
  const equippedPetId = userStats.equippedPet?.id || 'ducky';

  const handleClose = () => {
    setIsAlchemyMode(false);
    setAlchemySelection([]);
    onClose();
  };

  if (!isOpen) return null;

  // 👇 ĐÃ KHÔI PHỤC: TÍNH NĂNG TRIỆU HỒI
  const rollGacha = () => {
    if (userStats.coins < GACHA_COST) {
        alert(`⚠️ Không đủ Xu! Bạn cần ${GACHA_COST} 🪙 để kích hoạt Vòng Quay.`);
        return;
    }
    setIsRolling(true); 
    setGachaResult(null);
    
    const result = openMysteryBox() as any; 
    
    setTimeout(() => {
      if (result && typeof result === 'object' && result.id) {
        const resultId = String(result.id);
        const isMiss = result.type === 'miss'; 
        const itemInfo = ITEM_DATABASE[resultId] || { name: 'Lỗi', rarityName: 'Lỗi', color: 'text-slate-500', bg: 'bg-slate-100' };
        
        setGachaResult({ 
          id: resultId, 
          name: itemInfo.name, 
          rarityName: itemInfo.rarityName, 
          color: itemInfo.color, 
          bg: itemInfo.bg, 
          isMiss: isMiss 
        });
      }
      setIsRolling(false);
    }, 1500);
  };

  const handleEquipPet = (petId: string) => {
    equipPet(petId, 'default');
    alert(`✅ Đã chọn ${ITEM_DATABASE[petId]?.name || 'Thú cưng'} làm trợ lý!`);
    window.dispatchEvent(new Event('petChanged'));
  };

  const handleSelectForAlchemy = (petId: string, ownedCount: number) => {
    const currentlySelected = alchemySelection.filter(id => id === petId).length;
    const isEquipped = equippedPetId === petId;
    const safeOwnedCount = isEquipped ? ownedCount - 1 : ownedCount;

    if (currentlySelected < safeOwnedCount && alchemySelection.length < 5) {
      setAlchemySelection([...alchemySelection, petId]);
    } else if (alchemySelection.length >= 5) {
      alert("Đã đầy lò! Hãy nhấn LUYỆN HÓA.");
    }
  };

  const handleRemoveFromAlchemy = (petId: string) => {
    const idx = alchemySelection.indexOf(petId);
    if (idx > -1) {
      const newArr = [...alchemySelection];
      newArr.splice(idx, 1);
      setAlchemySelection(newArr);
    }
  };

  const handleExecuteAlchemy = () => {
    if (alchemySelection.length !== 5) return;
    if (window.confirm("🔥 LÒ BÁT QUÁI: 5 linh thú bạn chọn sẽ BỊ ĐỐT VĨNH VIỄN để tạo ra một sinh mệnh mới. Bạn có chắc chắn?")) {
      const result = mergePets(alchemySelection);
      alert(result.message);
      if (result.success) {
        setAlchemySelection([]); 
        setIsAlchemyMode(false);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} 
          className="bg-white/95 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-2xl w-[92vw] max-w-[360px] md:max-w-5xl max-h-[85vh] md:h-[85vh] flex flex-col overflow-hidden relative border-slate-100"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200 shrink-0 bg-white/50 sticky top-0 z-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg"><ShoppingBag className="w-5 h-5 text-white" /></div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Cửa hàng</h2>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mt-0.5">Số dư: <span className="text-yellow-600 font-bold flex items-center gap-1">{userStats.coins} 🪙</span></div>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
          </div>

          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* 👇 ĐÃ KHÔI PHỤC MENU CHUYỂN TAB BÊN TRÁI */}
            <div className="w-full md:w-56 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-4 shrink-0 overflow-x-auto md:overflow-y-auto hide-scrollbar">
              <div className="flex md:flex-col gap-2 min-w-max md:min-w-0">
                <button onClick={() => { setActiveTab('gacha'); setIsAlchemyMode(false); }} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left relative", activeTab === 'gacha' ? "bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-100")}><Sparkles className="w-5 h-5" /> Triệu Hồi Thú</button>
                <button onClick={() => setActiveTab('inventory')} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left", activeTab === 'inventory' ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-600 hover:bg-slate-100")}><Box className="w-5 h-5" /> Kho Của Bạn</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/30 flex flex-col lg:flex-row gap-8 hide-scrollbar">
              
              {/* 👇 ĐÃ KHÔI PHỤC TAB TRIỆU HỒI */}
              {activeTab === 'gacha' && (
                <>
                  <div className="flex-1 text-center relative lg:border-r border-slate-200 lg:pr-8 flex flex-col">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-fuchsia-400 to-pink-500 rounded-full flex items-center justify-center shadow-xl mb-6 animate-pulse shadow-fuchsia-500/20"><Sparkles className="w-12 h-12 text-white" /></div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">Vòng Quay</h3>
                    <p className="text-slate-600 mb-8 max-w-sm mx-auto text-sm hidden md:block">Thử vận may để nhận linh thú đồng hành mới!</p>
                    <div className="bg-white rounded-[24px] border border-slate-200 p-8 flex flex-col items-center justify-center min-h-[220px] mb-6 relative overflow-hidden shadow-sm mx-auto w-full max-w-md">
                      {isRolling ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-24 h-24 rounded-full border-4 border-slate-200 border-t-fuchsia-500 shadow-[0_0_30px_rgba(217,70,239,0.2)]" />
                      ) : gachaResult ? (
                        gachaResult.isMiss ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                            <span className="text-[70px] drop-shadow-md">💨</span>
                            <h3 className="text-xl font-black text-slate-700 mt-2">{gachaResult.name}</h3><p className="text-slate-500 text-sm mt-1">Trượt mất rồi! Chúc bạn may mắn lần sau.</p>
                          </motion.div>
                        ) : (
                          <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="text-center flex flex-col items-center w-full">
                            <div className={cn("w-full absolute inset-0 opacity-20", gachaResult.bg)} />
                            <img src={`/assets/pets/${gachaResult.id}.png`} alt={gachaResult.name} className="w-32 h-32 object-contain drop-shadow-2xl relative z-10 animate-bounce" onError={(e) => { e.currentTarget.src = "/assets/pets/ducky.png" }} />
                            <div className="relative z-10 mt-4"><span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded-full border bg-white mb-2 inline-block shadow-sm", gachaResult.color)}>{gachaResult.rarityName}</span><h3 className={cn("text-2xl md:text-3xl font-black", gachaResult.color)}>{gachaResult.name}</h3></div>
                          </motion.div>
                        )
                      ) : (
                        <div className="text-center opacity-50"><div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl font-black text-slate-300">?</div><p className="text-sm font-semibold text-slate-500">Đang chờ đợi...</p></div>
                      )}
                    </div>
                    <div className="mt-auto max-w-md mx-auto w-full">
                       <div className="flex items-center justify-between mb-4 px-2"><div className="flex items-center gap-1.5"><Coins className="w-5 h-5 text-yellow-500" /><span className="font-bold text-slate-700">{userStats.coins || 0}</span></div><div className="text-sm font-bold text-fuchsia-600 bg-fuchsia-50 px-2 py-0.5 rounded-md flex items-center gap-1">- {GACHA_COST} Xu / Lần</div></div>
                       <div className="flex gap-3">
                        {gachaResult && !gachaResult.isMiss ? (
                          <><button onClick={() => setGachaResult(null)} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors text-sm">Quay tiếp</button><button onClick={() => handleEquipPet(gachaResult.id)} className="flex-1 py-4 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 text-sm">Trang bị</button></>
                        ) : (
                          <button onClick={rollGacha} disabled={isRolling || (userStats.coins || 0) < GACHA_COST} className="w-full py-4 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 disabled:from-slate-300 disabled:to-slate-400 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-base"><Sparkles className="w-5 h-5" />{isRolling ? 'ĐANG QUAY...' : `TRIỆU HỒI (${GACHA_COST})`}</button>
                        )}
                       </div>
                    </div>
                  </div>
                  
                  <div className="w-full lg:w-80 shrink-0 mt-8 lg:mt-0">
                     <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-4"><Trophy className="w-5 h-5 text-amber-500"/> Tỷ lệ Triệu Hồi</h4>
                     <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2 hide-scrollbar">
                        <div className="flex items-start gap-4 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                          <div className="text-3xl drop-shadow-sm mt-1">💨</div>
                          <div className="flex-1">
                            <div className="font-bold text-slate-600 text-[15px]">Hụt (20%)</div>
                            <p className="text-[11px] text-slate-400 mt-0.5">Không ra linh thú</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                          <img src="/assets/pets/dog.png" alt="Thường" className="w-10 h-10 object-contain mt-1" onError={(e) => { e.currentTarget.src = "/assets/pets/ducky.png" }}/>
                          <div className="flex-1">
                            <div className="font-bold text-slate-800 text-[15px]">Thường (55%)</div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">Chó, Mèo, Gà, Thỏ, Vịt</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 bg-blue-50/50 border border-blue-200 p-3 rounded-xl">
                          <img src="/assets/pets/wolf.png" alt="Hiếm" className="w-10 h-10 object-contain mt-1" onError={(e) => { e.currentTarget.src = "/assets/pets/ducky.png" }}/>
                          <div className="flex-1">
                            <div className="font-bold text-blue-600 text-[15px]">Hiếm (20%)</div>
                            <p className="text-[11px] text-blue-400 mt-0.5 leading-tight">Sói, Cáo, Gấu, Hổ, Cánh Cụt</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 bg-purple-50/50 border border-purple-200 p-3 rounded-xl">
                          <img src="/assets/pets/unicorn.png" alt="Sử thi" className="w-10 h-10 object-contain mt-1" onError={(e) => { e.currentTarget.src = "/assets/pets/ducky.png" }}/>
                          <div className="flex-1">
                            <div className="font-bold text-purple-600 text-[15px]">Sử thi (4.9%)</div>
                            <p className="text-[11px] text-purple-400 mt-0.5 leading-tight">Kỳ Lân, Tuần Lộc, Sư Tử</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 bg-amber-50/50 border border-amber-200 p-3 rounded-xl">
                          <img src="/assets/pets/dragon.png" alt="Huyền thoại" className="w-10 h-10 object-contain mt-1" onError={(e) => { e.currentTarget.src = "/assets/pets/ducky.png" }}/>
                          <div className="flex-1">
                            <div className="font-bold text-amber-600 text-[15px]">Huyền thoại (0.1%)</div>
                            <p className="text-[11px] text-amber-400 mt-0.5 leading-tight">Thần Long, Phượng Hoàng, Cửu Vĩ Hồ</p>
                          </div>
                        </div>
                     </div>
                  </div>
                </>
              )}

              {/* TAB KHO CỦA BẠN & LÒ LỤYỆN ĐAN (ALCHEMIST MODE) */}
              {activeTab === 'inventory' && (
                <div className="w-full pb-8">
                  
                  {/* BẢNG ĐIỀU KHIỂN LÒ BÁT QUÁI */}
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-4 md:p-6 mb-8 shadow-xl border border-slate-700 transition-all">
                    {!isAlchemyMode ? (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5"><Zap className="w-6 h-6 text-fuchsia-400"/> Lò Luyện Đan</h3>
                          <p className="text-slate-400 text-xs md:text-sm mt-1">Chủ động chọn 5 phôi thú cùng cấp để Đột Phá!</p>
                        </div>
                        <button 
                          onClick={() => setIsAlchemyMode(true)} disabled={totalPets < 5}
                          className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 text-white font-black rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <Sparkles className="w-5 h-5" /> BẬT LÒ LUYỆN
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-base md:text-lg font-black text-white flex items-center gap-2.5">
                            <Zap className="w-5 h-5 text-fuchsia-400 animate-pulse"/> Đang nạp phôi... ({alchemySelection.length}/5)
                          </h3>
                          <button onClick={() => { setIsAlchemyMode(false); setAlchemySelection([]); }} className="text-slate-400 hover:text-white text-sm font-bold bg-slate-700/50 px-3 py-1.5 rounded-lg">Đóng lò</button>
                        </div>
                        
                        {/* KHAY CHỨA PHÔI */}
                        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-2">
                          {[0, 1, 2, 3, 4].map(i => {
                            const pId = alchemySelection[i];
                            return (
                              <div key={i} onClick={() => pId && handleRemoveFromAlchemy(pId)} 
                                className={cn("w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all", pId ? "border-fuchsia-500 bg-white/10 cursor-pointer hover:bg-red-500/30 hover:border-red-500" : "border-slate-700 bg-slate-800 border-dashed")}
                                title={pId ? "Click để rút phôi" : "Chỗ trống"}
                              >
                                {/* 👇 CHỐT CỨNG BẢN VÁ: ẨN ẢNH LỖI MÀ KHÔNG THAY BẰNG VỊT */}
                                {pId ? <img src={`/assets/pets/${pId}.png`} className="w-10 h-10 object-contain drop-shadow-md" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <span className="text-slate-600 font-black">+</span>}
                              </div>
                            );
                          })}
                        </div>

                        <button 
                          onClick={handleExecuteAlchemy} disabled={alchemySelection.length !== 5}
                          className="w-full py-3 md:py-4 mt-2 bg-gradient-to-r from-fuchsia-500 to-pink-600 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-black rounded-xl shadow-lg transition-all active:scale-95"
                        >
                          TIẾN HÀNH LUYỆN HÓA
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2.5 border-b border-slate-200 pb-4"><Box className="w-5 h-5 text-indigo-500"/> Linh Thú Của Bạn</h3>

                  {(!uniquePets || uniquePets.length === 0) ? (
                    <div className="text-center py-12 text-slate-500 italic">Kho thú trống rỗng... Hãy cày cuốc thăng hạng để nhận thêm!</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {uniquePets.map(([petId, count]) => {
                        const pInfo = ITEM_DATABASE[petId];
                        const isEquipped = equippedPetId === petId;
                        
                        const selectedCount = alchemySelection.filter(id => id === petId).length;
                        const safeOwnedCount = isEquipped ? count - 1 : count; 
                        const availableCount = safeOwnedCount - selectedCount;

                        return (
                          <div key={`pet-${petId}`} className={cn("bg-white p-4 rounded-2xl border flex flex-col items-center text-center shadow-sm relative overflow-hidden transition-all", isEquipped && !isAlchemyMode ? "border-indigo-500 ring-2 ring-indigo-100 shadow-md" : "border-slate-200 hover:border-slate-300", isAlchemyMode && availableCount > 0 ? "hover:border-fuchsia-300" : "")}>
                            
                            <div className="absolute top-2 right-2 flex flex-col gap-1 z-30 items-end">
                               {count > 1 && <div className="bg-slate-800 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-md">Tổng: {count}</div>}
                               {isAlchemyMode && selectedCount > 0 && <div className="bg-fuchsia-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-md">Đã nạp: {selectedCount}</div>}
                            </div>
                            
                            {isEquipped && <div className="absolute top-0 left-0 bg-indigo-500 text-white text-[9px] font-black px-2 py-1 rounded-br-lg z-20">ĐANG DÙNG</div>}
                            
                            <div className="w-full h-16 md:h-24 mb-2 md:mb-3 relative flex items-center justify-center">
                              {/* 👇 CHỐT CỨNG BẢN VÁ: ẨN ẢNH LỖI MÀ KHÔNG THAY BẰNG VỊT */}
                              <img src={`/assets/pets/${petId}.png`} alt={pInfo.name} className={cn("w-14 h-14 md:w-20 md:h-20 object-contain drop-shadow-md relative z-10 transition-all", isAlchemyMode && availableCount === 0 ? "grayscale opacity-50" : "")} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                            
                            <h4 className="font-bold text-xs md:text-sm mb-1 text-slate-800 line-clamp-1 w-full">{pInfo.name}</h4>
                            <span className={cn("text-[8px] md:text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mb-2 md:mb-3 border bg-slate-50", pInfo.color)}>{pInfo.rarityName}</span>
                            
                            {!isAlchemyMode ? (
                                <button onClick={() => handleEquipPet(petId)} disabled={isEquipped} className="w-full py-1.5 md:py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 disabled:bg-slate-50 text-slate-700 text-[10px] md:text-[11px] font-bold rounded-lg transition-colors border border-slate-200 z-40 relative">
                                  {isEquipped ? 'Đang dùng' : 'Chọn Trợ Lý'}
                                </button>
                            ) : (
                                <button onClick={() => handleSelectForAlchemy(petId, count)} disabled={availableCount === 0 || alchemySelection.length >= 5} className={cn("w-full py-1.5 md:py-2 font-bold rounded-lg transition-colors border text-[10px] md:text-[11px] z-40 relative", availableCount > 0 && alchemySelection.length < 5 ? "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-200" : "bg-slate-100 text-slate-400 border-slate-200")}>
                                  {availableCount === 0 ? 'Hết phôi' : 'Nạp phôi'}
                                </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}