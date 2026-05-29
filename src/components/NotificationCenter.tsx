'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Bell, X, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { notifications, clearNotification } = useApp();
  const [isOpen, setIsOpen] = React.useState(false);

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors duration-200"
        aria-label="Thông báo"
      >
        <Bell className="w-6 h-6 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-50">
              <h3 className="font-bold text-slate-800">Thông báo ({unreadCount})</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-green-600 font-medium">Hệ thống Realtime</span>
              )}
            </div>
            
            <div className="max-h-72 overflow-y-auto px-2 py-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <Bell className="w-8 h-8 opacity-40 mb-2" />
                  <p className="text-xs">Không có thông báo mới</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-2.5 p-3 my-1 rounded-xl transition-all duration-200 ${
                      notif.type === 'success' 
                        ? 'bg-emerald-50/50 hover:bg-emerald-50' 
                        : notif.type === 'warning'
                        ? 'bg-amber-50/50 hover:bg-amber-50'
                        : 'bg-blue-50/50 hover:bg-blue-50'
                    }`}
                  >
                    <div className="mt-0.5">
                      {notif.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                      {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                      {notif.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 leading-tight">
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-normal break-words">
                        {notif.message}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => clearNotification(notif.id)}
                      className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
