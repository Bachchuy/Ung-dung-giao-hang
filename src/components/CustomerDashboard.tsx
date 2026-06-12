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
  
  // Order Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [selectedBuilding, setSelectedBuilding] = useState<string>('taquangbuu');
  const [roomNumber, setRoomNumber] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [location, setLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'tien_mat' | 'chuyen_khoan'>('tien_mat');

  // Auto update location string based on building and room inputs
  React.useEffect(() => {
    const LANDMARKS_LABELS: Record<string, string> = {
      taquangbuu: 'Thư viện Tạ Quang Bửu',
      parabol: 'Cổng Parabol',
      d3: 'Nhà D3 (Canteen)',
      b10: 'KTX B10 (Khu B)',
      d8: 'Nhà D8 (Trung tâm in)'
    };
    if (selectedBuilding === 'other') {
      setLocation(roomNumber ? `${customLocation} (Phòng ${roomNumber})` : customLocation);
    } else {
      const buildingLabel = LANDMARKS_LABELS[selectedBuilding] || '';
      setLocation(roomNumber ? `${buildingLabel} - Phòng ${roomNumber}` : buildingLabel);
    }
  }, [selectedBuilding, roomNumber, customLocation]);

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

    const paymentLabel = paymentMethod === 'tien_mat' ? 'Tiền mặt' : 'Chuyển khoản';
    const finalNotes = `[Thanh toán: ${paymentLabel}] ${appliedPromo ? `[Đã áp dụng mã ${appliedPromo.code} giảm ${appliedPromo.discount.toLocaleString('vi-VN')}đ] ` : ''}${notes}`;

    const orderData = {
      title,
      description,
      order_type: orderType,
      delivery_location: location,
      phone_number: phone,
      notes: finalNotes,
      shipping_fee: Number(shippingFee),
      item_cost: currentPricing.estimatedItemCost,
      payment_method: paymentMethod
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
      setPaymentMethod('tien_mat');
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
                  className="bg-white/95 backdrop-blur-md border border-amber-300 rounded-[2rem] p-5 shadow-sm hover:border-amber-500 hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
                  <div className="flex justify-between items-start gap-4 relative z-10">
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner ${
                        o.order_type === 'do_an' ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                        o.order_type === 'do_uong' ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-violet-100 text-violet-600 border border-violet-200'
                      }`}>
                        {o.order_type === 'do_an' ? <Pizza className="w-5 h-5" /> :
                         o.order_type === 'do_uong' ? <Coffee className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-snug">{o.title}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">{new Date(o.created_at).toLocaleTimeString('vi-VN')} - {o.order_type === 'in_an' ? 'Tài liệu in' : 'Giao nhận'}</p>
                      </div>
                    </div>
                    {getStatusBadge(o.status)}
                  </div>

                  <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 text-xs text-slate-700 grid grid-cols-2 gap-2 shadow-inner">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <span className="truncate"><b className="text-slate-800">Giao:</b> {o.delivery_location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span><b className="text-slate-800">Phí ship:</b> {o.shipping_fee.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                    <div className="col-span-2 border-t border-amber-200/80 pt-2 flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-600">
                        <b className="text-slate-800">Thanh toán:</b> {o.payment_method === 'chuyen_khoan' || o.notes?.includes('Thanh toán: Chuyển khoản') ? '💳 Chuyển khoản' : '💵 Tiền mặt (COD)'}
                      </span>
                    </div>
                    {o.notes && (
                      <div className="col-span-2 text-[11px] text-slate-600 border-t border-amber-200/80 pt-2 mt-1">
                        💡 <b className="text-slate-800">Ghi chú:</b> {o.notes}
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
                    <div className="flex gap-2 border-t border-amber-300 pt-3">
                      <button
                        type="button"
                        onClick={() => setSelectedMapOrder(o)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 border border-red-200 active:scale-95 shadow-sm"
                      >
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        Xem lộ trình (Map)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedChatOrder(o)}
                        className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 border border-amber-300 active:scale-95 shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                        Nhắn tin shipper
                      </button>
                    </div>
                  )}

                  {/* Shipper Details */}
                  {hasShipper ? (
                    <div className="border-t border-amber-200 pt-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={o.shipper_avatar} 
                          alt={o.shipper_name}
                          className="w-8 h-8 rounded-full border border-amber-300"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight">{o.shipper_name}</p>
                          <p className="text-[10px] text-amber-600 font-semibold mt-0.5 flex items-center gap-1">🚴 Shipper nội khu trường</p>
                        </div>
                      </div>
                      
                      {/* Rating action when order completed */}
                      {isFinished && !alreadyRated && ratingOrderId !== o.id && (
                        <button
                          onClick={() => setRatingOrderId(o.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors duration-200"
                        >
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500 animate-pulse" />
                          Đánh giá Shipper
                        </button>
                      )}

                      {isFinished && alreadyRated && (
                        <span className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1 bg-emerald-50 py-1 px-2.5 rounded-lg border border-emerald-250">
                          <Check className="w-3 h-3 text-emerald-600" /> Đã đánh giá 5★
                        </span>
                      )}
                    </div>
                  ) : o.status === 'cho_nhan' ? (
                    <div className="border-t border-amber-200 pt-3 text-[11px] text-slate-600 flex items-center justify-between">
                      <span className="flex items-center gap-1 animate-pulse"><Clock className="w-3.5 h-3.5 text-amber-600" /> Đang tìm shipper xung quanh...</span>
                    </div>
                  ) : null}

                  {/* Rating Collapse Panel */}
                  {ratingOrderId === o.id && (
                    <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 mt-1 flex flex-col gap-3 animate-in slide-in-from-top-1">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                        <span className="text-xs font-bold text-slate-800">Đánh giá 2 chiều (Chỉ có tại BK Ship)</span>
                        <button 
                          onClick={() => setRatingOrderId(null)}
                          className="text-[10px] font-bold text-slate-500 hover:text-slate-850"
                        >
                          Đóng
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-700 mr-2 font-medium">Chọn mức độ hài lòng:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRatingScore(star)}
                            className="p-0.5"
                          >
                            <Star className={`w-5 h-5 ${star <= ratingScore ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider">Viết bình luận cho Shipper</label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="Giao hàng siêu nhanh, thân thiện dễ thương..."
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                            className="w-full bg-white border-2 border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleRatingSubmit(o.id, o.shipper_id!)}
                        className="w-full bg-gradient-to-r from-red-650 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white font-bold py-2 rounded-xl text-xs transition-all duration-200 shadow-md"
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
        <form onSubmit={handleCreateOrder} className="bg-amber-50/95 border-2 border-amber-400 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(251,191,36,0.1)] flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-black text-amber-950">Đặt giao hàng mới</h2>
            <p className="text-xs text-slate-700 font-medium">Tự động kết nối shipper tiện đường đi học của bạn.</p>
          </div>

          {/* Select Category */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-amber-900 uppercase tracking-wider">1. Chọn loại đơn hàng</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('do_an')}
                className={`relative overflow-hidden py-4 px-2 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-2 group ${
                  orderType === 'do_an' 
                    ? 'border-red-600 bg-red-50 text-red-800 font-extrabold shadow-[0_8px_25px_rgba(220,38,38,0.15)] scale-[1.02]' 
                    : 'border-amber-300 bg-white text-slate-700 hover:border-amber-450 hover:bg-amber-50/50 hover:shadow-sm'
                }`}
              >
                <div className={`p-2.5 rounded-full transition-colors duration-300 ${orderType === 'do_an' ? 'bg-red-100 shadow-inner' : 'bg-slate-100 group-hover:bg-red-100/50'}`}>
                  <Pizza className={`w-6 h-6 transition-transform duration-300 ${orderType === 'do_an' ? 'text-red-650 scale-110' : 'text-slate-500 group-hover:text-red-500'}`} />
                </div>
                <span className="text-[11px] tracking-wide font-bold">Đồ ăn</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('do_uong')}
                className={`relative overflow-hidden py-4 px-2 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-2 group ${
                  orderType === 'do_uong' 
                    ? 'border-amber-500 bg-amber-100 text-amber-950 font-extrabold shadow-[0_8px_25px_rgba(245,158,11,0.15)] scale-[1.02]' 
                    : 'border-amber-300 bg-white text-slate-700 hover:border-amber-450 hover:bg-amber-50/50 hover:shadow-sm'
                }`}
              >
                <div className={`p-2.5 rounded-full transition-colors duration-300 ${orderType === 'do_uong' ? 'bg-amber-200 shadow-inner' : 'bg-slate-100 group-hover:bg-amber-100/55'}`}>
                  <Coffee className={`w-6 h-6 transition-transform duration-300 ${orderType === 'do_uong' ? 'text-amber-650 scale-110' : 'text-slate-500 group-hover:text-amber-600'}`} />
                </div>
                <span className="text-[11px] tracking-wide font-bold">Thức uống</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('in_an')}
                className={`relative overflow-hidden py-4 px-2 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-2 group ${
                  orderType === 'in_an' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-extrabold shadow-[0_8px_25px_rgba(99,102,241,0.15)] scale-[1.02]' 
                    : 'border-amber-300 bg-white text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/20 hover:shadow-sm'
                }`}
              >
                <div className={`p-2.5 rounded-full transition-colors duration-300 ${orderType === 'in_an' ? 'bg-indigo-100 shadow-inner' : 'bg-slate-100 group-hover:bg-indigo-100/55'}`}>
                  <FileText className={`w-6 h-6 transition-transform duration-300 ${orderType === 'in_an' ? 'text-indigo-600 scale-110' : 'text-slate-500 group-hover:text-indigo-500'}`} />
                </div>
                <span className="text-[11px] tracking-wide font-bold">In ấn PDF</span>
              </button>
            </div>
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-4">
            <label className="text-xs font-black text-amber-900 uppercase tracking-wider">2. Thông tin chi tiết đơn</label>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-800">Tên món hoặc Tên tài liệu cần in *</label>
              <input
                type="text"
                required
                placeholder={orderType === 'do_an' ? 'Bánh mì thịt nướng cổng Parabol' : orderType === 'do_uong' ? 'Trà sữa KOI Thé Size M' : 'In tài liệu Ôn thi Pháp luật đại cương'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white border-2 border-amber-400 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-semibold transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-800">Mô tả chi tiết mua hộ / Ghi chú cho shipper</label>
              <textarea
                placeholder={orderType === 'do_an' ? 'Quán bán ở vỉa hè cạnh nhà sách, mua nhiều rau giúp em nhé...' : 'In file PDF đã tải lên ở dưới'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white border-2 border-amber-400 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-semibold transition-colors h-16 resize-none"
              />
            </div>

            {/* Printing Options panel */}
            {orderType === 'in_an' && (
              <div className="border-2 border-indigo-400 bg-indigo-50/50 rounded-2xl p-4 flex flex-col gap-4">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-700" />
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Tùy chọn file in PDF</span>
                </div>

                {/* PDF Simulation Upload */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Upload tài liệu học tập (*.pdf)</span>
                  <div className="border-2 border-dashed border-indigo-400 bg-white rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-600 hover:bg-indigo-50/50 hover:shadow-inner transition-all duration-300 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2 relative z-0">
                        <div className="h-1.5 w-32 bg-indigo-200 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                        </div>
                        <span className="text-[10px] text-indigo-750 font-bold uppercase tracking-wider">Đang phân tích file...</span>
                      </div>
                    ) : pdfFileName ? (
                      <div className="flex flex-col items-center gap-2 relative z-0">
                        <div className="bg-emerald-100 p-3 rounded-full shadow-sm mb-1 border border-emerald-300">
                          <FileUp className="w-8 h-8 text-emerald-600 animate-bounce" />
                        </div>
                        <span className="text-sm font-extrabold text-slate-800 max-w-[220px] truncate">{pdfFileName}</span>
                        <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md font-bold uppercase tracking-wide border border-emerald-300">Tải lên thành công</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 relative z-0">
                        <div className="bg-indigo-100 p-3 rounded-full group-hover:scale-110 group-hover:shadow-md transition-all duration-300 mb-1 border border-indigo-200">
                          <FileUp className="w-8 h-8 text-indigo-650" />
                        </div>
                        <span className="text-xs font-bold text-indigo-900">Kéo thả hoặc click để chọn file PDF</span>
                        <span className="text-[10px] text-slate-500 font-medium">Hỗ trợ file tối đa 20MB</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Số bản in</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={copies}
                      onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
                      className="bg-white border-2 border-amber-400 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Chế độ in</span>
                    <div className="flex bg-white border-2 border-amber-400 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => setIsColor(false)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg ${!isColor ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        B&W
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsColor(true)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg ${isColor ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Màu
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Số mặt in</span>
                    <div className="flex bg-white border-2 border-amber-400 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => setIsDoubleSided(true)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg ${isDoubleSided ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        2 Mặt
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDoubleSided(false)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg ${!isDoubleSided ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        1 Mặt
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tính toán chi phí in ấn mô phỏng */}
                <div className="bg-white rounded-xl p-3 border-2 border-indigo-400 flex items-center justify-between shadow-inner">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-700 uppercase">Tạm tính phí in</span>
                    <span className="text-[9px] text-slate-500">Mock: 10 trang x {isColor ? '2.000đ' : '500đ'}/trang</span>
                  </div>
                  <span className="text-sm font-black text-indigo-700">
                    {(copies * 10 * (isColor ? 2000 : 500)).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-800">Chọn Tòa nhà / Địa điểm giao hàng *</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'taquangbuu', label: 'Tạ Quang Bửu 📚' },
                  { id: 'parabol', label: 'Cổng Parabol 📍' },
                  { id: 'd3', label: 'Nhà D3 (Canteen) 🏢' },
                  { id: 'b10', label: 'KTX B10 🏠' },
                  { id: 'd8', label: 'Nhà D8 (In ấn) 🖨️' },
                  { id: 'other', label: 'Địa điểm khác ✏️' }
                ].map((building) => (
                  <button
                    key={building.id}
                    type="button"
                    onClick={() => setSelectedBuilding(building.id)}
                    className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all duration-200 ${
                      selectedBuilding === building.id
                        ? 'border-amber-500 bg-amber-100 text-amber-950 font-black shadow-sm'
                        : 'border-amber-300 bg-white text-slate-700 hover:border-amber-500'
                    }`}
                  >
                    {building.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {selectedBuilding === 'other' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-800">Nhập địa điểm khác *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="VD: Nhà B1, Sảnh D9..."
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      className="w-full bg-white border-2 border-amber-400 rounded-xl pl-9 pr-3 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-semibold transition-colors"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-800">Địa điểm đã chọn</label>
                  <div className="relative bg-white border-2 border-amber-400 rounded-xl px-4 py-3 text-xs text-slate-800 font-semibold select-none">
                    {selectedBuilding === 'taquangbuu' && 'Thư viện Tạ Quang Bửu 📚'}
                    {selectedBuilding === 'parabol' && 'Cổng Parabol 📍'}
                    {selectedBuilding === 'd3' && 'Nhà D3 (Canteen) 🏢'}
                    {selectedBuilding === 'b10' && 'KTX B10 (Khu B) 🏠'}
                    {selectedBuilding === 'd8' && 'Nhà D8 (Trung tâm in) 🖨️'}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-800">Số phòng / Tầng / Chi tiết</label>
                <input
                  type="text"
                  placeholder="VD: Phòng 402, tầng 3..."
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full bg-white border-2 border-amber-400 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-semibold transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="hidden">
                <input type="text" value={location} readOnly />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-800">Số điện thoại liên hệ *</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0987654321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border-2 border-amber-400 rounded-xl pl-9 pr-3 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-semibold transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-800 flex justify-between">
                <span>Phí Ship trả sinh viên (Tip) *</span>
                <span className="text-slate-500 font-semibold">Tối thiểu: 5.000 VNĐ</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="number"
                  required
                  min={5000}
                  step={1000}
                  placeholder="VD: 15000"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  className="w-full bg-white border-2 border-amber-400 rounded-xl pl-9 pr-3 py-3 text-xs text-slate-900 font-extrabold placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Giá tiền hàng dự kiến (Chỉ hiện khi là food hoặc drink) */}
            {(orderType === 'do_an' || orderType === 'do_uong') && (
              <div className="border-2 border-amber-400 bg-amber-100/50 rounded-2xl p-4 flex flex-col gap-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    Giá tiền hàng dự kiến *
                  </label>
                  <span className="text-[10px] text-slate-700 font-bold">Shipper ứng trước mua hộ</span>
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
                    className="w-full bg-white border-2 border-amber-400 rounded-xl pl-8 pr-3 py-3 text-xs text-slate-900 font-black focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                {/* Preset quick-select buttons */}
                <div className="flex gap-2">
                  {[20000, 35000, 50000, 100000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setItemCost(preset)}
                      className={`flex-1 py-2 px-1 text-[10px] font-bold rounded-lg border-2 transition-all duration-200 ${
                        itemCost === preset
                          ? 'bg-amber-500 border-transparent text-white shadow-sm'
                          : 'bg-white border-amber-450 text-slate-700 hover:border-amber-500'
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
              <label className="text-[11px] font-bold text-slate-800">Mã giảm giá / Khuyến mãi</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Ticket className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="VD: FREESHIP, TANBINH..."
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full bg-white border-2 border-amber-400 rounded-xl pl-9 pr-3 py-3 text-xs text-slate-900 font-bold placeholder-slate-450 focus:outline-none focus:border-amber-500 transition-colors uppercase"
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
                <p className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-xl flex items-center gap-1 mt-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Đã áp dụng mã {appliedPromo.code}: Giảm {appliedPromo.discount.toLocaleString('vi-VN')}đ
                </p>
              )}
            </div>

            {/* Chọn Hình Thức Thanh Toán */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-amber-900 uppercase tracking-wider">3. Chọn hình thức thanh toán</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('tien_mat')}
                  className={`py-3 px-4 rounded-xl border-2 text-center text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                    paymentMethod === 'tien_mat'
                      ? 'border-emerald-500 bg-emerald-100 text-emerald-950 font-black shadow-[0_4px_15px_rgba(16,185,129,0.15)]'
                      : 'border-amber-300 bg-white text-slate-700 hover:border-amber-500'
                  }`}
                >
                  💵 Tiền mặt (COD)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('chuyen_khoan')}
                  className={`py-3 px-4 rounded-xl border-2 text-center text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                    paymentMethod === 'chuyen_khoan'
                      ? 'border-blue-500 bg-blue-100 text-blue-950 font-black shadow-[0_4px_15px_rgba(59,130,246,0.15)]'
                      : 'border-amber-300 bg-white text-slate-700 hover:border-amber-500'
                  }`}
                >
                  💳 Chuyển khoản
                </button>
              </div>
            </div>
          </div>

          {/* Tóm tắt thanh toán */}
          <div className="bg-white text-slate-900 rounded-[2rem] p-5 flex flex-col gap-3.5 border-2 border-amber-400 shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-center border-b border-amber-200 pb-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">Hình thức thanh toán</span>
              {paymentMethod === 'tien_mat' ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-855 border border-emerald-300 font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-inner">
                  🤝 Tiền mặt (COD) Nội khu
                </span>
              ) : (
                <span className="text-[10px] bg-blue-100 text-blue-855 border border-blue-300 font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-inner">
                  💳 Chuyển khoản Ngân hàng
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Tiền hàng cần chuẩn bị:</span>
                <span className="font-bold text-slate-900">
                  {currentPricing.estimatedItemCost.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Phí ship trả Shipper (Tip):</span>
                <span className="font-bold text-slate-900">
                  {Number(shippingFee).toLocaleString('vi-VN')} đ
                </span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-emerald-800 font-black">
                  <span>Khuyến mãi ({appliedPromo.code}):</span>
                  <span>- {appliedPromo.discount.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              <div className="flex justify-between items-end border-t border-amber-200 pt-2.5 mt-0.5">
                <span className="text-[11px] font-bold text-slate-700">
                  {paymentMethod === 'tien_mat' ? 'Tổng cộng tiền mặt cần trả:' : 'Tổng số tiền cần chuyển khoản:'}
                </span>
                <div className="flex flex-col items-end">
                  {appliedPromo && (
                    <span className="text-[10px] text-slate-500 line-through mb-0.5">
                      {((orderType === 'in_an'
                         ? (copies * 10 * (isColor ? 2000 : 500))
                         : Number(itemCost)) + Number(shippingFee)).toLocaleString('vi-VN')} đ
                    </span>
                  )}
                  <span className="text-base font-black text-red-650">
                      {Math.max(0, currentPricing.totalAmount - (appliedPromo?.discount || 0)).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-[9px] text-slate-700 leading-normal flex items-start gap-1 bg-amber-50/50 p-3 rounded-xl border border-amber-300">
              💡 <span>
                {paymentMethod === 'tien_mat' 
                  ? 'Bạn không bị trừ số dư trước. Hãy chuẩn bị sẵn tiền mặt và trả cho Shipper khi giao hàng thành công. Shipper sẽ tự ứng trước tiền tại quán.'
                  : 'Bạn vui lòng chuyển khoản cho Shipper sau khi nhận được hàng thành công. Shipper sẽ tự ứng trước tiền mua hàng.'
                }
              </span>
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
