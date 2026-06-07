'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';

export default function AvatarPicker() {
  const { user, updateUserAvatar, isDemoMode } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setPreview(user.avatar_url || null);
  }, [user]);

  useEffect(() => {
    if (!selectedFile) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(selectedFile);
  }, [selectedFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      // Basic validation: image only, <= 4MB
      if (!f.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh (png/jpg/webp).');
        return;
      }
      if (f.size > 4 * 1024 * 1024) {
        alert('Kích thước tối đa 4MB, vui lòng nén ảnh trước khi tải lên.');
        return;
      }
      setSelectedFile(f);
    }
  };

  const upload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const ok = await updateUserAvatar(selectedFile);
    setLoading(false);
    if (ok) setSelectedFile(null);
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 ring-2 ring-offset-2 ring-accent">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">No
            Image</div>
        )}
      </div>

      <div className="flex flex-col">
        <label className="text-xs text-gray-400">Ảnh đại diện</label>
        <div className="flex gap-2">
          <input id="avatar-input" type="file" accept="image/*" onChange={onFileChange} className="hidden" />
          <label htmlFor="avatar-input" className="btn btn-sm btn-outline">Chọn ảnh</label>
          <button onClick={upload} className={`btn btn-sm btn-primary ${loading ? 'opacity-70' : ''}`} disabled={!selectedFile || loading}>
            {loading ? 'Đang tải...' : isDemoMode ? 'Lưu (cục bộ)' : 'Tải lên'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">Khuyến nghị: JPG/PNG/WebP, tối đa 4MB.</p>
      </div>
    </div>
  );
}
