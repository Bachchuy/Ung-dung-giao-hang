'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ShieldCheck, Truck, Zap, Mail, ArrowRight } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Vui lòng nhập địa chỉ email!');
      return;
    }

    setIsLoading(true);
    setError('');

    const res = await login(email, fullName);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Lỗi đăng nhập');
    }
  };

  const handleGoogleMock = async () => {
    setIsLoading(true);
    setError('');
    
    // Simulating quick Google Login using a valid student email
    const mockGoogleEmails = [
      { email: 'hoang.lam@hust.edu.vn', name: 'Hoàng Lâm (Top Shipper)' },
      { email: 'minh.triet@hust.edu.vn', name: 'Minh Triết' },
      { email: 'admin.logistics@hust.edu.vn', name: 'Admin Logistics' }
    ];
    
    // Grab a random one or let them choose. Let's pick a random one for quick play
    const randomProfile = mockGoogleEmails[Math.floor(Math.random() * mockGoogleEmails.length)];
    
    const res = await login(randomProfile.email, randomProfile.name);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Lỗi đăng nhập Google');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-emerald-500/10 border border-slate-700/30 group">
            <img 
              src="/logo.jpg" 
              alt="BK Ship Logo" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              BK
            </span>
            <span className="font-bold text-xl tracking-tight text-white"> SHIP</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2.5">
          <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Startup MVP Demo
          </span>
        </div>
      </header>

      {/* Hero and Login Section */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-12 gap-12 items-center flex-1 z-10">
        {/* Left Side: Pitch and Visuals */}
        <div className="md:col-span-7 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 px-4 py-1.5 rounded-full w-fit">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">Giải quyết bài toán Last-meter delivery</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
            Giao nhận nội khu <br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              Chỉ trong 1 nốt nhạc!
            </span>
          </h1>
          
          <p className="text-slate-400 text-base sm:text-lg max-w-xl">
            Nền tảng giúp sinh viên đặt đồ ăn, thức uống và dịch vụ in ấn PDF/tài liệu học tập ngay tại trường. Đồng thời giúp các sinh viên tiện đường nhận đơn để kiếm thêm thu nhập cực nhanh.
          </p>

          {/* Key Selling Points */}
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2">
              <span className="text-2xl">🍔</span>
              <h3 className="font-bold text-slate-200 text-sm">Ăn uống tận bàn</h3>
              <p className="text-xs text-slate-400">Đặt ship đồ ăn, thức uống trực tiếp từ cổng trường vào tận lớp học hay phòng KTX.</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2">
              <span className="text-2xl">🖨️</span>
              <h3 className="font-bold text-slate-200 text-sm">In ấn tài liệu</h3>
              <p className="text-xs text-slate-400">Upload slide bài giảng PDF, shipper in sẵn và mang đến trước giờ thi của bạn.</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2">
              <span className="text-2xl">💸</span>
              <h3 className="font-bold text-slate-200 text-sm">Chi phí siêu rẻ</h3>
              <p className="text-xs text-slate-400">Phí ship sinh viên từ 10.000 VNĐ, rẻ hơn nhiều so với đặt Grab/ShopeeFood.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Box */}
        <div className="md:col-span-5 w-full flex justify-center">
          <div className="w-full max-w-md bg-slate-800/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 relative">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-2xl font-bold text-white tracking-tight">Trải nghiệm hệ thống</h2>
              <p className="text-xs text-slate-400">
                Hãy đăng nhập bằng email sinh viên trường của bạn.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold p-3.5 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Họ và tên (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors duration-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email sinh viên (*.edu)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="sv@school.edu.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-50 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 transition-all duration-200 mt-2"
              >
                {isLoading ? 'Đang xử lý...' : 'Đăng nhập sinh viên'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-700/50"></div>
              <span className="flex-shrink mx-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Hoặc trải nghiệm nhanh</span>
              <div className="flex-grow border-t border-slate-700/50"></div>
            </div>

            {/* Quick Demo Mock Google login */}
            <button
              onClick={handleGoogleMock}
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Đăng nhập nhanh (Simulated Google Auth)
            </button>

            <div className="flex items-center gap-2 justify-center text-[11px] text-slate-500 bg-slate-900/30 p-2.5 rounded-xl border border-slate-900/20">
              <ShieldCheck className="w-4 h-4 text-emerald-500/80" />
              <span>Chỉ chấp nhận email có đuôi <b>.edu</b> hoặc <b>.edu.vn</b></span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 z-10 px-6">
        <p>© 2026 BK Ship Inc. Xây dựng bởi Startup MVP Architect cho môn đổi mới sáng tạo & khởi nghiệp.</p>
      </footer>
    </div>
  );
};
