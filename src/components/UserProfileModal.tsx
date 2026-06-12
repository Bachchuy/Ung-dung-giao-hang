import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Camera, Save, User, Mail, ShieldCheck, Award, Wallet } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile, updateUserAvatar } = useApp();
  // Ensure we don't crash if user is somehow null on initial mount
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user) {
      setFullName(user.full_name);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    
    setIsSaving(true);
    await updateUserProfile(fullName);
    setIsSaving(false);
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      await updateUserAvatar(file);
      setIsUploading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'khach_hang': return 'Khách hàng';
      case 'shipper': return 'Shipper';
      case 'quan_tri': return 'Quản trị viên';
      default: return role;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-amber-500 p-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5" /> Thông tin cá nhân
          </h2>
          <button onClick={onClose} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 flex flex-col gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img 
                src={user.avatar_url} 
                alt={user.full_name} 
                className={`w-24 h-24 rounded-full object-cover border-4 border-amber-100 shadow-md ${isUploading ? 'opacity-50' : ''}`}
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Nhấn vào ảnh để đổi
            </span>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Họ và tên
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                placeholder="Nhập họ và tên..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </span>
                <span className="text-xs font-semibold text-slate-800 truncate" title={user.email}>{user.email}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Vai trò
                </span>
                <span className="text-xs font-bold text-red-600">{getRoleLabel(user.role)}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> Số dư ví
                </span>
                <span className="text-xs font-bold text-amber-600">{user.balance.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Award className="w-3 h-3" /> Uy tín / Số đơn
                </span>
                <span className="text-xs font-bold text-emerald-600">{user.reputation} điểm / {user.orders_completed} đơn</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="w-full bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-70 active:scale-[0.98]"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-5 h-5" /> Lưu thay đổi
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
