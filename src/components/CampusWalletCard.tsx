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

      {/* Deposit Modal Overlay - Premium Dark Mode Glassmorphism */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-950 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8)] transform scale-in-center animate-in zoom-in-95 duration-200 border border-zinc-800/80">
            <div className="bg-gradient-to-r from-[#1c1314] to-[#251819] p-5 flex justify-between items-center text-white border-b border-zinc-900 shadow-inner">
              <div className="flex items-center gap-2.5">
                <div className="bg-red-950/40 p-2.5 rounded-xl border border-red-900/30">
                  <Wallet className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide">Nạp Tiền Ví BK</h3>
                  <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Trình mô phỏng</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDepositOpen(false)} 
                className="bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors duration-200 backdrop-blur-sm border border-white/5"
              >
                <X className="w-4 h-4 text-zinc-400 hover:text-white" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5 bg-[#0e0a0b]">
              <p className="text-[11px] text-zinc-400 text-center font-medium leading-relaxed px-2">
                Chọn mệnh giá để nạp tiền ảo. Tiền sẽ được cộng tức thì vào <b className="text-amber-400 font-extrabold">BK Wallet</b> của bạn để thử nghiệm tính năng giao dịch.
              </p>
              
              <div className="grid grid-cols-2 gap-3.5">
                {[50000, 100000, 200000, 500000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => handleDeposit(amount)}
                    className="group relative overflow-hidden bg-zinc-900/50 border border-zinc-800 hover:border-red-900/60 text-zinc-200 hover:text-white font-extrabold py-3.5 rounded-2xl transition-all duration-300 active:scale-[0.98] shadow-sm hover:shadow-md"
                  >
                    <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                    +{amount.toLocaleString('vi-VN')} đ
                  </button>
                ))}
              </div>
              
              <div className="mt-1 flex justify-center">
                <button
                  onClick={() => setIsDepositOpen(false)}
                  className="py-2 px-6 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all"
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
