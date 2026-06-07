'use client';

import React, { useState } from 'react';
import { useApp, Order, calculateOrderPricing } from '@/context/AppContext';
import { CampusMap } from './CampusMap';
import { ChatBox } from './ChatBox';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import { 
  Navigation, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  FileText, 
  Phone, 
  Layers, 
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Trophy,
  Target,
  Award
} from 'lucide-react';
import { CampusWalletCard } from './CampusWalletCard';

export const ShipperDashboard: React.FC = () => {
  const { orders, user, acceptOrder, updateOrderStatus } = useApp();
  const [shipperTab, setShipperTab] = useState<'pool' | 'active' | 'leaderboard'>('pool');
  const [confirmOrderId, setConfirmOrderId] = useState<string | null>(null);
  const [actualCostInput, setActualCostInput] = useState<string>('');
  
  // Overlays state
  const [selectedMapOrder, setSelectedMapOrder] = useState<Order | null>(null);
  const [selectedChatOrder, setSelectedChatOrder] = useState<Order | null>(null);

  if (!user) return null;

  // Filter orders
  const pendingOrders = orders.filter(o => o.status === 'cho_nhan');
  const myActiveOrders = orders.filter(o => 
    o.shipper_id === user.id && 
    (o.status === 'da_nhan' || o.status === 'dang_giao')
  );

  const totalCompleted = user.orders_completed;
  const repScore = user.reputation;
  const isTopShipper = totalCompleted >= 5;

  const handleAccept = async (orderId: string) => {
    const success = await acceptOrder(orderId);
    if (success) {
      setShipperTab('active');
    }
  };


  const handleCancelOrder = async (orderId: string) => {
    if (confirm('CẢNH BÁO: Hủy đơn hàng sau khi nhận sẽ làm bạn bị trừ 15 điểm uy tín cộng đồng. Bạn có chắc chắn muốn hủy?')) {
      await updateOrderStatus(orderId, 'da_huy');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto px-4 pb-28 pt-4">
      {/* Wallet Card */}
      <CampusWalletCard />

      {/* 1. GAMIFIED SHIPPER STATS CARD */}
      <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 text-white rounded-[2rem] p-6 shadow-2xl border border-white/10 flex flex-col gap-5 relative overflow-hidden backdrop-blur-xl">
        {/* Subtle decorative mesh background */}
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute left-0 top-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={user.avatar_url} 
                alt={user.full_name} 
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400 bg-slate-800 p-0.5 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-slate-900">
                <CheckCircle className="w-3 h-3 text-slate-900" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2 tracking-wide">
                {user.full_name}
                {isTopShipper && (
                  <span className="flex items-center gap-1 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.4)]">
                    <Award className="w-3 h-3" />
                    PRO
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-emerald-400/80 font-bold mt-0.5 uppercase tracking-wider">Khối Vận chuyển Nội khu ĐHBK</p>
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl shadow-inner backdrop-blur-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sẵn sàng
            </span>
          </div>
        </div>

        {/* Gamification stats grid */}
        <div className="grid grid-cols-3 gap-3 pt-2 relative z-10">
          <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center flex flex-col justify-center hover:bg-white/10 transition-colors">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Điểm uy tín</span>
            <span className="text-xl font-black text-emerald-400 mt-1 flex items-center justify-center gap-1">
              {repScore}
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </span>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center flex flex-col justify-center hover:bg-white/10 transition-colors">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Đơn hoàn thành</span>
            <span className="text-xl font-black text-slate-100 mt-1">{totalCompleted}</span>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center flex flex-col justify-center hover:bg-white/10 transition-colors">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Danh hiệu</span>
            <span className="text-xs font-black text-amber-400 mt-1 truncate">
              {totalCompleted < 2 ? 'Tân binh 🔰' : totalCompleted < 5 ? 'Chuyên nghiệp 🚴' : 'Huyền thoại 🏆'}
            </span>
          </div>
        </div>

        {/* Reputation Progress Bar */}
        <div className="flex flex-col gap-2 relative z-10 mt-1">
          <div className="flex justify-between text-[11px] font-bold text-slate-300">
            <span>Tiến trình nâng hạng</span>
            <span className="text-emerald-400">{repScore} / 200 Điểm</span>
          </div>
          <div className="h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-white/10 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-1000 ease-out relative" 
              style={{ width: `${Math.min(100, (repScore / 200) * 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABS SELECTOR */}
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 gap-1">
        <button
          onClick={() => setShipperTab('pool')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            shipperTab === 'pool' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          Bảng tin đơn hàng ({pendingOrders.length})
        </button>
        <button
          onClick={() => setShipperTab('active')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            shipperTab === 'active' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Navigation className="w-4 h-4" />
          Đơn tôi đang nhận ({myActiveOrders.length})
        </button>
        <button
          onClick={() => setShipperTab('leaderboard')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            shipperTab === 'leaderboard' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Thành tích
        </button>
      </div>

      {/* 3. LEADERBOARD & ANALYTICS TAB */}
      {shipperTab === 'leaderboard' && (
        <div className="flex flex-col gap-6">
          {/* SVG EARNINGS CHART (Mockup Dynamic Data) */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Thu nhập 7 ngày qua
              </h2>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                Tổng: 1.450.000đ
              </span>
            </div>
            
            <div className="w-full h-40 mt-2 relative">
              <svg viewBox="0 0 400 120" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                <line x1="0" y1="0" x2="400" y2="0" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="40" x2="400" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="400" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="120" x2="400" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                
                {/* Area */}
                <path 
                  d="M0,120 L0,90 C50,90 80,40 120,60 C160,80 200,20 240,40 C280,60 320,10 360,30 L400,20 L400,120 Z" 
                  fill="url(#chartGradient)" 
                  className="animate-[fadeIn_1s_ease-out]"
                />
                
                {/* Line */}
                <path 
                  d="M0,90 C50,90 80,40 120,60 C160,80 200,20 240,40 C280,60 320,10 360,30 L400,20" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-[drawPath_1.5s_ease-out]"
                  strokeDasharray="1000"
                  strokeDashoffset="0"
                />
                
                {/* Points */}
                {[
                  { cx: 0, cy: 90, val: '80k' },
                  { cx: 120, cy: 60, val: '150k' },
                  { cx: 240, cy: 40, val: '220k' },
                  { cx: 360, cy: 30, val: '280k' },
                  { cx: 400, cy: 20, val: '310k' }
                ].map((pt, i) => (
                  <g key={i} className="group cursor-pointer">
                    <circle cx={pt.cx} cy={pt.cy} r="4" fill="white" stroke="#3b82f6" strokeWidth="2" className="transition-all duration-300 group-hover:r-6" />
                    <circle cx={pt.cx} cy={pt.cy} r="12" fill="transparent" />
                    <text x={pt.cx} y={pt.cy - 12} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#64748b" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {pt.val}
                    </text>
                  </g>
                ))}
              </svg>
              <div className="flex justify-between px-1 mt-2 text-[10px] font-bold text-slate-400">
                <span>T2</span>
                <span>T3</span>
                <span>T4</span>
                <span>T5</span>
                <span>T6</span>
                <span>T7</span>
                <span>CN</span>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2rem] p-6 shadow-2xl border border-slate-800 flex flex-col gap-5 text-white relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 blur-[60px] pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-[50px] pointer-events-none rounded-full" />
            
            <h2 className="text-base font-black text-amber-400 flex items-center gap-2 relative z-10">
              <Trophy className="w-6 h-6" />
              Bảng Xếp Hạng Tuần (Top HUST)
            </h2>
            
            <div className="flex flex-col gap-3 relative z-10">
              {[
                { rank: 1, name: 'Nguyễn Văn Đạt', orders: 154, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
                { rank: 2, name: 'Lê Hoàng Phát', orders: 142, color: 'text-slate-200', bg: 'bg-white/5 border-white/10' },
                { rank: 3, name: 'Trần Thị Mai', orders: 128, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
                { rank: 4, name: 'Phạm Minh Tú', orders: 110, color: 'text-slate-400', bg: 'bg-white/5 border-transparent' },
                { rank: 5, name: 'Bùi Anh Tuấn', orders: 98, color: 'text-slate-400', bg: 'bg-white/5 border-transparent' },
              ].map((shipper) => (
                <div key={shipper.rank} className={`flex items-center justify-between p-3.5 rounded-2xl border ${shipper.bg} hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 cursor-pointer`}>
                  <div className="flex items-center gap-4">
                    <span className={`text-xl font-black w-6 text-center ${shipper.color} drop-shadow-md`}>
                      #{shipper.rank}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-100">{shipper.name}</span>
                      {shipper.rank === 1 && (
                        <span className="text-[9px] text-slate-900 font-black bg-gradient-to-r from-yellow-300 to-amber-500 px-2 py-0.5 rounded-md self-start mt-1 shadow-sm">
                          HUYỀN THOẠI
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-base font-black text-emerald-400">{shipper.orders}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Đơn thành công</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Quests */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Nhiệm vụ nhận thưởng
            </h2>
            <div className="flex flex-col gap-3">
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3 relative overflow-hidden group hover:border-indigo-200 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">Chuyên gia đồ ăn 🍔</h3>
                    <p className="text-xs text-slate-500 mt-1">Hoàn thành 2 đơn đồ ăn trong ngày</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200">
                    +10 Uy tín
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '50%' }} />
                  </div>
                  <span className="text-[10px] font-black text-indigo-600">1/2</span>
                </div>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3 relative overflow-hidden group hover:border-amber-200 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-amber-700 transition-colors">Cú đêm tốc độ 🌙</h3>
                    <p className="text-xs text-slate-500 mt-1">Nhận và giao 1 đơn sau 22h</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-amber-200">
                    <Award className="w-3 h-3" /> Huy hiệu
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '0%' }} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400">0/1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ORDER POOL TAB */}
      {shipperTab === 'pool' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Đơn hàng đang chờ nhận</h2>
            <span className="text-[10px] text-slate-500 bg-slate-100 py-1 px-2.5 rounded-full font-bold">Campus Zone</span>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl py-12 px-6 text-center shadow-sm flex flex-col items-center justify-center gap-3">
              <span className="text-4xl">🍿</span>
              <h3 className="font-bold text-slate-800 text-sm">Hiện tại chưa có đơn hàng mới</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Khi sinh viên trong trường đặt đồ ăn hoặc in tài liệu học tập, các đơn hàng sẽ lập tức hiển thị realtime ở đây.
              </p>
            </div>
          ) : (
            pendingOrders.map((o) => (
              <div 
                key={o.id}
                className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <img 
                      src={o.customer_avatar} 
                      alt={o.customer_name} 
                      className="w-10 h-10 rounded-full border border-slate-100"
                    />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{o.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Đặt bởi: <b>{o.customer_name}</b></p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-extrabold px-3 py-1 rounded-xl flex items-center gap-0.5 border border-emerald-100">
                    +{o.shipping_fee.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>

                <p className="text-xs text-slate-600 pl-1 leading-relaxed">
                  {o.description || 'Không có mô tả chi tiết.'}
                </p>

                {/* Hướng dẫn tiền mặt COD */}
                <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white rounded-xl p-2 border border-slate-100 flex flex-col gap-0.5 shadow-inner">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Ứng mua hộ</span>
                    <span className="font-extrabold text-red-500 text-xs">
                      {(o.item_cost || (o.total_amount ? o.total_amount - o.shipping_fee : 30000)).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="bg-white rounded-xl p-2 border border-slate-100 flex flex-col gap-0.5 shadow-inner">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Cần thu COD</span>
                    <span className="font-extrabold text-emerald-600 text-xs">
                      {o.total_amount?.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="bg-white rounded-xl p-2 border border-slate-100 flex flex-col gap-0.5 shadow-inner">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Thu nhập ship</span>
                    <span className="font-extrabold text-blue-600 text-xs">
                      {o.shipping_fee.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                {/* Print Configuration highlight */}
                {o.printing_details && (
                  <div className="bg-violet-50/30 border border-violet-100 rounded-2xl p-3 flex flex-col gap-1.5 text-xs text-violet-900 pl-4 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 rounded-l-2xl" />
                    <div className="flex items-center gap-1.5 font-bold mb-0.5 text-violet-800">
                      <FileText className="w-4 h-4 text-violet-600" />
                      <span>YÊU CẦU IN TÀI LIỆU (Cần photo trước)</span>
                    </div>
                    <p className="text-[11px] font-semibold">Tên file: <span className="underline">{o.printing_details.file_name}</span></p>
                    <div className="grid grid-cols-3 gap-2 mt-1 text-[10px] bg-white/50 p-2 rounded-xl border border-violet-100/50">
                      <span>• Số lượng: <b>{o.printing_details.copies} bản</b></span>
                      <span>• Mặt in: <b>{o.printing_details.is_double_sided ? '2 Mặt' : '1 Mặt'}</b></span>
                      <span>• Màu: <b>{o.printing_details.is_color ? 'Có Màu' : 'Đen Trắng'}</b></span>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 rounded-2xl p-3 text-xs text-slate-600 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span><b>Vị trí giao hàng:</b> {o.delivery_location}</span>
                  </div>
                  {o.notes && (
                    <div className="text-[11px] text-slate-500 border-t border-slate-200/50 pt-1.5">
                      💡 <b>Lời nhắn:</b> {o.notes}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleAccept(o.id)}
                  className="w-full bg-slate-900 hover:bg-emerald-600 hover:text-white text-slate-100 font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all duration-300"
                >
                  Nhận giao đơn này (Nhận +{o.shipping_fee.toLocaleString('vi-VN')} đ)
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. ACTIVE ORDERS TAB */}
      {shipperTab === 'active' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Đơn hàng bạn đang nhận giao</h2>
            <span className="text-xs text-slate-400">Vui lòng liên hệ với khách hàng để xác nhận</span>
          </div>

          {myActiveOrders.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl py-12 px-6 text-center shadow-sm flex flex-col items-center justify-center gap-3">
              <span className="text-4xl">🚲</span>
              <h3 className="font-bold text-slate-800 text-sm">Bạn chưa nhận giao đơn nào</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Hãy chuyển sang tab &quot;Bảng tin đơn hàng&quot; ở trên và nhận đơn để bắt đầu giao hàng kiếm thêm thu nhập nhé!
              </p>
            </div>
          ) : (
            myActiveOrders.map((o) => {
              const itemCost = calculateOrderPricing(
                o.order_type,
                o.shipping_fee,
                o.item_cost ?? undefined,
                o.printing_details
              ).estimatedItemCost;
              return (
                <div 
                  key={o.id}
                  className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-4"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-2.5">
                      <span className={`text-xs font-bold py-1 px-2.5 rounded-lg ${
                        o.status === 'da_nhan' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      }`}>
                        {o.status === 'da_nhan' ? 'Đã nhận đơn' : 'Đang giao hàng'}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm self-center">{o.title}</h4>
                    </div>
                    <span className="text-sm font-extrabold text-slate-800">
                      {o.shipping_fee.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  {/* Print Configuration highlight */}
                  {o.printing_details && (
                    <div className="bg-violet-50/20 border border-violet-100 rounded-2xl p-3 flex flex-col gap-1.5 text-xs text-violet-900">
                      <div className="flex items-center gap-1 font-bold text-violet-850">
                        <FileText className="w-3.5 h-3.5" /> File: {o.printing_details.file_name} (x{o.printing_details.copies})
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-violet-750">
                        <span>• Loại in: {o.printing_details.is_color ? 'Màu' : 'Đen trắng'}</span>
                        <span>• Quy cách: {o.printing_details.is_double_sided ? '2 mặt' : '1 mặt'}</span>
                      </div>
                    </div>
                  )}

                  {/* Hướng dẫn tiền mặt COD */}
                  <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white rounded-xl p-2 border border-slate-100 flex flex-col gap-0.5 shadow-inner">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Ứng mua hộ</span>
                      <span className="font-extrabold text-red-500 text-xs">
                        {itemCost.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="bg-white rounded-xl p-2 border border-slate-100 flex flex-col gap-0.5 shadow-inner">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Cần thu COD</span>
                      <span className="font-extrabold text-emerald-600 text-xs">
                        {(itemCost + o.shipping_fee).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="bg-white rounded-xl p-2 border border-slate-100 flex flex-col gap-0.5 shadow-inner">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Lợi nhuận ship</span>
                      <span className="font-extrabold text-blue-600 text-xs">
                        {o.shipping_fee.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-600 flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span><b>Vị trí giao:</b> {o.delivery_location}</span>
                    </div>
                    <div className="flex items-center gap-2 border-t border-slate-200/50 pt-2">
                      <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span><b>SĐT Khách hàng:</b> <a href={`tel:${o.phone_number}`} className="underline font-bold text-slate-800">{o.phone_number}</a> ({o.customer_name})</span>
                    </div>
                    {o.notes && (
                      <div className="text-[11px] text-slate-500 border-t border-slate-200/50 pt-2">
                        💡 <b>Ghi chú:</b> {o.notes}
                      </div>
                    )}
                  </div>

                  <OrderStatusTimeline status={o.status} compact />

                  {/* Map and Chat Active controls */}
                  {confirmOrderId !== o.id && (
                    <div className="flex gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => setSelectedMapOrder(o)}
                        className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 border border-emerald-200/50"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Xem bản đồ
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedChatOrder(o)}
                        className="flex-1 bg-slate-900 hover:bg-slate-850 text-white text-[11px] font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Chat với khách
                      </button>
                    </div>
                  )}

                  {confirmOrderId !== o.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCancelOrder(o.id)}
                        className="py-3 px-4 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-1 transition-all duration-200"
                        title="Hủy đơn giao (Bị phạt uy tín)"
                      >
                        <XCircle className="w-4 h-4" />
                        Hủy đơn
                      </button>

                      <button
                        onClick={() => {
                          if (o.status === 'da_nhan') {
                            updateOrderStatus(o.id, 'dang_giao');
                          } else {
                            setConfirmOrderId(o.id);
                            setActualCostInput(String(itemCost));
                          }
                        }}
                        className={`flex-1 py-3 px-4 rounded-xl text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-md ${
                          o.status === 'da_nhan' 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-emerald-500 hover:bg-emerald-600'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {o.status === 'da_nhan' ? 'Bắt đầu đi giao' : 'Đã giao hàng thành công'}
                      </button>
                    </div>
                  )}

                  {/* Hộp thoại xác nhận hóa đơn thực tế của Shipper */}
                  {confirmOrderId === o.id && (
                    <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 flex flex-col gap-4 animate-in slide-in-from-top-1 relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-slate-200">Xác nhận hóa đơn thực tế</span>
                        <button 
                          onClick={() => setConfirmOrderId(null)}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-200"
                        >
                          Hủy
                        </button>
                      </div>

                      <div className="flex flex-col gap-1 text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        <div className="flex justify-between">
                          <span>Tiền hàng khách dự kiến:</span>
                          <span className="font-bold text-slate-100">{itemCost.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phí ship (Tip COD):</span>
                          <span className="font-bold text-slate-100">{o.shipping_fee.toLocaleString('vi-VN')} đ</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Số tiền thực tế trên hóa đơn cửa hàng (VNĐ)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">đ</span>
                          <input
                            type="number"
                            required
                            min={0}
                            placeholder="Nhập giá tiền hàng thực tế..."
                            value={actualCostInput}
                            onChange={(e) => setActualCostInput(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white font-extrabold focus:outline-none focus:border-emerald-500 transition-colors"
                          />
                        </div>
                        <p className="text-[9px] text-slate-400 leading-relaxed">
                          💡 Nếu có chênh lệch, hệ thống sẽ tự động cập nhật ví điện tử Khách hàng và Shipper tương ứng.
                        </p>
                      </div>

                      {/* Tính toán COD thực tế cần thu */}
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-emerald-400 font-bold uppercase">Tổng COD cần thu tiền mặt</span>
                          <span className="text-[9px] text-slate-400">Gồm: Hóa đơn thực tế + Phí Ship</span>
                        </div>
                        <span className="text-sm font-extrabold text-emerald-400">
                          {(Number(actualCostInput || 0) + o.shipping_fee).toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      <button
                        onClick={async () => {
                          const actualPrice = Number(actualCostInput);
                          if (isNaN(actualPrice) || actualPrice < 0) {
                            alert('Vui lòng nhập giá trị hóa đơn hợp lệ!');
                            return;
                          }
                          const success = await updateOrderStatus(o.id, 'hoan_thanh', actualPrice);
                          if (success) {
                            setConfirmOrderId(null);
                          }
                        }}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all duration-200 shadow-md"
                      >
                        <CheckCircle className="w-4 h-4 text-slate-950" />
                        Xác nhận đã thu COD & Hoàn thành đơn
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Overlays */}
      {selectedMapOrder && (
        <CampusMap 
          order={selectedMapOrder} 
          onClose={() => setSelectedMapOrder(null)} 
        />
      )}
      {selectedChatOrder && (
        <ChatBox 
          order={selectedChatOrder} 
          onClose={() => setSelectedChatOrder(null)} 
        />
      )}
    </div>
  );
};
