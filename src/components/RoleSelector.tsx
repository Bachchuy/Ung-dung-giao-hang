'use client';

import React from 'react';
import { useApp, UserRole } from '@/context/AppContext';
import { ShoppingBag, Navigation, ShieldAlert, Sparkles } from 'lucide-react';
import { canSwitchToAdminAccount } from '@/lib/accessControl';

export const RoleSelector: React.FC = () => {
  const { user, switchRole, addNotification } = useApp();

  if (!user) return null;
  const isAdminAllowed = canSwitchToAdminAccount(user) || user.role === 'quan_tri';

  const baseRoles: { value: UserRole; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
    { 
      value: 'khach_hang', 
      label: 'Khách hàng', 
      icon: <ShoppingBag className="w-4 h-4" />, 
      color: 'bg-blue-500 text-white',
      desc: 'Đặt đồ ăn, nước uống & in PDF'
    },
    { 
      value: 'shipper', 
      label: 'Shipper', 
      icon: <Navigation className="w-4 h-4" />, 
      color: 'bg-emerald-500 text-white',
      desc: 'Nhận đơn giao & kiếm thu nhập'
    }
  ];

  // Only include admin role when the current user is eligible (real admin or allowed by access control)
  const roles = [...baseRoles];
  if (isAdminAllowed) {
    roles.push({
      value: 'quan_tri',
      label: 'Quản trị viên',
      icon: <ShieldAlert className="w-4 h-4" />,
      color: 'bg-rose-500 text-white',
      desc: 'Quản lý tài khoản, đơn hàng & biểu đồ'
    });
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg">
      <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-[2rem] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col gap-2.5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-purple-500/10 pointer-events-none" />
        
        <div className="flex items-center justify-between px-3 pt-1 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-md">BK Ship Switcher</span>
          </div>
          {/* Removed demo badge per UX request - only show controls without the 'Trình mô phỏng' label */}
        </div>
        
        <div className="grid grid-cols-3 gap-2 relative z-10">
          {roles.map((r) => {
            const isActive = user.role === r.value;
            const isAdminLocked = r.value === 'quan_tri' && !canSwitchToAdminAccount(user);
            return (
              <button
                key={r.value}
                onClick={() => {
                  if (isAdminLocked) {
                    addNotification('Không đủ quyền', 'Chỉ tài khoản admin thật mới vào được khu vực quản trị.', 'warning');
                    return;
                  }
                  switchRole(r.value);
                }}
                disabled={isAdminLocked}
                className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
                  isActive 
                    ? `${r.color} shadow-lg scale-[1.02] border border-white/20 font-black` 
                    : isAdminLocked
                      ? 'bg-white/5 border border-white/5 text-slate-500 opacity-60 cursor-not-allowed'
                      : 'bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                }`}
                title={isAdminLocked ? 'Chỉ admin thật mới được vào khu vực này' : r.desc}
              >
                {isActive && <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />}
                <div className={`relative z-10 ${isActive ? 'drop-shadow-md' : 'group-hover:scale-110 transition-transform duration-300'}`}>
                  {r.icon}
                </div>
                <span className="text-[10px] leading-tight tracking-wide relative z-10">{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
