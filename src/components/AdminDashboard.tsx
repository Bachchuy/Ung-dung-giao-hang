'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Users, 
  TrendingUp, 
  Layers, 
  DollarSign, 
  Trash2, 
  UserCheck, 
  UserX, 
  Search,
  Clock3
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { orders, users, toggleBanUser, updateOrderStatus, activityLogs, orderStatusHistory } = useApp();
  const [adminTab, setAdminTab] = useState<'orders' | 'users' | 'logs' | 'history'>('orders');
  const [searchQuery, setSearchQuery] = useState('');

  // Stats Calculations
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'hoan_thanh').length;
  const totalUsers = users.length;
  const totalVolume = orders
    .filter(o => o.status === 'hoan_thanh')
    .reduce((acc, curr) => acc + curr.shipping_fee, 0);
  const successRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 100;

  const handleCancelSpam = async (orderId: string) => {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này với vai trò Admin? (Đơn sẽ chuyển sang trạng thái Cancelled)')) {
      await updateOrderStatus(orderId, 'da_huy');
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.delivery_location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto px-4 pb-28 pt-4">
      {/* STATS TILES GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] p-5 shadow-lg shadow-blue-500/20 text-white flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider relative z-10">Tổng số đơn hàng</span>
          <span className="text-3xl font-black text-white mt-3 flex items-center justify-between relative z-10">
            {totalOrders}
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Layers className="w-5 h-5 text-blue-50" />
            </div>
          </span>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-5 shadow-lg shadow-emerald-500/20 text-white flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider relative z-10">Lượng sinh viên</span>
          <span className="text-3xl font-black text-white mt-3 flex items-center justify-between relative z-10">
            {totalUsers}
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Users className="w-5 h-5 text-emerald-50" />
            </div>
          </span>
        </div>
        
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-[2rem] p-5 shadow-lg shadow-violet-500/20 text-white flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <span className="text-[10px] font-bold text-violet-100 uppercase tracking-wider relative z-10">Tỷ lệ hoàn thành</span>
          <span className="text-3xl font-black text-white mt-3 flex items-center justify-between relative z-10">
            {successRate}%
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <TrendingUp className="w-5 h-5 text-violet-50" />
            </div>
          </span>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-[2rem] p-5 shadow-lg shadow-amber-500/20 text-white flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <span className="text-[10px] font-bold text-amber-100 uppercase tracking-wider relative z-10">Doanh thu giao dịch</span>
          <span className="text-xl font-black text-white mt-3 flex items-center justify-between relative z-10">
            {totalVolume.toLocaleString('vi-VN')} đ
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <DollarSign className="w-5 h-5 text-amber-50" />
            </div>
          </span>
        </div>
      </div>

      {/* SEARCH AND CONTROLS */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 border border-slate-100 rounded-2xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={adminTab === 'orders' ? 'Tìm đơn theo tên, địa điểm...' : 'Tìm sinh viên theo tên, email...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-800 transition-colors"
          />
        </div>
        
        <div className="flex bg-slate-100 p-0.5 rounded-xl gap-0.5 self-end sm:self-auto">
          <button
            onClick={() => { setAdminTab('orders'); setSearchQuery(''); }}
            className={`py-2 px-4 rounded-lg text-xs font-semibold transition-all duration-200 ${
              adminTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Quản lý Đơn hàng
          </button>
          <button
            onClick={() => { setAdminTab('users'); setSearchQuery(''); }}
            className={`py-2 px-4 rounded-lg text-xs font-semibold transition-all duration-200 ${
              adminTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Quản lý Sinh viên
          </button>
          <button
            onClick={() => { setAdminTab('logs'); setSearchQuery(''); }}
            className={`py-2 px-4 rounded-lg text-xs font-semibold transition-all duration-200 ${
              adminTab === 'logs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Nhật ký hệ thống
          </button>
          <button
            onClick={() => { setAdminTab('history'); setSearchQuery(''); }}
            className={`py-2 px-4 rounded-lg text-xs font-semibold transition-all duration-200 ${
              adminTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Lịch sử đơn hàng
          </button>
        </div>
      </div>

      {/* ORDERS MANAGEMENT TAB */}
      {adminTab === 'orders' && (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm">Giám sát đơn hàng toàn hệ thống</h3>
            <span className="text-[10px] text-slate-400 font-semibold">Realtime Logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3">Loại</th>
                  <th className="px-5 py-3">Chi tiết đơn</th>
                  <th className="px-5 py-3">Người đặt & Nơi giao</th>
                  <th className="px-5 py-3">Shipper</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Phí Ship</th>
                  <th className="px-5 py-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                      Không tìm thấy đơn hàng nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-700">
                        {o.order_type === 'do_an' ? '🍔 Ăn uống' : o.order_type === 'do_uong' ? '🥤 Đồ uống' : '🖨️ In ấn'}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800">{o.title}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[150px] mt-0.5">{o.description || 'Không mô tả'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-850">{o.customer_name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]">📍 {o.delivery_location}</p>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {o.shipper_name ? (
                          <div className="flex items-center gap-1.5">
                            <img src={o.shipper_avatar} className="w-4 h-4 rounded-full" />
                            <span>{o.shipper_name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa nhận</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.status === 'cho_nhan' ? 'bg-amber-100 text-amber-800' :
                          o.status === 'da_nhan' ? 'bg-blue-100 text-blue-800' :
                          o.status === 'dang_giao' ? 'bg-indigo-100 text-indigo-800' :
                          o.status === 'hoan_thanh' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-extrabold text-slate-850">
                        {o.shipping_fee.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-5 py-4 text-center">
                        {o.status !== 'hoan_thanh' && o.status !== 'da_huy' ? (
                          <button
                            onClick={() => handleCancelSpam(o.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                            title="Hủy đơn spam"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS MANAGEMENT TAB */}
      {adminTab === 'users' && (
        <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Quản lý danh sách thành viên nội khu</h3>
              <p className="text-[10px] text-slate-400 mt-1">Phân quyền, khóa tài khoản và quản lý uy tín cộng đồng</p>
            </div>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg font-bold border border-emerald-100 flex items-center gap-1 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Supabase Auth Connected
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3">Thành viên</th>
                  <th className="px-5 py-3">Email Sinh Viên</th>
                  <th className="px-5 py-3">Vai trò</th>
                  <th className="px-5 py-3 text-center">Độ uy tín</th>
                  <th className="px-5 py-3 text-center">Đơn hoàn thành</th>
                  <th className="px-5 py-3 text-center">Trạng thái</th>
                  <th className="px-5 py-3 text-center">Khóa tài khoản</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <img 
                          src={u.avatar_url} 
                          alt={u.full_name} 
                          className="w-7 h-7 rounded-full border border-slate-150"
                        />
                        <span className="font-bold text-slate-800">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-600">{u.email}</td>
                    <td className="px-5 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => {
                          alert(`Đã thay đổi vai trò của ${u.full_name} thành ${e.target.value}. Để có hiệu lực toàn phần, hãy dùng floating switcher ở dưới.`);
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none"
                      >
                        <option value="khach_hang">Customer 🛒</option>
                        <option value="shipper">Shipper 🚴</option>
                        <option value="quan_tri">Admin 🛡️</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-slate-700">
                      <span className={`px-2 py-0.5 rounded ${u.reputation >= 120 ? 'text-emerald-600 bg-emerald-50' : u.reputation < 80 ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-50'}`}>
                        {u.reputation} / 200
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center font-semibold text-slate-800">
                      {u.orders_completed}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_banned ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {u.is_banned ? 'Bị khóa' : 'Hoạt động'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {u.role !== 'quan_tri' ? (
                        <button
                          onClick={() => toggleBanUser(u.id)}
                          className={`p-1.5 rounded-lg transition-colors duration-200 ${
                            u.is_banned 
                              ? 'hover:bg-emerald-50 text-emerald-600 hover:text-emerald-800' 
                              : 'hover:bg-red-50 text-red-500 hover:text-red-800'
                          }`}
                          title={u.is_banned ? 'Mở khóa tài khoản' : 'Khóa tài khoản spam'}
                        >
                          {u.is_banned ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </button>
                      ) : (
                        <span className="text-slate-300 font-bold">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ACTIVITY LOGS TAB */}
      {adminTab === 'logs' && (
        <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-slate-500" />
                Nhật ký hoạt động gần nhất
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Theo dõi login, tạo đơn, đổi trạng thái, đánh giá và thao tác quản trị</p>
            </div>
            <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded-lg font-bold border border-blue-100 flex items-center gap-1 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              {activityLogs.length} events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3">Thời gian</th>
                  <th className="px-5 py-3">Hành động</th>
                  <th className="px-5 py-3">Vai trò</th>
                  <th className="px-5 py-3">Đối tượng</th>
                  <th className="px-5 py-3">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      Chưa có nhật ký hệ thống nào.
                    </td>
                  </tr>
                ) : (
                  activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors align-top">
                      <td className="px-5 py-4 whitespace-nowrap text-[10px] text-slate-500 font-semibold">
                        {new Date(log.created_at).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800">
                        {log.action}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.actor_role === 'quan_tri' ? 'bg-rose-100 text-rose-700' :
                          log.actor_role === 'shipper' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {log.actor_role || 'system'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        <div className="flex flex-col gap-0.5">
                          <span>{log.entity_type}</span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[160px]">{log.entity_id || '-'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[10px] text-slate-500 max-w-[300px]">
                        <pre className="whitespace-pre-wrap break-words font-sans bg-slate-50 border border-slate-100 rounded-xl p-2">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDER HISTORY TAB */}
      {adminTab === 'history' && (
        <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Lịch sử trạng thái đơn hàng</h3>
              <p className="text-[10px] text-slate-400 mt-1">Timeline riêng của từng đơn để truy vết luồng vận hành</p>
            </div>
            <span className="text-[10px] text-violet-600 bg-violet-50 px-2 py-1 rounded-lg font-bold border border-violet-100 flex items-center gap-1 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              {orderStatusHistory.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3">Thời gian</th>
                  <th className="px-5 py-3">Đơn hàng</th>
                  <th className="px-5 py-3">Từ trạng thái</th>
                  <th className="px-5 py-3">Sang trạng thái</th>
                  <th className="px-5 py-3">Người thao tác</th>
                  <th className="px-5 py-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orderStatusHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Chưa có lịch sử trạng thái nào.
                    </td>
                  </tr>
                ) : (
                  orderStatusHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors align-top">
                      <td className="px-5 py-4 whitespace-nowrap text-[10px] text-slate-500 font-semibold">
                        {new Date(record.created_at).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800">
                        {record.order_id}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                          {record.from_status || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          record.to_status === 'hoan_thanh' ? 'bg-emerald-100 text-emerald-700' :
                          record.to_status === 'da_huy' ? 'bg-rose-100 text-rose-700' :
                          record.to_status === 'dang_giao' ? 'bg-indigo-100 text-indigo-700' :
                          record.to_status === 'da_nhan' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {record.to_status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-medium">
                        {record.actor_role || 'system'}
                      </td>
                      <td className="px-5 py-4 text-[10px] text-slate-500 max-w-[280px] break-words">
                        {record.note || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
