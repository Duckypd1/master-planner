import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { PetAlchemyModal } from './PetAlchemyModal';

export const Inventory = () => {
  const { userStats } = useTaskStore();
  const [isAlchemyOpen, setIsAlchemyOpen] = useState(false);

  // Gom nhóm linh thú để đếm số lượng (Hiển thị cho gọn gàng trên cả PC & Mobile)
  const petCounts = userStats.ownedPets.reduce((acc, petId) => {
    acc[petId] = (acc[petId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniquePets = Object.entries(petCounts);

  // 👇 HÀM MỚI: Bật Lò và ẩn Sidebar
  const handleOpenAlchemy = () => {
    setIsAlchemyOpen(true);
    window.dispatchEvent(new CustomEvent('toggleExternalModal', { detail: true }));
  };

  // 👇 HÀM MỚI: Tắt Lò và hiện lại Sidebar
  const handleCloseAlchemy = () => {
    setIsAlchemyOpen(false);
    window.dispatchEvent(new CustomEvent('toggleExternalModal', { detail: false }));
  };

  // Màng bảo vệ: Nếu component bị unmount đột ngột (chuyển tab), Sidebar vẫn sẽ hiện lại
  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent('toggleExternalModal', { detail: false }));
    };
  }, []);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen rounded-2xl">
      {/* KHU VỰC TIÊU ĐỀ VÀ NÚT BẤM */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">🎒 Kho Đồ</h1>
          <p className="text-gray-500 text-sm mt-1">Tổng số lượng: <span className="font-bold text-purple-600">{userStats.ownedPets.length}</span> linh thú</p>
        </div>
        
        <button 
          onClick={handleOpenAlchemy} // 👈 Đã thay đổi hàm gọi
          className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2"
        >
          ✨ Mở Lò Luyện Hóa
        </button>
      </div>

      {/* KHU VỰC TRƯNG BÀY LINH THÚ */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
        {uniquePets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
            <span className="text-4xl mb-3">🕸️</span>
            <p className="text-center">Kho đồ trống trơn. Hãy đi làm nhiệm vụ hoặc mở Hòm Bí Ẩn nhé!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {uniquePets.map(([petId, count]) => (
              <div key={petId} className="relative flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all group">
                
                {count > 1 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-md z-20">
                    x{count}
                  </div>
                )}

                <img 
                  src={`/assets/pets/${petId}.png`} 
                  alt={petId} 
                  className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300 mt-2"
                  onError={(e) => { e.currentTarget.src = '/assets/pets/ducky.png'; }}
                />
                
                <span className="mt-3 text-sm font-bold text-gray-700 capitalize">{petId}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPONENT LÒ LUYỆN KIM SẼ HIỂN THỊ KHI BẤM NÚT */}
      <PetAlchemyModal 
        isOpen={isAlchemyOpen} 
        onClose={handleCloseAlchemy} // 👈 Đã thay đổi hàm gọi
      />
    </div>
  );
};