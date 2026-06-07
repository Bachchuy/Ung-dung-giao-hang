'use client';

import React, { useState } from 'react';
import { useApp, OrderType, OrderStatus, PrintingDetails, Order, calculateOrderPricing } from '@/context/AppContext';
import { CampusMap } from './CampusMap';
import { ChatBox } from './ChatBox';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import { 
  ShoppingBag, 
  FileText, 
  Pizza, 
  Coffee, 
  MapPin, 
  Phone, 
  DollarSign, 
  FileDown, 
  FileUp, 
  Check, 
  Star, 
  MessageSquare,
  Clock,
  History,
  Ticket
} from 'lucide-react';
import { CampusWalletCard } from './CampusWalletCard';

export const CustomerDashboard: React.FC = () => {
  const { orders, ratings, createOrder, submitRating, user } = useApp();
  const [activeTab, setActiveTab] = useState<'track' | 'create'>('track');
  const [orderType, setOrderType] = useState<OrderType>('do_an');
  
  // Overlays state
  const [selectedMapOrder, setSelectedMapOrder] = useState<Order | null>(null);
  const [selectedChatOrder, setSelectedChatOrder] = useState<Order | null>(null);
  const [isSelectingLocationOnMap, setIsSelectingLocationOnMap] = useState(false);
  
  // Order Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [shippingFee, setShippingFee] = useState(10000);
  const [itemCost, setItemCost] = useState(30000);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null);
  
  // Printing states
  const [pdfFileName, setPdfFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [copies, setCopies] = useState(1);
  const [isColor, setIsColor] = useState(false);
  const [isDoubleSided, setIsDoubleSided] = useState(true);

  // Rating states
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  const myOrders = orders.filter(o => o.customer_id === user?.id);

  const currentPricing = calculateOrderPricing(
    orderType,
    Number(shippingFee),
    Number(itemCost),
    orderType === 'in_an' ? {
      file_name: pdfFileName,
      copies,
      is_color: isColor,
      is_double_sided: isDoubleSided
    } : undefined
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Chỉ chấp nhận file định dạng PDF!');
        return;
      }
      setIsUploading(true);
      setPdfFileName(file.name);
      // Simulate brief upload progress bar
      setTimeout(() => {
        setIsUploading(false);
      }, 1500);
    }
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'FREESHIP') {
      setAppliedPromo({ code, discount: Math.min(15000, shippingFee) });
    } else if (code === 'TANBINH') {
      setAppliedPromo({ code, discount: shippingFee * 0.5 });
    } else if (code === 'HUST50') {
      setAppliedPromo({ code, discount: 5000 });
    } else {
      alert('Mã giảm giá không hợp lệ hoặc đã hết hạn!');
      setAppliedPromo(null);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !phone || !shippingFee) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    if (orderType === 'in_an' && !pdfFileName) {
      alert('Vui lòng tải lên file tài liệu PDF cần in!');
      return;
    }

    const finalNotes = appliedPromo ? `[Đã áp dụng mã ${appliedPromo.code} giảm ${appliedPromo.discount.toLocaleString('vi-VN')}đ] ${notes}` : notes;

    const orderData = {
      title,
      description,
      order_type: orderType,
      delivery_location: location,
      phone_number: phone,
      notes: finalNotes,
      shipping_fee: Number(shippingFee),
      item_cost: currentPricing.estimatedItemCost
    };

    const printingDetails: PrintingDetails | undefined = orderType === 'in_an' ? {
      file_name: pdfFileName,
      copies,
      is_color: isColor,
      is_double_sided: isDoubleSided
    } : undefined;

    const success = await createOrder(orderData, printingDetails);
    if (success) {
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setPhone('');
      setNotes('');
      setShippingFee(10000);
      setItemCost(30000);
      setPdfFileName('');
      setCopies(1);
      setPromoCode('');
      setAppliedPromo(null);
      setActiveTab('track');
    }
  };

  const handleRatingSubmit = async (orderId: string, shipperId: string) => {
    if (!ratingComment) {
      alert('Vui lòng viết đánh giá ngắn gọn!');
      return;
    }
    const success = await submitRating(orderId, shipperId, ratingScore, ratingComment);
    if (success) {
      setRatingOrderId(null);
      setRatingScore(5);
      setRatingComment('');
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const styles: Record<OrderStatus, string> = {
      cho_nhan: 'bg-amber-100 text-amber-800 border-amber-200',
      da_nhan: 'bg-blue-100 text-blue-800 border-blue-200',
      dang_giao: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      hoan_thanh: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      da_huy: 'bg-slate-100 text-slate-800 border-slate-200'
    };
    const labels: Record<OrderStatus, string> = {
      cho_nhan: 'Đang tìm Shipper',
      da_nhan: 'Shipper đã nhận đơn',
      dang_giao: 'Đang giao hàng',
      hoan_thanh: 'Giao hàng thành công',
      da_huy: 'Đã hủy đơn'
    };

    return (
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto px-4 pb-28 pt-4">
      {/* Wallet Card */}
      <CampusWalletCard />

      {/* Sub tabs */}
      <div className="flex bg-white/80 p-1.5 rounded-[2rem] border border-rose-100 gap-1.5 backdrop-blur-md shadow-sm">
        <button
          onClick={() => setActiveTab('track')}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'track' 
              ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-md shadow-red-500/10' 
              : 'text-gray-500 hover:text-red-500 hover:bg-gray-100/50'
          }`}
        >
          <History className="w-4 h-4" />
          Theo dõi đơn hàng ({myOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'create' 
              ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-md shadow-red-500/10' 
              : 'text-gray-500 hover:text-red-500 hover:bg-gray-100/50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Tạo đơn hàng mới
        </button>
      </div>

      {/* TRACK TAB */}
      {activeTab === 'track' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">Lịch sử đơn đặt của bạn</h2>
            <span className="text-[10px] text-gray-500 font-semibold flex items-center gap-1">⏱️ Realtime</span>
          </div>

          {myOrders.length === 0 ? (
            <div className="bg-white border border-rose-100 rounded-[2rem] py-12 px-6 text-center shadow-sm flex flex-col items-center justify-center gap-3.5 backdrop-blur-md">
              <span className="text-4xl filter drop-shadow-md">📦</span>
              <h3 className="font-bold text-gray-800 text-sm">Bạn chưa có đơn đặt nào</h3>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                Hãy click qua tab &quot;Tạo đơn hàng mới&quot; ở trên để gửi đơn đồ ăn, trà sữa hoặc in tài liệu học tập ngay nhé!
              </p>
            </div>
          ) : (
            myOrders.map((o) => {
              const hasShipper = !!o.shipper_id;
              const isFinished = o.status === 'hoan_thanh';
              const alreadyRated = ratings.some(r => r.order_id === o.id && r.from_id === 'user-cust-1');

              return (
                <div 
                  key={o.id}
                  className="bg-white/95 backdrop-blur-md border border-rose-100 rounded-[2rem] p-5 shadow-sm hover:border-red-500/30 hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
                  <div className="flex justify-between items-start gap-4 relative z-10">
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner ${
                        o.order_type === 'do_an' ? 'bg-amber-950/40 text-amber-500 border border-amber-900/20' :
                        o.order_type === 'do_uong' ? 'bg-blue-950/40 text-blue-500 border border-blue-900/20' : 'bg-violet-950/40 text-violet-500 border border-violet-900/20'
                      }`}>
                        {o.order_type === 'do_an' ? <Pizza className="w-5 h-5" /> :
                         o.order_type === 'do_uong' ? <Coffee className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-100 text-sm leading-snug">{o.title}</h4>
                        <p className="text-[10px] text-zinc-400 font-semibold mt-1">{new Date(o.created_at).toLocaleTimeString('vi-VN')} - {o.order_type === 'in_an' ? 'Tài liệu in' : 'Giao nhận'}</p>
                      </div>
                    </div>
                    {getStatusBadge(o.status)}
                  </div>

                  <div className="bg-zinc-950/80 border border-zinc-900/50 rounded-2xl p-3.5 text-xs text-zinc-300 grid grid-cols-2 gap-2 shadow-inner">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <span className="truncate"><b>Giao:</b> {o.delivery_location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span><b>Phí ship:</b> {o.shipping_fee.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                    {o.notes && (
                      <div className="col-span-2 text-[11px] text-zinc-400 border-t border-zinc-900/60 pt-2 mt-1">
                        💡 <b>Ghi chú:</b> {o.notes}
                      </div>
                    )}
                  </div>

                  <OrderStatusTimeline status={o.status} />

                  {/* Printing parameters */}
                  {o.printing_details && (
                    <div className="border border-red-950/60 bg-red-950/10 rounded-2xl p-3.5 flex flex-col gap-1.5 text-xs text-red-200/90 shadow-sm">
                      <div className="flex items-center justify-between font-semibold border-b border-red-950/60 pb-1.5">
                        <span className="flex items-center gap-1 text-[11px]"><FileDown className="w-3.5 h-3.5 text-red-400" /> File: {o.printing_details.file_name}</span>
                        <span className="text-[10px] bg-red-950/50 border border-red-900/20 px-2 py-0.5 rounded-full font-bold">x{o.printing_details.copies} bản in</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-semibold text-red-300/80 pt-0.5">
                        <span>• Chế độ in: {o.printing_details.is_color ? 'In MÀU' : 'In Đen Trắng'}</span>
                        <span>• Mặt in: {o.printing_details.is_double_sided ? 'In 2 Mặt' : 'In 1 Mặt'}</span>
                      </div>
                    </div>
                  )}

                  {/* Map and Chat Active controls */}
                  {hasShipper && !isFinished && (
                    <div className="flex gap-2 border-t border-zinc-900/80 pt-3">
                      <button
                        type="button"
                        onClick={() => setSelectedMapOrder(o)}
                        className="flex-1 bg-red-950/30 hover:bg-red-950/60 text-red-300 text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 border border-red-900/30 active:scale-95"
                      >
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        Xem lộ trình (Map)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedChatOrder(o)}
                        className="flex-1 bg-zinc-900 hover:bg-[#1c1314]/60 text-zinc-100 text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 border border-zinc-800 hover:border-red-900/30 active:scale-95 shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                        Nhắn tin shipper
                      </button>
                    </div>
                  )}

                  {/* Shipper Details */}
                  {hasShipper ? (
                    <div className="border-t border-zinc-900/60 pt-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={o.shipper_avatar} 
                          alt={o.shipper_name}
                          className="w-8 h-8 rounded-full border border-zinc-800"
                        />
                        <div>
                          <p className="text-xs font-bold text-zinc-200 leading-tight">{o.shipper_name}</p>
                          <p className="text-[10px] text-amber-500 font-semibold mt-0.5 flex items-center gap-1">🚴 Shipper nội khu trường</p>
                        </div>
                      </div>
                      
                      {/* Rating action when order completed */}
                      {isFinished && !alreadyRated && ratingOrderId !== o.id && (
                        <button
                          onClick={() => setRatingOrderId(o.id)}
                          className="bg-red-900/20 hover:bg-red-900/40 text-red-300 border border-red-900/30 text-[11px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors duration-200"
                        >
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
                          Đánh giá Shipper
                        </button>
                      )}

                      {isFinished && alreadyRated && (
                        <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1 bg-zinc-950/60 py-1 px-2.5 rounded-lg border border-zinc-900/40">
                          <Check className="w-3 h-3 text-emerald-500" /> Đã đánh giá 5★
                        </span>
                      )}
                    </div>
                  ) : o.status === 'cho_nhan' ? (
                    <div className="border-t border-zinc-900/60 pt-3 text-[11px] text-zinc-500 flex items-center justify-between">
                      <span className="flex items-center gap-1 animate-pulse"><Clock className="w-3.5 h-3.5 text-amber-500" /> Đang tìm shipper xung quanh...</span>
                    </div>
                  ) : null}

                  {/* Rating Collapse Panel */}
                  {ratingOrderId === o.id && (
                    <div className="bg-zinc-950/60 border border-zinc-900/80 rounded-2xl p-4 mt-1 flex flex-col gap-3 animate-in slide-in-from-top-1">
                      <div className="flex items-center justify-between border-b border-zinc-900/60 pb-1.5">
                        <span className="text-xs font-bold text-zinc-300">Đánh giá 2 chiều (Chỉ có tại BK Ship)</span>
                        <button 
                          onClick={() => setRatingOrderId(null)}
                          className="text-[10px] font-bold text-zinc-550 hover:text-zinc-300"
                        >
                          Đóng
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-zinc-400 mr-2">Chọn mức độ hài lòng:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRatingScore(star)}
                            className="p-0.5"
                          >
                            <Star className={`w-5 h-5 ${star <= ratingScore ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Viết bình luận cho Shipper</label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                          <input
                            type="text"
                            required
                            placeholder="Giao hàng siêu nhanh, thân thiện dễ thương..."
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-red-600 transition-colors"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleRatingSubmit(o.id, o.shipper_id!)}
                        className="w-full bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white font-bold py-2 rounded-xl text-xs transition-all duration-200 shadow-md"
                      >
                        Gửi đánh giá & Cộng điểm uy tín
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CREATE TAB */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateOrder} className="bg-zinc-900/30 border border-zinc-800/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-white">Đặt giao hàng mới</h2>
            <p className="text-xs text-zinc-400">Tự động kết nối shipper tiện đường đi học của bạn.</p>
          </div>

          {/* Select Category */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">1. Chọn loại đơn hàng</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('do_an')}
                className={`relative overflow-hidden py-4 px-2 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-2 group ${
                  orderType === 'do_an' 
                    ? 'border-red-900/50 bg-gradient-to-br from-red-950/40 to-[#2c1d1f] text-red-400 font-extrabold shadow-[0_8px_25px_rgba(185,28,28,0.25)] scale-[1.02]' 
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-red-900/30 hover:bg-red-950/20 hover:shadow-sm'
                }`}
              >
                <div className={`p-2.5 rounded-full transition-colors duration-300 ${orderType === 'do_an' ? 'bg-red-950/60 shadow-inner' : 'bg-zinc-950 group-hover:bg-red-950/30'}`}>
                  <Pizza className={`w-6 h-6 transition-transform duration-300 ${orderType === 'do_an' ? 'text-red-500 scale-110' : 'text-zinc-500 group-hover:text-red-400'}`} />
                </div>
                <span className="text-[11px] tracking-wide font-bold">Đồ ăn</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('do_uong')}
                className={`relative overflow-hidden py-4 px-2 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-2 group ${
                  orderType === 'do_uong' 
                    ? 'border-amber-900/50 bg-gradient-to-br from-amber-950/40 to-[#2d2518] text-amber-400 font-extrabold shadow-[0_8px_25px_rgba(245,158,11,0.25)] scale-[1.02]' 
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-amber-900/30 hover:bg-amber-950/20 hover:shadow-sm'
                }`}
              >
                <div className={`p-2.5 rounded-full transition-colors duration-300 ${orderType === 'do_uong' ? 'bg-amber-950/60 shadow-inner' : 'bg-zinc-950 group-hover:bg-amber-950/30'}`}>
                  <Coffee className={`w-6 h-6 transition-transform duration-300 ${orderType === 'do_uong' ? 'text-amber-500 scale-110' : 'text-zinc-500 group-hover:text-amber-400'}`} />
                </div>
                <span className="text-[11px] tracking-wide font-bold">Thức uống</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('in_an')}
                className={`relative overflow-hidden py-4 px-2 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-2 group ${
                  orderType === 'in_an' 
                    ? 'border-indigo-900/50 bg-gradient-to-br from-indigo-950/40 to-[#1d1e2c] text-indigo-400 font-extrabold shadow-[0_8px_25px_rgba(99,102,241,0.25)] scale-[1.02]' 
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-indigo-900/30 hover:bg-indigo-950/20 hover:shadow-sm'
                }`}
              >
                <div className={`p-2.5 rounded-full transition-colors duration-300 ${orderType === 'in_an' ? 'bg-indigo-950/60 shadow-inner' : 'bg-zinc-950 group-hover:bg-indigo-950/30'}`}>
                  <FileText className={`w-6 h-6 transition-transform duration-300 ${orderType === 'in_an' ? 'text-indigo-500 scale-110' : 'text-zinc-500 group-hover:text-indigo-400'}`} />
                </div>
                <span className="text-[11px] tracking-wide font-bold">In ấn PDF</span>
              </button>
            </div>
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-4">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">2. Thông tin chi tiết đơn</label>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-zinc-350">Tên món hoặc Tên tài liệu cần in *</label>
              <input
                type="text"
                required
                placeholder={orderType === 'do_an' ? 'Bánh mì thịt nướng cổng Parabol' : orderType === 'do_uong' ? 'Trà sữa KOI Thé Size M' : 'In tài liệu Ôn thi Pháp luật đại cương'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-zinc-950 border border-zinc-800/80 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-zinc-350">Mô tả chi tiết mua hộ / Ghi chú cho shipper</label>
              <textarea
                placeholder={orderType === 'do_an' ? 'Quán bán ở vỉa hè cạnh nhà sách, mua nhiều rau giúp em nhé...' : 'In file PDF đã tải lên ở dưới'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-zinc-950 border border-zinc-800/80 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-red-600 transition-colors h-16 resize-none"
              />
            </div>

            {/* Printing Options panel */}
            {orderType === 'in_an' && (
              <div className="border border-indigo-950/60 bg-indigo-950/10 rounded-2xl p-4 flex flex-col gap-4">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Tùy chọn file in PDF</span>
                </div>

                {/* PDF Simulation Upload */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Upload tài liệu học tập (*.pdf)</span>
                  <div className="border border-dashed border-indigo-900/40 bg-zinc-950/80 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-600 hover:bg-[#1d1e2c]/20 hover:shadow-inner transition-all duration-300 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2 relative z-0">
                        <div className="h-1.5 w-32 bg-indigo-950 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                        </div>
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Đang phân tích file...</span>
                      </div>
                    ) : pdfFileName ? (
                      <div className="flex flex-col items-center gap-2 relative z-0">
                        <div className="bg-emerald-950/80 p-3 rounded-full shadow-sm mb-1 border border-emerald-900/30">
                          <FileUp className="w-8 h-8 text-emerald-400 animate-bounce" />
                        </div>
                        <span className="text-sm font-extrabold text-zinc-200 max-w-[220px] truncate">{pdfFileName}</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md font-bold uppercase tracking-wide border border-emerald-900/30">Tải lên thành công</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 relative z-0">
                        <div className="bg-indigo-950/80 p-3 rounded-full group-hover:scale-110 group-hover:shadow-md transition-all duration-300 mb-1 border border-indigo-900/20">
                          <FileUp className="w-8 h-8 text-indigo-400" />
                        </div>
                        <span className="text-xs font-bold text-indigo-300">Kéo thả hoặc click để chọn file PDF</span>
                        <span className="text-[10px] text-zinc-500 font-medium">Hỗ trợ file tối đa 20MB</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Số bản in</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={copies}
                      onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-600 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Chế độ in</span>
                    <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => setIsColor(false)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg ${!isColor ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                      >
                        B&W
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsColor(true)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg ${isColor ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                      >
                        Màu
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Số mặt in</span>
                    <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => setIsDoubleSided(true)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg ${isDoubleSided ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                      >
                        2 Mặt
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDoubleSided(false)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg ${!isDoubleSided ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                      >
                        1 Mặt
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tính toán chi phí in ấn mô phỏng */}
                <div className="bg-zinc-950 rounded-xl p-3 border border-indigo-950/60 flex items-center justify-between shadow-inner">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Tạm tính phí in</span>
                    <span className="text-[9px] text-zinc-550">Mock: 10 trang x {isColor ? '2.000đ' : '500đ'}/trang</span>
                  </div>
                  <span className="text-sm font-extrabold text-indigo-400">
                    {(copies * 10 * (isColor ? 2000 : 500)).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center px-0.5">
                  <label className="text-[11px] font-bold text-zinc-350">Vị trí giao hàng *</label>
                  <button
                    type="button"
                    onClick={() => setIsSelectingLocationOnMap(true)}
                    className="text-[10px] text-red-400 hover:text-red-300 font-extrabold flex items-center gap-0.5 hover:underline"
                  >
                    📍 Chọn từ Bản đồ
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="VD: Phòng tự học Tạ Quang Bửu"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl pl-9 pr-3 py-3 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-zinc-350">Số điện thoại liên hệ *</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0987654321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl pl-9 pr-3 py-3 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-zinc-350 flex justify-between">
                <span>Phí Ship trả sinh viên (Tip) *</span>
                <span className="text-zinc-500">Tối thiểu: 5.000 VNĐ</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="number"
                  required
                  min={5000}
                  step={1000}
                  placeholder="VD: 15000"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl pl-9 pr-3 py-3 text-xs text-white font-bold placeholder-zinc-650 focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>
            </div>

            {/* Giá tiền hàng dự kiến (Chỉ hiện khi là food hoặc drink) */}
            {(orderType === 'do_an' || orderType === 'do_uong') && (
              <div className="border border-amber-950/60 bg-amber-950/10 rounded-2xl p-4 flex flex-col gap-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    Giá tiền hàng dự kiến *
                  </label>
                  <span className="text-[10px] text-zinc-500">Shipper ứng trước mua hộ</span>
                </div>
                
                <div className="relative">
                  <span className="absolute left-3 top-3 text-xs font-bold text-zinc-550">đ</span>
                  <input
                    type="number"
                    required
                    min={5000}
                    step={5000}
                    placeholder="VD: 30000"
                    value={itemCost}
                    onChange={(e) => setItemCost(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-3 text-xs text-white font-extrabold focus:outline-none focus:border-amber-600 transition-colors"
                  />
                </div>

                {/* Preset quick-select buttons */}
                <div className="flex gap-2">
                  {[20000, 35000, 50000, 100000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setItemCost(preset)}
                      className={`flex-1 py-2 px-1 text-[10px] font-bold rounded-lg border transition-all duration-200 ${
                        itemCost === preset
                          ? 'bg-gradient-to-r from-red-600 to-amber-500 border-transparent text-white shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      {preset.toLocaleString('vi-VN')} đ
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mã Giảm Giá */}
            <div className="flex flex-col gap-1.5 mt-1">
              <label className="text-[11px] font-bold text-zinc-350">Mã giảm giá / Khuyến mãi</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Ticket className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="VD: FREESHIP, TANBINH..."
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl pl-9 pr-3 py-3 text-xs text-white font-bold placeholder-zinc-650 focus:outline-none focus:border-red-600 transition-colors uppercase"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="btn-primary text-xs px-4"
                >
                  Áp dụng
                </button>
              </div>
              {appliedPromo && (
                <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-1 px-0.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Đã áp dụng mã {appliedPromo.code}: Giảm {appliedPromo.discount.toLocaleString('vi-VN')}đ
                </p>
              )}
            </div>
          </div>

          {/* Tóm tắt thanh toán COD */}
          <div className="bg-[#1c1314] text-white rounded-[2rem] p-4 flex flex-col gap-3.5 border border-red-950/60 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-center border-b border-red-950/40 pb-2">
              <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Hình thức thanh toán</span>
              <span className="text-[10px] bg-red-950/40 text-red-400 border border-red-900/30 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-inner">
                🤝 Tiền mặt (COD) Nội khu
              </span>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span>Tiền hàng cần chuẩn bị:</span>
                <span className="font-semibold text-zinc-100">
                  {currentPricing.estimatedItemCost.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Phí ship trả Shipper (Tip COD):</span>
                <span className="font-semibold text-zinc-100">
                  {Number(shippingFee).toLocaleString('vi-VN')} đ
                </span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Khuyến mãi ({appliedPromo.code}):</span>
                  <span>- {appliedPromo.discount.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              <div className="flex justify-between items-end border-t border-zinc-800/80 pt-2.5 mt-0.5">
                <span className="text-[11px] font-bold text-zinc-400">Tổng cộng tiền mặt cần trả:</span>
                <div className="flex flex-col items-end">
                  {appliedPromo && (
                    <span className="text-[10px] text-zinc-550 line-through mb-0.5">
                      {((orderType === 'in_an'
                        ? (copies * 10 * (isColor ? 2000 : 500))
                        : Number(itemCost)) + Number(shippingFee)).toLocaleString('vi-VN')} đ
                    </span>
                  )}
                  <span className="text-base font-extrabold text-amber-400">
                      {Math.max(0, currentPricing.totalAmount - (appliedPromo?.discount || 0)).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-[9px] text-zinc-400 leading-normal flex items-start gap-1 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-900/60">
              💡 <span>Bạn <b>không bị trừ số dư trước</b>. Hãy chuẩn bị sẵn tiền mặt và trả cho Shipper khi giao hàng thành công. Shipper sẽ tự ứng trước tiền tại quán.</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-primary active:scale-[0.98] text-xs flex items-center justify-center gap-2 mt-2"
          >
            Đăng đơn hàng lên Bảng tin
          </button>
        </form>
      )}

      {/* Overlays */}
      {isSelectingLocationOnMap && (
        <CampusMap 
          onSelectLocation={(selectedLabel) => {
            setLocation(selectedLabel);
            setIsSelectingLocationOnMap(false);
          }}
          onClose={() => setIsSelectingLocationOnMap(false)}
        />
      )}
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
