'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Check, X } from 'lucide-react';
import { useApp, Order } from '@/context/AppContext';

interface ChatBoxProps {
  order: Order;
  onClose?: () => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ order, onClose }) => {
  const { user, chats, sendChatMessage } = useApp();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Lọc các tin nhắn của riêng đơn hàng này
  const orderChats = chats.filter(c => c.order_id === order.id);

  // Cuộn xuống dưới cùng khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [orderChats.length]);

  if (!user) return null;

  // Xác định đối phương đang chat cùng
  const isCustomer = user.role === 'khach_hang';
  const peerName = isCustomer ? (order.shipper_name || 'Shipper') : order.customer_name;
  const peerAvatar = isCustomer ? (order.shipper_avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=shipper') : order.customer_avatar;
  const peerRoleLabel = isCustomer ? 'Shipper của bạn' : 'Sinh viên đặt đơn';

  // Câu trả lời nhanh tùy biến theo Vai trò để demo cực nhanh
  const QUICK_REPLIES = isCustomer 
    ? [
        'Dạ vâng ạ! 🥰',
        'Bạn gửi ở bàn bảo vệ giúp mình nhé.',
        'Mua thêm nhiều đá/nhiều rau giúp mình nha!',
        'Khi nào đến gọi mình xuống ngay.'
      ]
    : [
        'Mình đã nhận đơn và chuẩn bị đi mua nhé! 👍',
        'Mình đã mua xong đồ rồi, đang giao qua nha.',
        'Đường hơi tắc, mình đến trong 5 phút nữa nhé.',
        'Mình đã đến sảnh rồi, bạn xuống nhận giúp mình.'
      ];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    await sendChatMessage(order.id, text.trim());
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md h-[550px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border border-slate-100 flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white shadow-md">
          <div className="flex items-center gap-3">
            <img 
              src={peerAvatar} 
              alt={peerName} 
              className="w-10 h-10 rounded-full border border-slate-800 bg-slate-800"
            />
            <div>
              <h3 className="font-extrabold text-sm text-slate-100 leading-tight">{peerName}</h3>
              <p className="text-[10px] text-emerald-400 font-bold mt-0.5">{peerRoleLabel}</p>
              <p className="text-[9px] text-slate-400 font-semibold mt-1 truncate max-w-[220px]">
                Đơn: {order.title} · Trạng thái: {order.status}
              </p>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 bg-slate-50 p-4 overflow-y-auto flex flex-col gap-3">
          {orderChats.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 opacity-60 px-6 py-12">
              <span className="text-4xl animate-bounce">💬</span>
              <h4 className="text-xs font-bold text-slate-700">Chưa có tin nhắn nào</h4>
              <p className="text-[10px] text-slate-500 max-w-[220px]">
                Hãy kết nối và nhắn tin thương lượng trực tiếp với đối phương hoặc click chọn các tin nhắn mẫu bên dưới!
              </p>
            </div>
          ) : (
            orderChats.map((msg) => {
              const isMe = msg.sender_id === user.id;
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <span className="text-[9px] text-slate-400 font-bold mb-1 px-1">
                    {msg.sender_name}
                  </span>
                  <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                    isMe 
                      ? 'bg-slate-900 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}>
                    {msg.message}
                  </div>
                  <span className="text-[8px] text-slate-400 font-semibold mt-1 px-1 flex items-center gap-0.5">
                    {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    {isMe && <Check className="w-2.5 h-2.5 text-emerald-500" />}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies Panel */}
        <div className="p-3 bg-white border-t border-slate-100/50 flex flex-col gap-1.5 overflow-x-auto">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1 flex items-center gap-1">
            ⚡ Gợi ý nhắn nhanh
          </span>
          <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-none whitespace-nowrap">
            {QUICK_REPLIES.map((reply, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(reply)}
                className="bg-slate-50 hover:bg-slate-100 active:scale-[0.98] border border-slate-200/60 hover:border-slate-300 text-[10px] font-bold text-slate-600 px-3 py-1.5 rounded-full transition-all duration-200 shadow-sm flex-shrink-0"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText);
          }}
          className="p-4 bg-white border-t border-slate-100 flex gap-2 items-center"
        >
          <input
            type="text"
            placeholder="Nhập nội dung nhắn tin..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`p-3 rounded-xl flex items-center justify-center transition-all ${
              inputText.trim() 
                ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-md' 
                : 'bg-slate-100 text-slate-350 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
