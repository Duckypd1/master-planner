import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Box, Flame } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore'; // Đã fix lại đường dẫn import chuẩn
import { cn } from '../lib/utils';

interface PetAlchemyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ITEM_DATABASE: Record<string, { name: string; rarityName: string; color: string; bg: string }> = {
  'miss': { name: 'Gió thoảng mây bay', rarityName: 'Hụt', color: 'text-slate-500', bg: 'bg-slate-100' },
  'dog': { name: 'Chó Cỏ', rarityName: 'Thường', color: 'text-slate-400', bg: 'bg-slate-800' },
  'cat': { name: 'Mèo Mướp', rarityName: 'Thường', color: 'text-slate-400', bg: 'bg-slate-800' },
  'rooster': { name: 'Gà Trống', rarityName: 'Thường', color: 'text-slate-400', bg: 'bg-slate-800' },
  'rabbit': { name: 'Thỏ Trắng', rarityName: 'Thường', color: 'text-slate-400', bg: 'bg-slate-800' },
  'ducky': { name: 'Vịt Bầu', rarityName: 'Thường', color: 'text-slate-400', bg: 'bg-slate-800' },
  'wolf': { name: 'Sói Xám', rarityName: 'Hiếm', color: 'text-blue-400', bg: 'bg-blue-900/30' },
  'fox': { name: 'Cáo Đỏ', rarityName: 'Hiếm', color: 'text-blue-400', bg: 'bg-blue-900/30' },
  'bear': { name: 'Gấu Nâu', rarityName: 'Hiếm', color: 'text-blue-400', bg: 'bg-blue-900/30' },
  'tiger': { name: 'Hổ Vằn', rarityName: 'Hiếm', color: 'text-blue-400', bg: 'bg-blue-900/30' },
  'penguin': { name: 'Chim Cánh Cụt', rarityName: 'Hiếm', color: 'text-blue-400', bg: 'bg-blue-900/30' },
  'polar_bear': { name: 'Gấu Bắc Cực', rarityName: 'Hiếm', color: 'text-blue-400', bg: 'bg-blue-900/30' },
  'unicorn': { name: 'Kỳ Lân', rarityName: 'Sử thi', color: 'text-purple-400', bg: 'bg-purple-900/30' },
  'reindeer': { name: 'Tuần Lộc Tuyết', rarityName: 'Sử thi', color: 'text-purple-400', bg: 'bg-purple-900/30' },
  'gold_lion': { name: 'Sư Tử Vàng', rarityName: 'Sử thi', color: 'text-purple-400', bg: 'bg-purple-900/30' },
  'phoenix': { name: 'Phượng Hoàng', rarityName: 'Huyền thoại', color: 'text-amber-400', bg: 'bg-amber-900/30' },
  'dragon': { name: 'Thần Long', rarityName: 'Huyền thoại', color: 'text-amber-400', bg: 'bg-amber-900/30' },
  'ninetails': { name: 'Cửu Vĩ Hồ', rarityName: 'Huyền thoại', color: 'text-amber-400', bg: 'bg-amber-900/30' }
};

export const PetAlchemyModal: React.FC<PetAlchemyModalProps> = ({ isOpen, onClose }) => {
  const { userStats, mergePets } = useTaskStore();
  const [selection, setSelection] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultPet, setResultPet] = useState<string | null>(null);

  const equippedPetId = userStats.equippedPet?.id || 'ducky';

  // Gom nhóm và đếm số lượng linh thú
  const uniquePets = useMemo(() => {
    const counts = (userStats.ownedPets || []).reduce((acc, petId) => {
      acc[petId] = (acc[petId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts);
  }, [userStats.ownedPets]);

  // Reset lại trạng thái khi đóng Modal
  useEffect(() => {
    if (!isOpen) {
      setSelection([]);
      setResultPet(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // HÀM: Nạp phôi vào Lò
  const handleSelect = (petId: string, totalCount: number) => {
    const selectedCount = selection.filter(id => id === petId).length;
    // Cơ chế an toàn: Trừ đi 1 con nếu nó đang được trang bị
    const safeCount = equippedPetId === petId ? totalCount - 1 : totalCount;
    
    if (selectedCount < safeCount && selection.length < 5) {
      setSelection([...selection, petId]);
    } else if (selection.length >= 5) {
      alert("Đã đầy lò! Hãy nhấn LUYỆN HÓA.");
    }
  };

  // HÀM: Rút phôi khỏi Lò
  const handleDeselect = (index: number) => {
    const newSel = [...selection];
    newSel.splice(index, 1);
    setSelection(newSel);
  };

  // HÀM: Tiến hành Luyện Hóa
  const handleExecute = () => {
    if (selection.length !== 5) return;
    if (window.confirm("🔥 CẢNH BÁO: 5 linh thú này sẽ BỊ ĐỐT VĨNH VIỄN để tạo ra một sinh mệnh mới. Bạn đã chắc chắn?")) {
      setIsProcessing(true);
      
      // Delay 1.5s để tạo hiệu ứng hồi hộp
      setTimeout(() => {
        const result = mergePets(selection);
        if (result.success && result.newPetId) {
          setResultPet(result.newPetId);
          setSelection([]);
        } else {
          alert(result.message);
        }
        setIsProcessing(false);
      }, 1500);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden relative flex flex-col max-h-[90vh]"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0 relative z-10 bg-slate-900/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                <Zap className="w-6 h-6 text-fuchsia-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Lò Bát Quái</h2>
                <p className="text-sm font-medium text-slate-400 mt-0.5">Luyện hóa 5 linh thú thành phẩm chất cao hơn</p>
              </div>
            </div>
            <button onClick={onClose} disabled={isProcessing} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"><X className="w-6 h-6" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar flex flex-col relative">
            
            {/* LỚP PHỦ HIỆU ỨNG ĐANG LUYỆN HÓA */}
            {isProcessing && (
              <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-b-3xl">
                <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-24 h-24 mb-6">
                  <div className="w-full h-full rounded-full border-4 border-slate-800 border-t-fuchsia-500 shadow-[0_0_50px_rgba(217,70,239,0.5)]" />
                </motion.div>
                <h3 className="text-2xl font-black text-white tracking-widest animate-pulse">ĐANG LÝ TRÍCH...</h3>
              </div>
            )}

            {resultPet ? (
              // 🎁 GIAO DIỆN KẾT QUẢ
              <div className="flex-1 flex flex-col items-center justify-center py-10 animate-in zoom-in duration-500">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.15)_0%,transparent_60%)]" />
                <motion.div initial={{ rotate: -180, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                  <img src={`/assets/pets/${resultPet}.png`} alt="Result" className="w-48 h-48 object-contain drop-shadow-[0_0_30px_rgba(217,70,239,0.5)] animate-bounce relative z-10" onError={(e) => { e.currentTarget.src = "/assets/pets/ducky.png" }} />
                </motion.div>
                <div className="text-center mt-8 relative z-10">
                  <span className="text-fuchsia-400 text-sm font-black uppercase tracking-widest mb-2 block border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 rounded-full mx-auto w-fit">Dung Hợp Thành Công</span>
                  <h3 className="text-4xl font-black text-white">{ITEM_DATABASE[resultPet]?.name || resultPet}</h3>
                  <p className="text-slate-400 mt-2">Linh thú mới đã được đưa thẳng vào kho đồ của bạn.</p>
                </div>
                <button onClick={() => setResultPet(null)} className="mt-10 px-8 py-4 bg-white text-slate-900 font-black rounded-xl hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 relative z-10">Tiếp Tục Luyện Hóa</button>
              </div>
            ) : (
              // ⚗️ GIAO DIỆN CHỌN PHÔI & KHAY CHỨA
              <div className="flex flex-col gap-8">
                
                {/* KHU VỰC 1: KHAY CHỨA 5 PHÔI */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/10 to-transparent pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-6 relative z-10 gap-4">
                     <h4 className="text-slate-200 font-bold flex items-center gap-2"><Flame className="w-5 h-5 text-fuchsia-500"/> Nạp Phôi ({selection.length}/5)</h4>
                     <button 
                        onClick={handleExecute} 
                        disabled={selection.length !== 5}
                        className="w-full md:w-auto py-3 px-8 bg-gradient-to-r from-fuchsia-600 to-pink-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-black rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.3)] disabled:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-5 h-5" /> KHAI HỎA LÒ LUYỆN
                      </button>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 md:gap-6 relative z-10">
                    {[0, 1, 2, 3, 4].map(i => {
                      const pId = selection[i];
                      return (
                        <motion.div 
                          key={`slot-${i}`} 
                          whileHover={{ scale: pId ? 1.05 : 1 }}
                          onClick={() => pId && handleDeselect(i)} 
                          className={cn("w-16 h-16 md:w-24 md:h-24 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all", pId ? "border-fuchsia-500 bg-slate-800 cursor-pointer hover:bg-red-500/20 hover:border-red-500 shadow-[0_0_15px_rgba(217,70,239,0.2)]" : "border-slate-800 bg-slate-900 border-dashed")}
                          title={pId ? "Nhấn để gỡ bỏ" : "Ô trống"}
                        >
                          {pId ? <img src={`/assets/pets/${pId}.png`} className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-lg" onError={(e) => { e.currentTarget.src = "/assets/pets/ducky.png" }} /> : <span className="text-slate-700 font-black text-2xl">+</span>}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* KHU VỰC 2: KHO ĐỒ ĐỂ CHỌN */}
                <div>
                  <h3 className="text-lg font-bold text-slate-300 mb-6 flex items-center gap-2.5 border-b border-slate-800 pb-4"><Box className="w-5 h-5 text-indigo-400"/> Chọn thú cưng làm nguyên liệu</h3>
                  
                  {uniquePets.length === 0 ? (
                    <div className="text-center py-12 text-slate-600 italic">Kho thú trống rỗng...</div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                      {uniquePets.map(([petId, count]) => {
                        const pInfo = ITEM_DATABASE[petId] || { name: 'Lỗi', rarityName: '?', color: 'text-slate-500', bg: 'bg-slate-800' };
                        const isEquipped = equippedPetId === petId;
                        
                        const selectedCount = selection.filter(id => id === petId).length;
                        const safeOwnedCount = isEquipped ? count - 1 : count; 
                        const availableCount = safeOwnedCount - selectedCount;

                        return (
                          <div 
                            key={`inv-${petId}`} 
                            onClick={() => availableCount > 0 && selection.length < 5 && handleSelect(petId, count)}
                            className={cn("p-3 md:p-4 rounded-2xl border flex flex-col items-center text-center shadow-sm relative overflow-hidden transition-all", availableCount > 0 && selection.length < 5 ? "bg-slate-800 border-slate-700 hover:border-fuchsia-500 cursor-pointer" : "bg-slate-900 border-slate-800 opacity-60 cursor-not-allowed")}
                          >
                            <div className="absolute top-2 right-2 flex flex-col gap-1 z-30 items-end">
                               {count > 1 && <div className="bg-slate-700 text-slate-300 text-[10px] font-black px-2 py-0.5 rounded-md">Có: {count}</div>}
                               {selectedCount > 0 && <div className="bg-fuchsia-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">Nạp: {selectedCount}</div>}
                            </div>
                            
                            {isEquipped && <div className="absolute top-0 left-0 bg-indigo-600 text-white text-[9px] font-black px-2 py-1 rounded-br-lg z-20 shadow-md">ĐANG DÙNG</div>}
                            
                            <div className="w-full h-14 md:h-16 mb-2 relative flex items-center justify-center">
                              <img src={`/assets/pets/${petId}.png`} alt={pInfo.name} className={cn("w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-md relative z-10 transition-all", availableCount === 0 ? "grayscale" : "")} onError={(e) => { e.currentTarget.src = "/assets/pets/ducky.png" }} />
                            </div>
                            
                            <h4 className="font-bold text-xs text-slate-200 line-clamp-1 w-full">{pInfo.name}</h4>
                            <span className={cn("text-[9px] font-bold uppercase mt-1", pInfo.color)}>{pInfo.rarityName}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}