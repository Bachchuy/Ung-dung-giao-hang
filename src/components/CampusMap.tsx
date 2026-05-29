'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bike, Navigation, Info } from 'lucide-react';
import { Order } from '@/context/AppContext';

interface LocationCoordinate {
  name: string;
  x: number;
  y: number;
  label: string;
  icon: string;
  color: string;
}

// Tọa độ chi tiết dựa trên bản đồ ĐHBK Hà Nội (HUST) - Grid 720x450
const LANDMARKS: Record<string, LocationCoordinate> = {
  parabol: { name: 'parabol', label: 'Cổng Parabol', x: 80, y: 240, icon: '🏫', color: 'from-amber-400 to-orange-500' },
  d3: { name: 'd3', label: 'Nhà D3 (Canteen)', x: 435, y: 290, icon: '🍔', color: 'from-blue-400 to-indigo-500' },
  taquangbuu: { name: 'taquangbuu', label: 'Thư viện Tạ Quang Bửu', x: 360, y: 310, icon: '📚', color: 'from-emerald-400 to-teal-500' },
  b10: { name: 'b10', label: 'KTX B10 (Khu B)', x: 550, y: 120, icon: '🏢', color: 'from-violet-400 to-purple-500' },
  d8: { name: 'd8', label: 'Nhà D8 (Trung tâm in)', x: 200, y: 350, icon: '🖨️', color: 'from-pink-400 to-rose-500' }
};

interface CampusMapProps {
  order?: Order; // Optional vì ở chế độ chọn vị trí đặt đơn chưa có đơn hàng
  onClose?: () => void;
  onSelectLocation?: (locationLabel: string) => void; // Thêm prop chọn nhanh địa điểm
}

export const CampusMap: React.FC<CampusMapProps> = ({ order, onClose, onSelectLocation }) => {
  const isSelectorMode = !!onSelectLocation;

  // --- TRẠNG THÁI MÔ PHỎNG LỘ TRÌNH ĐỘNG (Dành cho Rerouting Simulator) ---
  const [localOrigin, setLocalOrigin] = useState<LocationCoordinate>(LANDMARKS.d3);
  const [localDest, setLocalDest] = useState<LocationCoordinate>(LANDMARKS.taquangbuu);
  const [rerouteMessage, setRerouteMessage] = useState<string>('');

  const [progress, setProgress] = useState(0); // 0 to 1
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // --- TRẠNG THÁI PHÓNG TO / THU NHỎ & PAN ---
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Khởi tạo lộ trình ban đầu dựa trên đơn hàng (nếu có)
  useEffect(() => {
    if (!order) return;

    // Xác định Origin
    let startLoc = LANDMARKS.d3;
    if (order.order_type === 'in_an') {
      startLoc = LANDMARKS.d8;
    } else {
      const desc = (order.description || '').toLowerCase();
      const title = (order.title || '').toLowerCase();
      const notes = (order.notes || '').toLowerCase();
      if (desc.includes('parabol') || title.includes('parabol') || notes.includes('parabol') || desc.includes('cổng') || title.includes('cổng')) {
        startLoc = LANDMARKS.parabol;
      } else if (desc.includes('d3') || title.includes('d3')) {
        startLoc = LANDMARKS.d3;
      }
    }
    setLocalOrigin(startLoc);

    // Xác định Destination
    let endLoc = LANDMARKS.taquangbuu;
    const destStr = (order.delivery_location || '').toLowerCase();
    if (destStr.includes('ktx') || destStr.includes('b10') || destStr.includes('ký túc') || destStr.includes('ky tuc')) {
      endLoc = LANDMARKS.b10;
    } else if (destStr.includes('tạ quang bửu') || destStr.includes('ta quang buu') || destStr.includes('thư viện') || destStr.includes('thu vien')) {
      endLoc = LANDMARKS.taquangbuu;
    } else if (destStr.includes('d3')) {
      endLoc = LANDMARKS.d3;
    } else if (destStr.includes('d8')) {
      endLoc = LANDMARKS.d8;
    }
    setLocalDest(endLoc);
  }, [order]);

  // Tính toán điểm kiểm soát uốn cong của đường Bezier
  const getBezierControls = () => {
    let ctrlX = (localOrigin.x + localDest.x) / 2;
    let ctrlY = (localOrigin.y + localDest.y) / 2;
    
    if (localOrigin.name === 'parabol' && localDest.name === 'taquangbuu') {
      ctrlX = 220;
      ctrlY = 190; // Tránh Hồ Tiền phía trên
    } else if (localOrigin.name === 'd8' && localDest.name === 'taquangbuu') {
      ctrlX = 280;
      ctrlY = 350; // Tránh Hồ Tiền phía dưới
    } else if (localOrigin.name === 'parabol' && localDest.name === 'b10') {
      ctrlX = 350;
      ctrlY = 240; // Đi dọc trục chính
    } else if (localOrigin.name === 'd8' && localDest.name === 'b10') {
      ctrlX = 310;
      ctrlY = 240; 
    }

    return { ctrlX, ctrlY };
  };

  const { ctrlX, ctrlY } = getBezierControls();

  // Chạy animation shipper di chuyển
  useEffect(() => {
    const isDelivering = order ? order.status === 'dang_giao' : false;
    
    if (isDelivering) {
      setIsAnimating(true);
      setProgress(0);
      lastTimeRef.current = performance.now();
      
      const animate = (time: number) => {
        const delta = time - lastTimeRef.current;
        lastTimeRef.current = time;
        
        setProgress(prev => {
          const next = prev + delta / 8000; // Tăng tốc độ giao lên 8 giây để xem demo nhanh hơn
          if (next >= 1) {
            return 0; // Lặp lại lộ trình
          }
          return next;
        });
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsAnimating(false);
      setProgress(order && order.status === 'hoan_thanh' ? 1 : 0);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [order?.status, localDest, localOrigin]);

  const getBezierPoint = (t: number) => {
    const x = (1 - t) * (1 - t) * localOrigin.x + 2 * (1 - t) * t * ctrlX + t * t * localDest.x;
    const y = (1 - t) * (1 - t) * localOrigin.y + 2 * (1 - t) * t * ctrlY + t * t * localDest.y;
    return { x, y };
  };

  const shipperPos = getBezierPoint(progress);

  // --- HÀM XỬ LÝ CLICK NHẤP VÀO ĐỊA ĐIỂM (HOTSPOT CLICK) ---
  const handleLandmarkClick = (loc: LocationCoordinate) => {
    if (isSelectorMode) {
      // 1. Chế độ chọn vị trí: Gọi callback trả về tên địa điểm và đóng bản đồ
      if (onSelectLocation) {
        onSelectLocation(loc.label);
      }
    } else if (order && (order.status === 'da_nhan' || order.status === 'dang_giao')) {
      // 2. Chế độ mô phỏng theo dõi đơn: Cho phép click nhấp từ chỗ này sang chỗ khác để "bẻ lộ trình" thời gian thực!
      if (loc.name === localOrigin.name) return; // Không trùng điểm xuất phát
      
      setLocalDest(loc);
      setProgress(0); // Reset shipper về điểm xuất phát để chạy lộ trình mới
      
      setRerouteMessage(`Đang lập lộ trình mới đến: ${loc.label}! ⚡`);
      setTimeout(() => setRerouteMessage(''), 3000);
    }
  };

  // --- HÀM XỬ LÝ KÉO RÊ (PAN) ---
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPanning) return;
    setOffsetX(e.clientX - panStart.x);
    setOffsetY(e.clientY - panStart.y);
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      const touch = e.touches[0];
      setPanStart({ x: touch.clientX - offsetX, y: touch.clientY - offsetY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!isPanning || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffsetX(touch.clientX - panStart.x);
    setOffsetY(touch.clientY - panStart.y);
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    const zoomFactor = 1.1;
    let newScale = scale;
    if (e.deltaY < 0) {
      newScale = Math.min(3, scale * zoomFactor);
    } else {
      newScale = Math.max(0.7, scale / zoomFactor);
    }
    setScale(newScale);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-850 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-950 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/15 p-2.5 rounded-2xl border border-emerald-500/30">
              <Navigation className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">
                {isSelectorMode ? 'Bản đồ Chọn Vị Trí Đặt Đơn' : 'HUST Map (Mô phỏng tương tác)'}
              </h3>
              <p className="text-[10px] text-emerald-400 font-bold mt-0.5">
                {isSelectorMode ? '👉 NHẤP CHUỘT VÀO ĐỊA ĐIỂM TRÊN BẢN ĐỒ ĐỂ CHỌN NHANH' : 
                 order?.status === 'cho_nhan' ? '• Đang tìm shipper giao hàng' : 
                 order?.status === 'da_nhan' ? '• Shipper đã nhận đơn' :
                 order?.status === 'dang_giao' ? '🚴 Nhấp chuột vào một địa điểm bất kỳ để bẻ lộ trình giao!' :
                 order?.status === 'hoan_thanh' ? '🎉 Đã giao hàng thành công' : '• Đơn hàng đã bị hủy'}
              </p>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold py-1.5 px-3 rounded-xl transition-all border border-slate-700/50 shadow-sm"
            >
              Hủy
            </button>
          )}
        </div>

        {/* Map Area */}
        <div className="relative bg-slate-950 p-4 flex justify-center items-center overflow-hidden min-h-[400px]">
          
          {/* Zoom controls floating panel */}
          <div className="absolute right-6 top-6 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl backdrop-blur-md shadow-lg z-10">
            <button
              onClick={() => setScale(prev => Math.min(3, prev + 0.2))}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-100 font-extrabold text-sm flex items-center justify-center transition-colors shadow-sm"
              title="Phóng to"
            >
              +
            </button>
            <button
              onClick={() => setScale(prev => Math.max(0.7, prev - 0.2))}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-100 font-extrabold text-sm flex items-center justify-center transition-colors shadow-sm"
              title="Thu nhỏ"
            >
              -
            </button>
            <button
              onClick={() => {
                setScale(1);
                setOffsetX(0);
                setOffsetY(0);
              }}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-350 hover:text-white text-xs font-extrabold flex items-center justify-center transition-colors shadow-sm"
              title="Đặt lại view"
            >
              ⟲
            </button>
          </div>

          {/* Reroute Alert Banner (Chỉ hiện khi đổi lộ trình simulator) */}
          {rerouteMessage && (
            <div className="absolute left-6 top-6 bg-emerald-500 text-slate-950 text-[10px] font-black px-4 py-2 rounded-2xl shadow-lg border border-emerald-400 animate-bounce z-10 flex items-center gap-1">
              ⚡ {rerouteMessage}
            </div>
          )}

          {/* Subtle grid pattern behind the map */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:30px_30px] opacity-[0.1]" />
          
          <svg 
            className={`w-full h-full max-w-[620px] aspect-[720/450] select-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`} 
            viewBox="0 0 720 450"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            onWheel={handleWheel}
          >
            {/* Group với phép biến hình transform dịch chuyển & thu phóng */}
            <g 
              transform={`translate(${offsetX}, ${offsetY}) scale(${scale})`} 
              style={{ transformOrigin: '360px 225px', transition: isPanning ? 'none' : 'transform 0.15s ease-out' }}
            >
              {/* 1. MẠNG LƯỚI ĐƯỜNG PHỐ (STREET NETWORK) */}
              {/* Đường Giải Phóng */}
              <line x1="70" y1="0" x2="70" y2="450" stroke="#1e293b" strokeWidth="24" strokeLinecap="square" />
              <line x1="70" y1="0" x2="70" y2="450" stroke="#334155" strokeWidth="1.5" strokeDasharray="6, 6" />
              
              {/* Đường Đại Cồ Việt */}
              <line x1="0" y1="18" x2="720" y2="18" stroke="#1e293b" strokeWidth="20" strokeLinecap="square" />
              <line x1="0" y1="18" x2="720" y2="18" stroke="#334155" strokeWidth="1.5" strokeDasharray="6, 6" />

              {/* Trục đường chính Parabol - B8 */}
              <line x1="70" y1="240" x2="650" y2="240" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" />
              <line x1="70" y1="240" x2="650" y2="240" stroke="#334155" strokeWidth="1.5" strokeDasharray="6, 6" />

              {/* Đường Trần Đại Nghĩa (Bên phải) */}
              <line x1="490" y1="18" x2="490" y2="450" stroke="#1e293b" strokeWidth="18" strokeLinecap="square" />
              <line x1="490" y1="18" x2="490" y2="450" stroke="#334155" strokeWidth="1.5" strokeDasharray="6, 6" />

              {/* Các ngõ nhỏ nội bộ */}
              <line x1="310" y1="240" x2="310" y2="385" stroke="#0f172a" strokeWidth="10" strokeLinecap="round" />
              <line x1="310" y1="365" x2="490" y2="365" stroke="#0f172a" strokeWidth="10" strokeLinecap="round" />
              <line x1="170" y1="240" x2="170" y2="365" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />

              {/* Đường đi KTX (Khu B) */}
              <line x1="490" y1="120" x2="680" y2="120" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" />
              <line x1="490" y1="120" x2="680" y2="120" stroke="#334155" strokeWidth="1.2" strokeDasharray="4, 4" />

              {/* 2. CÁC KHU VỰC ĐỊA LÝ & HỒ NƯỚC */}
              {/* Hồ Tiền */}
              <rect x="240" y="280" width="70" height="70" rx="8" fill="#0284c7" fillOpacity="0.25" stroke="#0ea5e9" strokeWidth="1.5" />
              <text x="275" y="320" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">Hồ Tiền 💧</text>

              {/* Sân cỏ quảng trường trung tâm chữ U (Nhà C) */}
              <rect x="210" y="90" width="75" height="110" rx="8" fill="#10b981" fillOpacity="0.04" stroke="#1e293b" strokeWidth="1" />
              <circle cx="247" cy="145" r="15" fill="none" stroke="#1e293b" strokeWidth="1" />

              {/* 3. BẢN ĐỒ CHI TIẾT TÒA NHÀ (CHI TIẾT CHÍNH XÁC) */}
              
              {/* --- KHU NHÀ C (GIẢNG ĐƯỜNG C) --- */}
              {/* C1 (Ngang dài trên cùng) */}
              <rect x="170" y="70" width="220" height="14" rx="3" fill="#ea580c" fillOpacity="0.2" stroke="#f97316" strokeWidth="1" />
              <text x="280" y="81" textAnchor="middle" fill="#fdba74" fontSize="8" fontWeight="bold">Nhà C1</text>
              
              {/* C2 (Dọc trái) */}
              <rect x="170" y="84" width="30" height="70" rx="3" fill="#ea580c" fillOpacity="0.2" stroke="#f97316" strokeWidth="1" />
              <text x="185" y="125" textAnchor="middle" fill="#fdba74" fontSize="8" fontWeight="bold" transform="rotate(-90 185 125)">Nhà C2</text>
              
              {/* C9 (Ngang dưới trái của khu C) */}
              <rect x="140" y="154" width="100" height="14" rx="3" fill="#ea580c" fillOpacity="0.2" stroke="#f97316" strokeWidth="1" />
              <text x="190" y="164" textAnchor="middle" fill="#fdba74" fontSize="8" fontWeight="bold">Nhà C9</text>

              {/* C3, C4, C5 (3 Dãy ngang song song bên phải khu C) */}
              <rect x="290" y="90" width="90" height="12" rx="2" fill="#ea580c" fillOpacity="0.2" stroke="#f97316" strokeWidth="1" />
              <text x="335" y="99" textAnchor="middle" fill="#fdba74" fontSize="7.5" fontWeight="bold">Nhà C3</text>

              <rect x="290" y="114" width="90" height="12" rx="2" fill="#ea580c" fillOpacity="0.2" stroke="#f97316" strokeWidth="1" />
              <text x="335" y="123" textAnchor="middle" fill="#fdba74" fontSize="7.5" fontWeight="bold">Nhà C4</text>

              <rect x="290" y="138" width="90" height="12" rx="2" fill="#ea580c" fillOpacity="0.2" stroke="#f97316" strokeWidth="1" />
              <text x="335" y="147" textAnchor="middle" fill="#fdba74" fontSize="7.5" fontWeight="bold">Nhà C5</text>

              {/* C10 (Dưới C5) */}
              <rect x="290" y="162" width="80" height="12" rx="2" fill="#ea580c" fillOpacity="0.2" stroke="#f97316" strokeWidth="1" />
              <text x="330" y="171" textAnchor="middle" fill="#fdba74" fontSize="7.5" fontWeight="bold">Nhà C10</text>

              {/* C8 (Dãy ngang lớn dưới cùng khu C) */}
              <rect x="290" y="186" width="90" height="14" rx="3" fill="#ea580c" fillOpacity="0.2" stroke="#f97316" strokeWidth="1" />
              <text x="335" y="196" textAnchor="middle" fill="#fdba74" fontSize="8" fontWeight="bold">Nhà C8</text>

              {/* C6 & C7 (Nhỏ bên phải Trần Đại Nghĩa phụ) */}
              <rect x="395" y="114" width="40" height="10" rx="2" fill="#ea580c" fillOpacity="0.2" stroke="#f97316" strokeWidth="1" />
              <text x="415" y="122" textAnchor="middle" fill="#fdba74" fontSize="7" transform="scale(0.9)">C6</text>

              <rect x="395" y="138" width="40" height="10" rx="2" fill="#ea580c" fillOpacity="0.2" stroke="#f97316" strokeWidth="1" />
              <text x="415" y="146" textAnchor="middle" fill="#fdba74" fontSize="7" transform="scale(0.9)">C7</text>

              {/* --- KHU NHÀ D (GIẢNG ĐƯỜNG D - PHÍA DƯỚI) --- */}
              {/* D2 (Dọc trái) */}
              <rect x="140" y="280" width="18" height="30" rx="2" fill="#ea580c" fillOpacity="0.2" stroke="#f97316" strokeWidth="1" />
              <text x="149" y="298" textAnchor="middle" fill="#fdba74" fontSize="7" transform="rotate(-90 149 298)">D2</text>

              {/* D4 (Ngang dưới cùng trái) */}
              <rect x="110" y="350" width="50" height="16" rx="2" fill="#ea580c" fillOpacity="0.2" stroke="#f97316" strokeWidth="1" />
              <text x="135" y="361" textAnchor="middle" fill="#fdba74" fontSize="7.5">Nhà D4</text>

              {/* D6 (Ngang) */}
              <rect x="170" y="320" width="60" height="14" rx="2" fill="#ea580c" fillOpacity="0.2" stroke="#f97316" strokeWidth="1" />
              <text x="200" y="330" textAnchor="middle" fill="#fdba74" fontSize="8">Nhà D6</text>

              {/* D8 (Ngang dưới D6) */}
              <rect x="170" y="345" width="60" height="12" rx="2" fill="#ea580c" fillOpacity="0.2" stroke="#f97316" strokeWidth="1" />
              <text x="200" y="354" textAnchor="middle" fill="#fdba74" fontSize="8" fontWeight="bold">Nhà D8</text>

              {/* D9 (Ngang dài dưới cùng trung tâm) */}
              <rect x="310" y="375" width="120" height="14" rx="3" fill="#ea580c" fillOpacity="0.2" stroke="#f97316" strokeWidth="1" />
              <text x="370" y="385" textAnchor="middle" fill="#fdba74" fontSize="8" fontWeight="bold">Nhà D9</text>

              {/* Thư viện Tạ Quang Bửu (Trung tâm vàng) */}
              <rect x="325" y="280" width="75" height="60" rx="8" fill="#d97706" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="1.5" />

              {/* D3 & D5 (Dãy liên kết bên phải Thư viện) */}
              {/* D3 (Ngang trên) */}
              <rect x="415" y="270" width="40" height="14" rx="2" fill="#ea580c" fillOpacity="0.2" stroke="#f97316" strokeWidth="1" />
              <text x="435" y="280" textAnchor="middle" fill="#fdba74" fontSize="7.5">D3</text>
              
              {/* D5 (Ngang dưới) */}
              <rect x="415" y="310" width="40" height="14" rx="2" fill="#ea580c" fillOpacity="0.2" stroke="#f97316" strokeWidth="1" />
              <text x="435" y="320" textAnchor="middle" fill="#fdba74" fontSize="7.5">D5</text>
              
              {/* Dãy liên kết dọc */}
              <rect x="441" y="270" width="14" height="54" rx="2" fill="#ea580c" fillOpacity="0.2" stroke="#f97316" strokeWidth="1" />

              {/* --- KHU KTX & TÒA NHÀ B (PHÍA PHẢI TRẦN ĐẠI NGHĨA) --- */}
              {/* KTX Khu B (Xám/Slate) */}
              <rect x="520" y="85" width="60" height="12" rx="2" fill="#475569" fillOpacity="0.2" stroke="#64748b" strokeWidth="1" />
              <text x="550" y="94" textAnchor="middle" fill="#94a3b8" fontSize="7">KTX B6</text>

              <rect x="520" y="115" width="60" height="12" rx="2" fill="#475569" fillOpacity="0.2" stroke="#64748b" strokeWidth="1" />
              <text x="550" y="124" textAnchor="middle" fill="#94a3b8" fontSize="7">KTX B7</text>

              <rect x="520" y="175" width="50" height="14" rx="2" fill="#475569" fillOpacity="0.2" stroke="#64748b" strokeWidth="1" />
              <text x="545" y="185" textAnchor="middle" fill="#94a3b8" fontSize="7.5" fontWeight="bold">KTX B8</text>

              <rect x="600" y="115" width="60" height="12" rx="2" fill="#475569" fillOpacity="0.2" stroke="#64748b" strokeWidth="1" />
              <text x="630" y="124" textAnchor="middle" fill="#94a3b8" fontSize="7">KTX B9</text>

              <rect x="600" y="85" width="60" height="12" rx="2" fill="#475569" fillOpacity="0.2" stroke="#64748b" strokeWidth="1" />
              <text x="630" y="94" textAnchor="middle" fill="#94a3b8" fontSize="7">KTX B5</text>

              {/* Tòa nhà B1 (Signature V-Shape màu Cam) */}
              <path d="M 525 285 L 575 335 L 625 285 L 605 265 L 575 295 L 545 265 Z" fill="#ea580c" fillOpacity="0.2" stroke="#f97316" strokeWidth="1.5" />
              <text x="575" y="280" textAnchor="middle" fill="#fdba74" fontSize="9" fontWeight="black">Nhà B1</text>

              {/* --- VIỆN NGHIÊN CỨU & CƠ SỞ ĐỎ (RED LABELS) --- */}
              {/* CFC */}
              <rect x="410" y="95" width="20" height="13" rx="2" fill="#dc2626" fillOpacity="0.8" />
              <text x="420" y="104" textAnchor="middle" fill="white" fontSize="6.5" fontWeight="bold">CFC</text>
              
              {/* iTIMS */}
              <rect x="360" y="215" width="28" height="13" rx="2" fill="#dc2626" fillOpacity="0.8" />
              <text x="374" y="224" textAnchor="middle" fill="white" fontSize="6.5" fontWeight="bold">iTIMS</text>

              {/* PC & VDZ */}
              <rect x="185" y="275" width="18" height="13" rx="2" fill="#dc2626" fillOpacity="0.8" />
              <text x="194" y="284" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">PC</text>

              <rect x="210" y="275" width="22" height="13" rx="2" fill="#dc2626" fillOpacity="0.8" />
              <text x="221" y="284" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">VDZ</text>

              {/* --- ĐƯỜNG ĐI PHÁT SÁNG CỦA SHIPPER --- */}
              {(order?.status === 'da_nhan' || order?.status === 'dang_giao' || order?.status === 'hoan_thanh') && (
                <>
                  <path 
                    d={`M ${localOrigin.x} ${localOrigin.y} Q ${ctrlX} ${ctrlY} ${localDest.x} ${localDest.y}`} 
                    stroke="#10b981" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeLinecap="round" 
                    opacity="0.12" 
                  />
                  <path 
                    d={`M ${localOrigin.x} ${localOrigin.y} Q ${ctrlX} ${ctrlY} ${localDest.x} ${localDest.y}`} 
                    stroke="#10b981" 
                    strokeWidth="3.5" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeDasharray="8 6" 
                    opacity="0.85" 
                    className={isAnimating ? "animate-[dash_20s_linear_infinite]" : ""}
                    style={{
                      strokeDashoffset: isAnimating ? -200 : 0
                    }}
                  />
                </>
              )}

              {/* 4. ĐỊA ĐIỂM ĐÁNH DẤU HOTSPOT (LANDMARKS) */}
              {Object.values(LANDMARKS).map((loc) => {
                const isOrigin = loc.name === localOrigin.name;
                const isDest = loc.name === localDest.name;
                const isTarget = isOrigin || isDest;

                return (
                  <g 
                    key={loc.name} 
                    className="transition-all duration-300 cursor-pointer group"
                    onClick={() => handleLandmarkClick(loc)}
                  >
                    {/* Radar rings */}
                    {!isSelectorMode && isTarget && (
                      <>
                        <circle 
                          cx={loc.x} 
                          cy={loc.y} 
                          r="20" 
                          fill="none" 
                          stroke={isOrigin ? "#ef4444" : "#10b981"} 
                          strokeWidth="1.5" 
                          opacity="0.6"
                          className="animate-ping"
                          style={{ transformOrigin: `${loc.x}px ${loc.y}px`, animationDuration: isOrigin ? '2.5s' : '2s' }}
                        />
                        <circle 
                          cx={loc.x} 
                          cy={loc.y} 
                          r="14" 
                          fill={isOrigin ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)"} 
                        />
                      </>
                    )}

                    {/* Glowing ring when Selector Mode or Hovering */}
                    {isSelectorMode && (
                      <circle 
                        cx={loc.x} 
                        cy={loc.y} 
                        r="16" 
                        fill="rgba(16, 185, 129, 0.1)" 
                        stroke="#10b981" 
                        strokeWidth="1" 
                        strokeDasharray="4 2"
                        className="group-hover:scale-125 transition-transform duration-300"
                        style={{ transformOrigin: `${loc.x}px ${loc.y}px` }}
                      />
                    )}

                    {/* Core Pin */}
                    <circle 
                      cx={loc.x} 
                      cy={loc.y} 
                      r="10.5" 
                      className="fill-slate-850 stroke-slate-700 stroke-2 group-hover:stroke-emerald-400 transition-colors" 
                    />

                    {/* Emoji Inside */}
                    <text 
                      x={loc.x} 
                      y={loc.y + 3.5} 
                      textAnchor="middle" 
                      className="text-xs select-none pointer-events-none"
                    >
                      {loc.icon}
                    </text>

                    {/* Name board */}
                    <g transform={`translate(${loc.x}, ${loc.y + 24})`}>
                      <rect 
                        x="-55" 
                        y="-12" 
                        width="110" 
                        height="17" 
                        rx="6" 
                        className={`fill-slate-900/95 border border-slate-800 ${
                          isSelectorMode ? 'group-hover:stroke-emerald-500' :
                          isOrigin ? 'stroke-red-500/40' : isDest ? 'stroke-emerald-500/40' : 'stroke-slate-850'
                        } stroke transition-all`}
                      />
                      <text 
                        textAnchor="middle" 
                        className={`text-[8.5px] font-extrabold tracking-wide fill-slate-300 transition-colors ${
                          isSelectorMode ? 'group-hover:fill-emerald-400' : ''
                        }`}
                      >
                        {loc.label}
                      </text>
                    </g>

                    {/* Highlighting badge */}
                    {!isSelectorMode && isOrigin && (
                      <g transform={`translate(${loc.x - 20}, ${loc.y - 25})`}>
                        <rect x="0" y="0" width="40" height="13" rx="4" className="fill-red-500 animate-pulse" />
                        <text x="20" y="9" textAnchor="middle" className="text-[7.5px] font-black fill-white uppercase tracking-wider">MUA HỘ</text>
                      </g>
                    )}
                    {!isSelectorMode && isDest && (
                      <g transform={`translate(${loc.x - 20}, ${loc.y - 25})`}>
                        <rect x="0" y="0" width="40" height="13" rx="4" className="fill-emerald-500 animate-pulse" />
                        <text x="20" y="9" textAnchor="middle" className="text-[7.5px] font-black fill-white uppercase tracking-wider">NHẬN</text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Shipper avatar bike indicator */}
              {!isSelectorMode && (order?.status === 'dang_giao' || (order?.status === 'hoan_thanh' && progress === 1)) && (
                <g transform={`translate(${shipperPos.x}, ${shipperPos.y})`} className="animate-in fade-in duration-300">
                  <circle 
                    cx="0" 
                    cy="0" 
                    r="13" 
                    className="fill-emerald-400 stroke-emerald-500/30 stroke-8 animate-pulse" 
                  />
                  <circle 
                    cx="0" 
                    cy="0" 
                    r="9.5" 
                    className="fill-emerald-500 shadow-md stroke-slate-950 stroke-1.5" 
                  />
                  <polygon 
                    points="-2,-3 4,0 -2,3" 
                    className="fill-slate-950 font-bold"
                    transform="scale(0.85)"
                  />
                </g>
              )}
            </g>
          </svg>

          {/* Info layer */}
          <div className="absolute left-3 bottom-3 right-3 bg-slate-900/80 backdrop-blur-md rounded-2xl p-3 border border-slate-800 flex gap-2.5 items-center z-10">
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-850 flex-shrink-0">
              <Bike className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isSelectorMode ? 'Chế độ chọn vị trí giao' : 'Lộ trình giao hàng COD nội khu'}
              </p>
              <p className="text-xs text-slate-200 font-semibold truncate mt-0.5">
                {isSelectorMode ? 'Nhấp vào một địa danh trên sơ đồ ở trên' : `${localOrigin.label} ➔ ${localDest.label}`}
              </p>
            </div>
            {!isSelectorMode && order?.status === 'dang_giao' && (
              <div className="text-right">
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {Math.round(progress * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-850 text-slate-400 text-[10px] leading-relaxed flex items-start gap-2 rounded-b-[2.5rem]">
          <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
          <span>
            {isSelectorMode ? (
              <>
                <b>Bản đồ chọn nhanh:</b> Bạn đang ở chế độ chọn nhanh vị trí giao hàng. Hãy <b>nhấp chuột (click)</b> trực tiếp vào một trong 5 địa danh phát sáng trên bản đồ để chọn nó làm vị trí giao hàng cho đơn của bạn.
              </>
            ) : (
              <>
                <b>Bản đồ mô phỏng HUST tương tác:</b> Thuyết trình/Demo cực đỉnh bằng cách <b>nhấp chuột vào bất kỳ tòa nhà nào</b> trên bản đồ để lập tức điều hướng Shipper giao sang tuyến đường Bezier mới theo thời gian thực!
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
