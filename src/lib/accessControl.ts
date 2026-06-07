export type AccessUser = {
  role?: string;
  email?: string;
};

export function isAdminAccount(user?: AccessUser | null) {
  if (!user) return false;
  return user.role === 'quan_tri' && user.email?.toLowerCase().includes('admin') === true;
}

export function canSwitchToAdminAccount(user?: AccessUser | null) {
  return isAdminAccount(user);
}

export function getAdminAccessDeniedReason(user?: AccessUser | null) {
  if (!user) return 'Bạn chưa đăng nhập.';
  if (user.role !== 'quan_tri') return 'Chỉ tài khoản quản trị mới được vào khu vực Admin.';
  if (!user.email?.toLowerCase().includes('admin')) return 'Tài khoản này không được cấp quyền Admin thật.';
  return 'Không có quyền truy cập Admin.';
}
