import React from 'react';
import { Clock3, PackageCheck, Route, Truck, Ban } from 'lucide-react';
import { OrderStatus } from '@/context/AppContext';

type TimelineStep = {
  key: OrderStatus;
  label: string;
  hint: string;
  icon: React.ReactNode;
};

const STEPS: TimelineStep[] = [
  { key: 'cho_nhan', label: 'Chờ nhận', hint: 'Đơn đang chờ shipper', icon: <Clock3 className="w-3.5 h-3.5" /> },
  { key: 'da_nhan', label: 'Đã nhận', hint: 'Shipper đã xác nhận', icon: <PackageCheck className="w-3.5 h-3.5" /> },
  { key: 'dang_giao', label: 'Đang giao', hint: 'Đơn đang trên đường', icon: <Route className="w-3.5 h-3.5" /> },
  { key: 'hoan_thanh', label: 'Hoàn thành', hint: 'Đơn đã bàn giao xong', icon: <Truck className="w-3.5 h-3.5" /> },
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  cho_nhan: 'Chờ shipper nhận',
  da_nhan: 'Shipper đã nhận',
  dang_giao: 'Đang giao hàng',
  hoan_thanh: 'Đã giao xong',
  da_huy: 'Đơn đã hủy',
};

export const OrderStatusTimeline: React.FC<{ status: OrderStatus; compact?: boolean; className?: string }> = ({
  status,
  compact = false,
  className = '',
}) => {
  if (status === 'da_huy') {
      return (
        <div className={`rounded-2xl border border-rose-200 bg-rose-50/8 px-4 py-3 ${className}`}>
          <div className="flex items-center gap-2 text-rose-300 font-extrabold text-[11px] uppercase tracking-wider">
            <Ban className="w-4 h-4" />
            {STATUS_LABELS.da_huy}
          </div>
          <p className="text-[11px] text-rose-400 mt-1">Timeline kết thúc sớm vì đơn này đã bị hủy.</p>
        </div>
      );
  }

  const activeIndex = STEPS.findIndex((step) => step.key === status);

  return (
    <div className={`rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tiến trình đơn hàng</p>
          <p className="text-xs font-bold text-slate-800 mt-0.5">{STATUS_LABELS[status]}</p>
        </div>
          <span className="text-[10px] font-bold text-slate-300 bg-black/10 border border-white/6 px-2 py-1 rounded-full">
          {activeIndex < 0 ? '0/4' : `${Math.min(activeIndex + 1, STEPS.length)}/4`}
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-3 right-3 top-3 h-1 rounded-full bg-slate-200" />
          <div className="absolute left-3 top-3 h-1 rounded-full bg-slate-800/20" />
          <div
            className="absolute left-3 top-3 h-1 rounded-full transition-all duration-700"
            style={{ width: activeIndex >= 0 ? `${(activeIndex / (STEPS.length - 1)) * 100}%` : '0%', background: 'linear-gradient(90deg,#06b6d4,#7c3aed)'}}
          />

        <div className={`relative grid ${compact ? 'grid-cols-4' : 'grid-cols-2 sm:grid-cols-4'} gap-2`}>
          {STEPS.map((step, index) => {
            const isCompleted = index < activeIndex;
            const isActive = index === activeIndex;
            const isFuture = index > activeIndex;

            return (
              <div
                key={step.key}
                className={`flex flex-col items-center text-center gap-2 pt-7 ${compact ? 'px-0' : 'px-1'}`}
              >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-sm transition-all ${
                      isCompleted || isActive
                        ? 'bg-gradient-to-br from-emerald-400 to-cyan-400 border-transparent text-white glow-accent'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className={`transition-opacity ${isFuture ? 'opacity-60' : 'opacity-100'}`}>{step.icon}</span>
                  </div>
                <div className="flex flex-col gap-0.5">
                  <span className={`text-[10px] font-bold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{step.label}</span>
                  {!compact && <span className="text-[9px] text-slate-400 leading-tight">{step.hint}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
