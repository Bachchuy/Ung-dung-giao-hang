'use client';

import React from 'react';
import { ShieldAlert, AlertCircle } from 'lucide-react';

export const AdminAccessDenied: React.FC<{ reason: string }> = ({ reason }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <div className="rounded-[2rem] p-8 shadow-2xl text-center flex flex-col items-center gap-4 card-surface border border-white/6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center shadow-[0_12px_40px_rgba(7,89,133,0.25)]">
          <ShieldAlert className="w-9 h-9 text-white" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-extrabold text-white">Khu vực Admin - Truy cập bị từ chối</h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed max-w-lg">{reason}</p>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <div className="inline-flex items-center gap-2 text-xs text-white/80 bg-white/3 px-4 py-2 rounded-xl border border-white/5">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Nếu bạn là admin thật, hãy dùng email quản trị hợp lệ và đăng nhập lại.
          </div>
          <div className="text-[12px] text-white/60">
            Liên hệ support nếu cần mở quyền: <b>support@bkship.local</b>
          </div>
        </div>
      </div>
    </div>
  );
};
