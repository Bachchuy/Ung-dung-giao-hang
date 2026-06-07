'use client';

import React, { useState } from 'react';
import { useApp, OrderType, OrderStatus, PrintingDetails, Order } from '@/context/AppContext';
import { CampusMap } from './CampusMap';
import { ChatBox } from './ChatBox';
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
      item_cost: orderType === 'in_an' ? (copies * 10 * (isColor ? 2000 : 500)) : Number(itemCost)
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
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 gap-1">
        <button
          onClick={() => setActiveTab('track')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'track' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          Theo dõi đơn hàng ({myOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'create' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Tạo đơn hàng mới
        </button>
      </div>

      {/* TRACK TAB */}
      {activeTab === 'track' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Lịch sử đơn đặt của bạn</h2>
            <span className="text-xs text-slate-500">Tự động cập nhật realtime</span>
          </div>

          {myOrders.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl py-12 px-6 text-center shadow-sm flex flex-col items-center justify-center gap-3">
              <span className="text-4xl">📦</span>
              <h3 className="font-bold text-slate-800 text-sm">Bạn chưa có đơn đặt nào</h3>
              <p className="text-xs text-slate-500 max-w-xs">
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
                  className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-slate-50/10 pointer-events-none" />
                  <div className="flex justify-between items-start gap-4 relative z-10">
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        o.order_type === 'do_an' ? 'bg-amber-50 text-amber-600' :
                        o.order_type === 'do_uong' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'
                      }`}>
                        {o.order_type === 'do_an' ? <Pizza className="w-5 h-5" /> :
                         o.order_type === 'do_uong' ? <Coffee className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{o.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{new Date(o.created_at).toLocaleTimeString('vi-VN')} - {o.order_type === 'in_an' ? 'Tài liệu in' : 'Giao nhận'}</p>
                      </div>
                    </div>
                    {getStatusBadge(o.status)}
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-3 text-xs text-slate-600 grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate"><b>Giao:</b> {o.delivery_location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span><b>Phí ship:</b> {o.shipping_fee.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                    {o.notes && (
                      <div className="col-span-2 text-[11px] text-slate-500 border-t border-slate-200/50 pt-1.5 mt-0.5">
                        💡 <b>Ghi chú:</b> {o.notes}
                      </div>
                    )}
                  </div>

                  {/* Printing parameters */}
                  {o.printing_details && (
                    <div className="border border-violet-100 bg-violet-50/20 rounded-2xl p-3 flex flex-col gap-1.5 text-xs text-violet-900">
                      <div className="flex items-center justify-between font-semibold border-b border-violet-100 pb-1">
                        <span className="flex items-center gap-1"><FileDown className="w-3.5 h-3.5" /> File: {o.printing_details.file_name}</span>
                        <span>x{o.printing_details.copies} bản in</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <span>• Chế độ in: {o.printing_details.is_color ? 'In MÀU' : 'In Đen Trắng'}</span>
                        <span>• Mặt in: {o.printing_details.is_double_sided ? 'In 2 Mặt' : 'In 1 Mặt'}</span>
                      </div>
                    </div>
                  )}

                  {/* Map and Chat Active controls */}
                  {hasShipper && !isFinished && (
                    <div className="flex gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => setSelectedMapOrder(o)}
                        className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 border border-emerald-200/50"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Xem lộ trình (Map)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedChatOrder(o)}
                        className="flex-1 bg-slate-900 hover:bg-slate-850 text-white text-[11px] font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Nhắn tin shipper
                      </button>
                    </div>
                  )}

                  {/* Shipper Details */}
                  {hasShipper ? (
                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={o.shipper_avatar} 
                          alt={o.shipper_name}
                          className="w-8 h-8 rounded-full border border-slate-100"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight">{o.shipper_name}</p>
                          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">🚴 Shipper nội khu trường</p>
                        </div>
                      </div>
                      
                      {/* Rating action when order completed */}
                      {isFinished && !alreadyRated && ratingOrderId !== o.id && (
                        <button
                          onClick={() => setRatingOrderId(o.id)}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors duration-200"
                        >
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          Đánh giá Shipper
                        </button>
                      )}

                      {isFinished && alreadyRated && (
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 bg-slate-50 py-1 px-2.5 rounded-lg">
                          <Check className="w-3 h-3 text-emerald-500" /> Đã đánh giá 5★
                        </span>
                      )}
                    </div>
                  ) : o.status === 'cho_nhan' ? (
                    <div className="border-t border-slate-50 pt-3 text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1 animate-pulse"><Clock className="w-3 h-3 text-amber-500" /> Đang tìm shipper xung quanh...</span>
                    </div>
                  ) : null}

                  {/* Rating Collapse Panel */}
                  {ratingOrderId === o.id && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-1 flex flex-col gap-3 animate-in slide-in-from-top-1">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <span className="text-xs font-bold text-slate-700">Đánh giá 2 chiều (Chỉ có tại BK Ship)</span>
                        <button 
                          onClick={() => setRatingOrderId(null)}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
                        >
                          Đóng
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-600 mr-2">Chọn mức độ hài lòng:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRatingScore(star)}
                            className="p-0.5"
                          >
                            <Star className={`w-5 h-5 ${star <= ratingScore ? 'text-amber-400 fill-amber-400' : 'text-slate-350'}`} />
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Viết bình luận cho Shipper</label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="Giao hàng siêu nhanh, thân thiện dễ thương..."
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-colors"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleRatingSubmit(o.id, o.shipper_id!)}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition-all duration-200"
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
        <form onSubmit={handleCreateOrder} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-800">Đặt giao hàng mới</h2>
            <p className="text-xs text-slate-500">Tự động kết nối shipper tiện đường đi học của bạn.</p>
          </div>

          {/* Select Category */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">1. Chọn loại đơn hàng</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('do_an')}
                className={`relative overflow-hidden py-4 px-2 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-2 group ${
                  orderType === 'do_an' 
                    ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-900 font-extrabold shadow-[0_8px_20px_-8px_rgba(251,191,36,0.5)] scale-[1.02]' 
                    : 'border-slate-200 bg-white text-slate-500 hover:border-amber-200 hover:bg-amber-50/50 hover:shadow-sm'
                }`}
              >
                <div className={`p-2.5 rounded-full transition-colors duration-300 ${orderType === 'do_an' ? 'bg-amber-100 shadow-inner' : 'bg-slate-50 group-hover:bg-amber-100/50'}`}>
                  <Pizza className={`w-6 h-6 transition-transform duration-300 ${orderType === 'do_an' ? 'text-amber-600 scale-110' : 'text-slate-400 group-hover:text-amber-500'}`} />
                </div>
                <span className="text-[11px] tracking-wide">Đồ ăn</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('do_uong')}
                className={`relative overflow-hidden py-4 px-2 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-2 group ${
                  orderType === 'do_uong' 
                    ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-900 font-extrabold shadow-[0_8px_20px_-8px_rgba(59,130,246,0.5)] scale-[1.02]' 
                    : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm'
                }`}
              >
                <div className={`p-2.5 rounded-full transition-colors duration-300 ${orderType === 'do_uong' ? 'bg-blue-100 shadow-inner' : 'bg-slate-50 group-hover:bg-blue-100/50'}`}>
                  <Coffee className={`w-6 h-6 transition-transform duration-300 ${orderType === 'do_uong' ? 'text-blue-600 scale-110' : 'text-slate-400 group-hover:text-blue-500'}`} />
                </div>
                <span className="text-[11px] tracking-wide">Thức uống</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('in_an')}
                className={`relative overflow-hidden py-4 px-2 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-2 group ${
                  orderType === 'in_an' 
                    ? 'border-violet-400 bg-gradient-to-br from-violet-50 to-purple-50 text-violet-900 font-extrabold shadow-[0_8px_20px_-8px_rgba(139,92,246,0.5)] scale-[1.02]' 
                    : 'border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:bg-violet-50/50 hover:shadow-sm'
                }`}
              >
                <div className={`p-2.5 rounded-full transition-colors duration-300 ${orderType === 'in_an' ? 'bg-violet-100 shadow-inner' : 'bg-slate-50 group-hover:bg-violet-100/50'}`}>
                  <FileText className={`w-6 h-6 transition-transform duration-300 ${orderType === 'in_an' ? 'text-violet-600 scale-110' : 'text-slate-400 group-hover:text-violet-500'}`} />
                </div>
                <span className="text-[11px] tracking-wide">In ấn PDF</span>
              </button>
            </div>
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">2. Thông tin chi tiết đơn</label>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-600">Tên món hoặc Tên tài liệu cần in *</label>
              <input
                type="text"
                required
                placeholder={orderType === 'do_an' ? 'Bánh mì thịt nướng cổng Parabol' : orderType === 'do_uong' ? 'Trà sữa KOI Thé Size M' : 'In tài liệu Ôn thi Pháp luật đại cương'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-600">Mô tả chi tiết mua hộ / Ghi chú cho shipper</label>
              <textarea
                placeholder={orderType === 'do_an' ? 'Quán bán ở vỉa hè cạnh nhà sách, mua nhiều rau giúp em nhé...' : 'In file PDF đã tải lên ở dưới'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-colors h-16 resize-none"
              />
            </div>

            {/* Printing Options panel */}
            {orderType === 'in_an' && (
              <div className="border border-violet-100 bg-violet-50/20 rounded-2xl p-4 flex flex-col gap-4">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-violet-600" />
                  <span className="text-xs font-bold text-violet-900 uppercase tracking-wider">Tùy chọn file in PDF</span>
                </div>

                {/* PDF Simulation Upload */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Upload tài liệu học tập (*.pdf)</span>
                  <div className="border-2 border-dashed border-violet-200 bg-white/50 backdrop-blur-sm rounded-2xl p-6 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 hover:shadow-inner transition-all duration-300 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2 relative z-0">
                        <div className="h-1.5 w-32 bg-violet-100 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                        </div>
                        <span className="text-[10px] text-violet-600 font-bold uppercase tracking-wider">Đang phân tích file...</span>
                      </div>
                    ) : pdfFileName ? (
                      <div className="flex flex-col items-center gap-2 relative z-0">
                        <div className="bg-emerald-100 p-3 rounded-full shadow-sm mb-1">
                          <FileUp className="w-8 h-8 text-emerald-600 animate-bounce" />
                        </div>
                        <span className="text-sm font-extrabold text-slate-800 max-w-[220px] truncate">{pdfFileName}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md font-bold uppercase tracking-wide border border-emerald-200">Tải lên thành công</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 relative z-0">
                        <div className="bg-violet-100 p-3 rounded-full group-hover:scale-110 group-hover:shadow-md transition-all duration-300 mb-1">
                          <FileUp className="w-8 h-8 text-violet-600" />
                        </div>
                        <span className="text-xs font-bold text-violet-800">Kéo thả hoặc click để chọn file PDF</span>
                        <span className="text-[10px] text-slate-400 font-medium">Hỗ trợ file tối đa 20MB</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Số bản in</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={copies}
                      onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chế độ in</span>
                    <div className="flex bg-white border border-slate-200 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => setIsColor(false)}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${!isColor ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600'}`}
                      >
                        B&W
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsColor(true)}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${isColor ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600'}`}
                      >
                        Màu
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Số mặt in</span>
                    <div className="flex bg-white border border-slate-200 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => setIsDoubleSided(true)}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${isDoubleSided ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600'}`}
                      >
                        2 Mặt
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDoubleSided(false)}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${!isDoubleSided ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600'}`}
                      >
                        1 Mặt
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tính toán chi phí in ấn mô phỏng */}
                <div className="bg-white rounded-xl p-3 border border-violet-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Tạm tính phí in</span>
                    <span className="text-[9px] text-slate-400">Mock: 10 trang x {isColor ? '2.000đ' : '500đ'}/trang</span>
                  </div>
                  <span className="text-sm font-extrabold text-violet-700">
                    {(copies * 10 * (isColor ? 2000 : 500)).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-600">Vị trí giao hàng *</label>
                  <button
                    type="button"
                    onClick={() => setIsSelectingLocationOnMap(true)}
                    className="text-[10px] text-emerald-600 hover:text-emerald-700 font-extrabold flex items-center gap-0.5 hover:underline"
                  >
                    📍 Chọn từ Bản đồ
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="VD: Phòng tự học Tạ Quang Bửu"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-600">Số điện thoại liên hệ *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0987654321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-600 flex justify-between">
                <span>Phí Ship trả sinh viên (Tip) *</span>
                <span className="text-slate-500">Tối thiểu: 5.000 VNĐ</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="number"
                  required
                  min={5000}
                  step={1000}
                  placeholder="VD: 15000"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 font-bold placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-colors"
                />
              </div>
            </div>

            {/* Giá tiền hàng dự kiến (Chỉ hiện khi là food hoặc drink) */}
            {(orderType === 'do_an' || orderType === 'do_uong') && (
              <div className="border border-amber-100 bg-amber-50/20 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                    Giá tiền hàng dự kiến *
                  </label>
                  <span className="text-[10px] text-slate-400">Shipper ứng trước mua hộ</span>
                </div>
                
                <div className="relative">
                  <span className="absolute left-3 top-3 text-xs font-bold text-slate-500">đ</span>
                  <input
                    type="number"
                    required
                    min={5000}
                    step={5000}
                    placeholder="VD: 30000"
                    value={itemCost}
                    onChange={(e) => setItemCost(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-800 font-extrabold focus:outline-none focus:border-slate-800 transition-colors"
                  />
                </div>

                {/* Preset quick-select buttons */}
                <div className="flex gap-2">
                  {[20000, 35000, 50000, 100000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setItemCost(preset)}
                      className={`flex-1 py-1.5 px-1 text-[10px] font-bold rounded-lg border transition-all duration-200 ${
                        itemCost === preset
                          ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350'
                      }`}
                    >
                      {preset.toLocaleString('vi-VN')} đ
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mã Giảm Giá */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[11px] font-bold text-slate-600">Mã giảm giá / Khuyến mãi</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Ticket className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="VD: FREESHIP, TANBINH..."
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 font-bold placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-colors uppercase"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="bg-slate-900 text-white text-xs font-bold px-4 rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Áp dụng
                </button>
              </div>
              {appliedPromo && (
                <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <Check className="w-3 h-3" />
                  Đã áp dụng mã {appliedPromo.code}: Giảm {appliedPromo.discount.toLocaleString('vi-VN')}đ
                </p>
              )}
            </div>
          </div>

          {/* Tóm tắt thanh toán COD */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col gap-3.5 border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Hình thức thanh toán</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-inner">
                🤝 Tiền mặt (COD) Nội khu
              </span>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Tiền hàng cần chuẩn bị:</span>
                <span className="font-semibold text-slate-100">
                  {orderType === 'in_an'
                    ? (copies * 10 * (isColor ? 2000 : 500)).toLocaleString('vi-VN')
                    : Number(itemCost).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Phí ship trả Shipper (Tip COD):</span>
                <span className="font-semibold text-slate-100">
                  {Number(shippingFee).toLocaleString('vi-VN')} đ
                </span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Khuyến mãi ({appliedPromo.code}):</span>
                  <span>- {appliedPromo.discount.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              <div className="flex justify-between items-end border-t border-slate-800/80 pt-2.5 mt-0.5">
                <span className="text-[11px] font-bold text-slate-400">Tổng cộng tiền mặt cần trả:</span>
                <div className="flex flex-col items-end">
                  {appliedPromo && (
                    <span className="text-[10px] text-slate-500 line-through mb-0.5">
                      {((orderType === 'in_an'
                        ? (copies * 10 * (isColor ? 2000 : 500))
                        : Number(itemCost)) + Number(shippingFee)).toLocaleString('vi-VN')} đ
                    </span>
                  )}
                  <span className="text-base font-extrabold text-amber-400">
                    {Math.max(0, (
                      (orderType === 'in_an'
                        ? (copies * 10 * (isColor ? 2000 : 500))
                        : Number(itemCost)) + Number(shippingFee) - (appliedPromo?.discount || 0)
                    )).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-[9px] text-slate-400/90 leading-normal flex items-start gap-1 bg-slate-950/40 p-2 rounded-xl border border-slate-800/50">
              💡 <span>Bạn <b>không bị trừ số dư trước</b>. Hãy chuẩn bị sẵn tiền mặt và trả cho Shipper khi giao hàng thành công. Shipper sẽ tự ứng trước tiền tại quán.</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-850 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all duration-200 mt-2"
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
