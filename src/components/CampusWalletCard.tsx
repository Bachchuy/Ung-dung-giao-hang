import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Wallet, TrendingUp, CreditCard, PlusCircle, X } from 'lucide-react';

export const CampusWalletCard: React.FC = () => {
  const { user, deposit } = useApp();
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  if (!user) return null;

  const handleDeposit = (amount: number) => {
    deposit(amount);
    setIsDepositOpen(false);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-[#dc2626] to-[#b91c1c] text-white rounded-[2rem] p-5 shadow-[0_12px_30px_rgba(220,38,38,0.15)] border border-red-600/10 relative overflow-hidden flex flex-col gap-4">
        {/* Glow Effects */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none" />
 
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-300" />
            <span className="font-bold text-xs text-white/95 tracking-wide">Ví BK Wallet</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsDepositOpen(true)}
              className="bg-white/15 hover:bg-white/25 text-white p-1.5 px-3 rounded-xl backdrop-blur-md transition-all duration-200 flex items-center gap-1.5 shadow-sm border border-white/20 active:scale-95"
              title="Nạp tiền vào ví"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span className="text-[11px] font-bold tracking-wide">Nạp Tiền</span>
            </button>
            <div className="bg-white/10 p-1.5 rounded-xl backdrop-blur-sm border border-white/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
 
        <div className="flex flex-col gap-1 relative z-10 mt-1">
          <span className="text-[10px] text-white/80 uppercase tracking-wider font-semibold">Số dư khả dụng</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {user.balance?.toLocaleString('vi-VN')} <span className="text-xl">đ</span>
            </span>
            {user.role === 'shipper' && (
              <span className="text-[10px] bg-amber-400 text-red-950 font-bold px-2.5 py-0.5 rounded-full mb-1.5 flex items-center gap-1 shadow-sm">
                <TrendingUp className="w-3 h-3 text-red-950" /> Thu nhập
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Deposit Modal Overlay - High Contrast Amber/Yellow Theme */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl transform scale-in-center animate-in zoom-in-95 duration-200 border-2 border-amber-400">
            <div className="bg-gradient-to-r from-red-600 to-amber-500 p-5 flex justify-between items-center text-white shadow-inner">
              <div className="flex items-center gap-2.5">
                <div className="bg-red-700 p-2.5 rounded-xl border border-red-500">
                  <Wallet className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide">Nạp Tiền Ví BK</h3>
                  <p className="text-[10px] text-red-200 font-bold uppercase tracking-wider">Trình mô phỏng</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDepositOpen(false)} 
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors duration-200 backdrop-blur-sm border border-white/10"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5 bg-amber-50/50">
              <p className="text-[11px] text-slate-700 text-center font-semibold leading-relaxed px-2">
                Chọn mệnh giá để nạp tiền ảo. Tiền sẽ được cộng tức thì vào <b className="text-amber-600 font-black">BK Wallet</b> của bạn để thử nghiệm tính năng giao dịch.
              </p>
              
              <div className="grid grid-cols-2 gap-3.5">
                {[50000, 100000, 200000, 500000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => handleDeposit(amount)}
                    className="group relative overflow-hidden bg-white border-2 border-amber-400 hover:border-amber-500 text-slate-800 hover:text-slate-900 font-black py-3.5 rounded-2xl transition-all duration-300 active:scale-[0.98] shadow-sm hover:shadow-md"
                  >
                    <div className="absolute inset-0 bg-amber-500 opacity-5 group-hover:opacity-10 transition-opacity duration-300" />
                    +{amount.toLocaleString('vi-VN')} đ
                  </button>
                ))}
              </div>
              
              <div className="mt-1 flex justify-center">
                <button
                  onClick={() => setIsDepositOpen(false)}
                  className="py-2 px-6 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
