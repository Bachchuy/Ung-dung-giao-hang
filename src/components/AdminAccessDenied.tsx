'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const AdminAccessDenied: React.FC<{ reason: string }> = ({ reason }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-black text-slate-900">Khu vực Admin bị khóa</h2>
          <p className="text-sm text-slate-500 leading-relaxed">{reason}</p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 max-w-md">
          Nếu bạn là admin thật, hãy đăng nhập bằng tài khoản có role <b>quan_tri</b> và email quản trị hợp lệ.
        </div>
      </div>
    </div>
  );
};
