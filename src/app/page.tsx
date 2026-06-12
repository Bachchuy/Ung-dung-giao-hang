'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AuthScreen } from '@/components/AuthScreen';
import { CustomerDashboard } from '@/components/CustomerDashboard';
import { ShipperDashboard } from '@/components/ShipperDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AdminAccessDenied } from '@/components/AdminAccessDenied';
import { RoleSelector } from '@/components/RoleSelector';
import { NotificationCenter } from '@/components/NotificationCenter';
import { Truck, LogOut, Info, ShieldCheck } from 'lucide-react';
import { isAdminAccount, getAdminAccessDeniedReason } from '@/lib/accessControl';
import { UserProfileModal } from '@/components/UserProfileModal';

export default function Home() {
  const { user, logout, isDemoMode } = useApp();
  const hasAdminAccess = isAdminAccount(user);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // If no student session is active, show the auth/landing page
  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen text-zinc-100 flex flex-col font-sans relative">
      {/* 1. MOCK / DEMO MODE ALERT BANNER */}
      {isDemoMode && (
        <div className="w-full bg-zinc-950 text-zinc-400 border-b border-zinc-900/80 text-[11px] py-2.5 px-4 flex items-center justify-between font-semibold">
          <div className="flex items-center gap-2 max-w-[90%] truncate">
            <Info className="w-4 h-4 text-amber-500 flex-shrink-0 animate-pulse" />
            <span>
              💡 Đang chạy <b>Mock Demo Mode</b> (Dữ liệu lưu tại LocalStorage). Hãy kết nối cơ sở dữ liệu Supabase để chạy chế độ Production!
            </span>
          </div>
          <span className="hidden md:inline bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px]">
            Demo Ready
          </span>
        </div>
      )}

      {/* 2. HEADER */}
      <header className="w-full bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-900/80 py-4 px-6 sticky top-0 z-40 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between relative">
          {/* Decorative background glow for Logo */}
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Logo */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-[0_4px_15px_rgba(185,28,28,0.15)] border border-red-950/40 group">
              <img 
                src="/logo.jpg" 
                alt="BK Ship Logo" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-black text-sm tracking-tight text-white uppercase">
                  BK
                </span>
                <span className="font-extrabold text-sm tracking-tight text-red-500 uppercase bg-red-950/50 px-1.5 rounded-md border border-red-900/30">
                  Ship
                </span>
              </div>
              <span className="text-[9px] font-bold text-zinc-500 tracking-wider">Fast & Secure Delivery</span>
            </div>
          </div>

          {/* User info & Actions */}
          <div className="flex items-center gap-4 relative z-10">
            {/* Realtime Notification Bell */}
            <NotificationCenter />
            
            <div className="h-8 w-px bg-zinc-800/60"></div>

            {/* Profile */}
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-3 hover:bg-zinc-900/40 p-1.5 pr-3 rounded-full transition-colors cursor-pointer border border-transparent hover:border-zinc-800/80"
            >
              <div className="relative">
                <img 
                  src={user.avatar_url} 
                  alt={user.full_name} 
                  className="w-9 h-9 rounded-full object-cover border-2 border-zinc-900 shadow-sm"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-zinc-900 rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-zinc-200 leading-none tracking-wide">
                  {user.full_name}
                </span>
                <span className="text-[10px] text-red-400 font-extrabold uppercase mt-1 tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-red-500" />
                  {user.role === 'khach_hang' ? 'Khách hàng' : user.role === 'shipper' ? 'Shipper' : 'Admin'}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2.5 rounded-full bg-zinc-900 hover:bg-red-950/40 text-zinc-400 hover:text-red-500 transition-all duration-300 border border-zinc-800/60 hover:border-red-900/30 shadow-sm hover:shadow-md"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {user.role === 'khach_hang' && <CustomerDashboard />}
        {user.role === 'shipper' && <ShipperDashboard />}
        {user.role === 'quan_tri' && (hasAdminAccess ? <AdminDashboard /> : <AdminAccessDenied reason={getAdminAccessDeniedReason(user)} />)}
      </main>

      {/* 4. STICKY FLOATING CONTROL PILL */}
      <RoleSelector />

      <UserProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
