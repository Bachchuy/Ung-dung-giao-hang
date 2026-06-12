'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { canSwitchToAdminAccount } from '@/lib/accessControl';

// --- TYPES ---
export type UserRole = 'khach_hang' | 'shipper' | 'quan_tri';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: UserRole;
  reputation: number;
  orders_completed: number;
  is_banned: boolean;
  balance: number;
  created_at: string;
}

export type OrderType = 'do_an' | 'do_uong' | 'in_an';
export type OrderStatus = 'cho_nhan' | 'da_nhan' | 'dang_giao' | 'hoan_thanh' | 'da_huy';

export interface PrintingDetails {
  file_name: string;
  copies: number;
  is_color: boolean;
  is_double_sided: boolean;
}

export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_avatar: string;
  shipper_id?: string;
  shipper_name?: string;
  shipper_avatar?: string;
  title: string;
  description: string;
  order_type: OrderType;
  delivery_location: string;
  phone_number: string;
  notes?: string;
  shipping_fee: number;
  total_amount?: number;
  status: OrderStatus;
  created_at: string;
  printing_details?: PrintingDetails;
  item_cost?: number;
  payment_method?: string;
}

export interface Rating {
  id: string;
  order_id: string;
  from_id: string;
  to_id: string;
  rating: number; // 1-5
  comment: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  order_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  message: string;
  created_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  actor_id: string | null;
  actor_role: UserRole | null;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  note: string | null;
  created_at: string;
}

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  created_at: string;
  read: boolean;
}

export interface ActivityLog {
  id: string;
  actor_id: string | null;
  actor_role: UserRole | null;
  action: string;
  entity_type: 'auth' | 'order' | 'rating' | 'chat' | 'profile' | 'wallet' | 'system';
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface AppContextType {
  user: UserProfile | null;
  users: UserProfile[];
  orders: Order[];
  ratings: Rating[];
  notifications: AppNotification[];
  activityLogs: ActivityLog[];
  orderStatusHistory: OrderStatusHistory[];
  isDemoMode: boolean;
  login: (email: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  createOrder: (orderData: Omit<Order, 'id' | 'customer_id' | 'customer_name' | 'customer_avatar' | 'status' | 'created_at' | 'shipper_id' | 'shipper_name' | 'shipper_avatar'>, printing?: PrintingDetails) => Promise<boolean>;
  acceptOrder: (orderId: string) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: OrderStatus, actualItemCost?: number) => Promise<boolean>;
  submitRating: (orderId: string, toId: string, score: number, comment: string) => Promise<boolean>;
  toggleBanUser: (userId: string) => void;
  clearNotification: (id: string) => void;
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
  deposit: (amount: number) => void;
  chats: ChatMessage[];
  sendChatMessage: (orderId: string, message: string) => Promise<boolean>;
  updateUserAvatar: (file: File) => Promise<boolean>;
}

export const STORAGE_KEYS = {
  user: 'campus_delivery_user',
  users: 'campus_delivery_users',
  orders: 'campus_delivery_orders',
  ratings: 'campus_delivery_ratings',
  chats: 'campus_delivery_chats',
  activityLogs: 'campus_delivery_activity_logs',
  orderStatusHistory: 'campus_delivery_order_status_history',
} as const;

export function calculateOrderPricing(
  orderType: OrderType,
  shippingFee: number,
  itemCost?: number,
  printing?: PrintingDetails
) {
  let estimatedItemCost = itemCost ?? 30000;

  if (orderType === 'in_an' && printing) {
    const pageCost = printing.is_color ? 2000 : 500;
    const pages = 10;
    estimatedItemCost = printing.copies * pages * pageCost;
  }

  const totalAmount = estimatedItemCost + shippingFee;

  return { estimatedItemCost, totalAmount };
}

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  cho_nhan: ['da_nhan', 'da_huy'],
  da_nhan: ['dang_giao', 'da_huy'],
  dang_giao: ['hoan_thanh', 'da_huy'],
  hoan_thanh: [],
  da_huy: []
};

export function canTransitionOrderStatus(
  order: Order,
  nextStatus: OrderStatus,
  actor?: Pick<UserProfile, 'id' | 'role'> | null
) {
  if (!actor) return false;

  if (!ORDER_STATUS_TRANSITIONS[order.status].includes(nextStatus)) {
    return false;
  }

  if (nextStatus === 'da_nhan') {
    return actor.role === 'shipper' && order.status === 'cho_nhan';
  }

  if (nextStatus === 'dang_giao') {
    return actor.role === 'shipper' && order.shipper_id === actor.id && order.status === 'da_nhan';
  }

  if (nextStatus === 'hoan_thanh') {
    return actor.role === 'shipper' && order.shipper_id === actor.id && order.status === 'dang_giao';
  }

  if (nextStatus === 'da_huy') {
    if (actor.role === 'quan_tri') return true;
    return actor.role === 'shipper' && order.shipper_id === actor.id && order.status !== 'hoan_thanh';
  }

  return false;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- SEED DATA FOR DEMO ---
const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-cust-1',
    email: 'minh.triet@hust.edu.vn',
    full_name: 'Minh Triết',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=triet',
    role: 'khach_hang',
    reputation: 105,
    orders_completed: 0,
    is_banned: false,
    balance: 250000,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-ship-1',
    email: 'hoang.lam@hust.edu.vn',
    full_name: 'Hoàng Lâm (Top Shipper)',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=lam',
    role: 'shipper',
    reputation: 165,
    orders_completed: 34,
    is_banned: false,
    balance: 850000,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-admin-1',
    email: 'admin.logistics@hust.edu.vn',
    full_name: 'Admin Logistics',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin',
    role: 'quan_tri',
    reputation: 200,
    orders_completed: 0,
    is_banned: false,
    balance: 9999000,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const MOCK_ORDERS: Order[] = [
  {
    id: 'order-1',
    customer_id: 'user-cust-1',
    customer_name: 'Minh Triết',
    customer_avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=triet',
    title: '2 Ly Trà Sữa Mixue ít đá',
    description: 'Mua ở Mixue cổng Parabol, giao đến tầng 4 nhà D3',
    order_type: 'do_uong',
    delivery_location: 'Tầng 4, Nhà D3 - ĐH Bách Khoa',
    phone_number: '0987654321',
    notes: 'Gọi điện trước khi lên tầng nhé shipper ơi.',
    shipping_fee: 15000,
    total_amount: 55000,
    status: 'cho_nhan',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'order-2',
    customer_id: 'user-cust-1',
    customer_name: 'Minh Triết',
    customer_avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=triet',
    title: 'In & Photo Slide môn Khởi nghiệp',
    description: 'In tài liệu PDF bài giảng ôn thi cuối kỳ',
    order_type: 'in_an',
    delivery_location: 'Phòng 202, KTX B10',
    phone_number: '0987654321',
    shipping_fee: 20000,
    total_amount: 25000,
    status: 'cho_nhan',
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    printing_details: {
      file_name: 'Slide_KhoiNghiep_K67.pdf',
      copies: 2,
      is_color: false,
      is_double_sided: true
    }
  },
  {
    id: 'order-3',
    customer_id: 'user-cust-1',
    customer_name: 'Minh Triết',
    customer_avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=triet',
    shipper_id: 'user-ship-1',
    shipper_name: 'Hoàng Lâm (Top Shipper)',
    shipper_avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=lam',
    title: 'Cơm rang dưa bò cổng Trần Đại Nghĩa',
    description: 'Mua quán Cơm bình dân số 12, giao đến Thư viện Tạ Quang Bửu',
    order_type: 'do_an',
    delivery_location: 'Bàn tự học tầng 3, Thư viện Tạ Quang Bửu',
    phone_number: '0987654321',
    notes: 'Mua thêm canh giúp mình',
    shipping_fee: 12000,
    total_amount: 47000,
    status: 'dang_giao',
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString()
  },
  {
    id: 'order-4',
    customer_id: 'user-cust-1',
    customer_name: 'Minh Triết',
    customer_avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=triet',
    shipper_id: 'user-ship-1',
    shipper_name: 'Hoàng Lâm (Top Shipper)',
    shipper_avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=lam',
    title: '1 hộp bánh mì Doner Kebab',
    description: 'Giao đến sảnh nhà B1',
    order_type: 'do_an',
    delivery_location: 'Sảnh tòa B1',
    phone_number: '0987654321',
    shipping_fee: 10000,
    total_amount: 35000,
    status: 'hoan_thanh',
    created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString()
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDemoMode = !isSupabaseConfigured;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [orderStatusHistory, setOrderStatusHistory] = useState<OrderStatusHistory[]>([]);

  // Fetch initial data from Supabase
  const fetchFromSupabase = async () => {
    if (!supabase) return;
    try {
      // 1. Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*');
      if (profilesData) {
        const mappedUsers: UserProfile[] = profilesData.map((p: any) => ({
          id: p.id,
          email: p.email,
          full_name: p.full_name || '',
          avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.full_name}`,
          role: p.role,
          reputation: p.reputation,
          orders_completed: p.orders_completed,
          is_banned: p.is_banned,
          balance: p.balance ? Number(p.balance) : 200000,
          created_at: p.created_at
        }));
        setUsers(mappedUsers);
      }

      // 2. Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customer_id(full_name, avatar_url),
          shipper:shipper_id(full_name, avatar_url),
          printing_details(*)
        `)
        .order('created_at', { ascending: false });
        
      if (ordersData) {
        const mappedOrders: Order[] = ordersData.map((o: any) => ({
          id: o.id,
          customer_id: o.customer_id,
          customer_name: o.customer?.full_name || 'Khách hàng',
          customer_avatar: o.customer?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=default',
          shipper_id: o.shipper_id || undefined,
          shipper_name: o.shipper?.full_name || undefined,
          shipper_avatar: o.shipper?.avatar_url || undefined,
          title: o.title,
          description: o.description || '',
          order_type: o.order_type,
          delivery_location: o.delivery_location,
          phone_number: o.phone_number,
          notes: o.notes || undefined,
          shipping_fee: Number(o.shipping_fee),
          total_amount: o.total_amount ? Number(o.total_amount) : undefined,
          status: o.status,
          created_at: o.created_at,
          printing_details: o.printing_details && o.printing_details.length > 0 ? {
            file_name: o.printing_details[0].file_name,
            copies: o.printing_details[0].copies,
            is_color: o.printing_details[0].is_color,
            is_double_sided: o.printing_details[0].is_double_sided
          } : undefined,
          item_cost: o.item_cost ? Number(o.item_cost) : undefined
        }));
        setOrders(mappedOrders);
      }

      // 3. Fetch ratings
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('*');
      if (ratingsData) {
        setRatings(ratingsData);
      }

      // 4. Fetch chats
      const { data: chatsData } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: true });
      if (chatsData) {
        setChats(chatsData);
      }

      // 5. Fetch activity logs
      const { data: activityLogsData } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (activityLogsData) {
        setActivityLogs(activityLogsData);
      }

      const { data: orderHistoryData } = await supabase
        .from('order_status_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (orderHistoryData) {
        setOrderStatusHistory(orderHistoryData);
      }
    } catch (err) {
      console.error('Lỗi khi truy vấn Supabase:', err);
    }
  };

  // Load initial local data + Sync Supabase Auth session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedChats = localStorage.getItem(STORAGE_KEYS.chats);
      const storedUsers = localStorage.getItem(STORAGE_KEYS.users);
      const storedOrders = localStorage.getItem(STORAGE_KEYS.orders);
      const storedRatings = localStorage.getItem(STORAGE_KEYS.ratings);
      const storedActivityLogs = localStorage.getItem(STORAGE_KEYS.activityLogs);
      const storedOrderStatusHistory = localStorage.getItem(STORAGE_KEYS.orderStatusHistory);

      if (!isSupabaseConfigured) {
        // Demo mode: restore user from localStorage
        const storedUser = localStorage.getItem(STORAGE_KEYS.user);
        if (storedUser) setUser(JSON.parse(storedUser));

        if (storedChats) setChats(JSON.parse(storedChats));
        
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
        } else {
          setUsers(MOCK_USERS);
          localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(MOCK_USERS));
        }

        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        } else {
          setOrders(MOCK_ORDERS);
          localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(MOCK_ORDERS));
        }

        if (storedRatings) {
          setRatings(JSON.parse(storedRatings));
        } else {
          setRatings([]);
        }

        if (storedActivityLogs) {
          setActivityLogs(JSON.parse(storedActivityLogs));
        } else {
          setActivityLogs([]);
        }

        if (storedOrderStatusHistory) {
          setOrderStatusHistory(JSON.parse(storedOrderStatusHistory));
        } else {
          setOrderStatusHistory([]);
        }
      }
    }
  }, [isSupabaseConfigured]);

  // Supabase Auth session listener — syncs login state with real Supabase Auth
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Check existing session on mount (e.g. after page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Session exists → fetch profile from DB
        supabase!.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data: profile }) => {
            if (profile) {
              const activeProfile: UserProfile = {
                id: profile.id,
                email: profile.email,
                full_name: profile.full_name || '',
                avatar_url: profile.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.full_name}`,
                role: profile.role,
                reputation: profile.reputation,
                orders_completed: profile.orders_completed,
                is_banned: profile.is_banned,
                balance: profile.balance !== undefined && profile.balance !== null ? Number(profile.balance) : 200000,
                created_at: profile.created_at
              };
              setUser(activeProfile);
              localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(activeProfile));
            }
          });
      } else {
        // No valid session → clear stale user from localStorage
        const storedUser = localStorage.getItem(STORAGE_KEYS.user);
        if (storedUser) {
          localStorage.removeItem(STORAGE_KEYS.user);
          setUser(null);
        }
      }
    });

    // Listen for sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase!.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data: profile }) => {
            if (profile) {
              const activeProfile: UserProfile = {
                id: profile.id,
                email: profile.email,
                full_name: profile.full_name || '',
                avatar_url: profile.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.full_name}`,
                role: profile.role,
                reputation: profile.reputation,
                orders_completed: profile.orders_completed,
                is_banned: profile.is_banned,
                balance: profile.balance !== undefined && profile.balance !== null ? Number(profile.balance) : 200000,
                created_at: profile.created_at
              };
              setUser(activeProfile);
              localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(activeProfile));
            }
          });
      } else {
        setUser(null);
        localStorage.removeItem(STORAGE_KEYS.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [isSupabaseConfigured]);

  // Sync with Supabase Realtime channel
  useEffect(() => {
    const client = supabase;
    if (isSupabaseConfigured && client) {
      fetchFromSupabase();

      const dbSubscription = client
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => { fetchFromSupabase(); }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          () => { fetchFromSupabase(); }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'ratings' },
          () => { fetchFromSupabase(); }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'chats' },
          () => { fetchFromSupabase(); }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'activity_logs' },
          () => { fetchFromSupabase(); }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'order_status_history' },
          () => { fetchFromSupabase(); }
        )
        .subscribe();

      return () => {
        client.removeChannel(dbSubscription);
      };
    }
  }, [isSupabaseConfigured]);

  // Save changes helper for LocalStorage
  const saveState = (updatedUsers: UserProfile[], updatedOrders: Order[], updatedRatings: Rating[]) => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(updatedUsers));
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(updatedOrders));
    localStorage.setItem(STORAGE_KEYS.ratings, JSON.stringify(updatedRatings));
    
    setUsers(updatedUsers);
    setOrders(updatedOrders);
    setRatings(updatedRatings);
  };

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      created_at: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const saveChats = (updatedChats: ChatMessage[]) => {
    localStorage.setItem(STORAGE_KEYS.chats, JSON.stringify(updatedChats));
    setChats(updatedChats);
  };

  const saveActivityLogs = (updatedLogs: ActivityLog[]) => {
    const limitedLogs = updatedLogs.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.activityLogs, JSON.stringify(limitedLogs));
    setActivityLogs(limitedLogs);
  };

  const saveOrderHistory = (updatedHistory: OrderStatusHistory[]) => {
    const limitedHistory = updatedHistory.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.orderStatusHistory, JSON.stringify(limitedHistory));
    setOrderStatusHistory(limitedHistory);
  };

  const recordActivity = async (params: {
    action: string;
    entityType: ActivityLog['entity_type'];
    entityId?: string | null;
    metadata?: Record<string, unknown>;
    actor?: Pick<UserProfile, 'id' | 'role'> | null;
  }) => {
    const actor = params.actor ?? user;
    const entry: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      actor_id: actor?.id ?? null,
      actor_role: actor?.role ?? null,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      metadata: params.metadata ?? {},
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('activity_logs').insert({
          actor_id: entry.actor_id,
          actor_role: entry.actor_role,
          action: entry.action,
          entity_type: entry.entity_type,
          entity_id: entry.entity_id,
          metadata: entry.metadata
        });
        if (error) throw error;
        setActivityLogs(prev => [entry, ...prev].slice(0, 50));
      } catch (err) {
        console.error('Error writing activity log to Supabase:', err);
      }
      return;
    }

    setActivityLogs(prev => {
      const limited = [entry, ...prev].slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.activityLogs, JSON.stringify(limited));
      return limited;
    });
  };

  const recordOrderHistory = async (params: {
    orderId: string;
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    note?: string | null;
    actor?: Pick<UserProfile, 'id' | 'role'> | null;
  }) => {
    const actor = params.actor ?? user;
    const entry: OrderStatusHistory = {
      id: `order-hist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      order_id: params.orderId,
      actor_id: actor?.id ?? null,
      actor_role: actor?.role ?? null,
      from_status: params.fromStatus,
      to_status: params.toStatus,
      note: params.note ?? null,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('order_status_history').insert({
          order_id: entry.order_id,
          actor_id: entry.actor_id,
          actor_role: entry.actor_role,
          from_status: entry.from_status,
          to_status: entry.to_status,
          note: entry.note
        });
        if (error) throw error;
        setOrderStatusHistory(prev => [entry, ...prev].slice(0, 100));
      } catch (err) {
        console.error('Error writing order history to Supabase:', err);
      }
      return;
    }

    setOrderStatusHistory(prev => {
      const limited = [entry, ...prev].slice(0, 100);
      localStorage.setItem(STORAGE_KEYS.orderStatusHistory, JSON.stringify(limited));
      return limited;
    });
  };

  const sendChatMessage = async (orderId: string, message: string) => {
    if (!user) return false;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('chats')
          .insert({
            order_id: orderId,
            sender_id: user.id,
            sender_name: user.full_name,
            sender_avatar: user.avatar_url,
            message: message
          });

        if (error) throw error;
        
        fetchFromSupabase();
        await recordActivity({
          action: 'chat_message_sent',
          entityType: 'chat',
          entityId: orderId,
          metadata: { preview: message.slice(0, 120) },
          actor: user
        });
        return true;
      } catch (err) {
        console.error('Error sending chat to Supabase:', err);
        return false;
      }
    } else {
      const newMsg: ChatMessage = {
        id: `chat-${Date.now()}`,
        order_id: orderId,
        sender_id: user.id,
        sender_name: user.full_name,
        sender_avatar: user.avatar_url,
        message,
        created_at: new Date().toISOString()
      };

      const updatedChats = [...chats, newMsg];
      saveChats(updatedChats);
      await recordActivity({
        action: 'chat_message_sent',
        entityType: 'chat',
        entityId: orderId,
        metadata: { preview: message.slice(0, 120) },
        actor: user
      });
      return true;
    }
  };

  const deposit = async (amount: number) => {
    if (!user) return;
    const updatedUser = { ...user, balance: (user.balance || 0) + amount };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('profiles')
          .update({ balance: updatedUser.balance })
          .eq('id', user.id);
        
        fetchFromSupabase();
      } catch (err) {
        console.error('Error depositing on Supabase:', err);
      }
    } else {
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      saveState(updatedUsers, orders, ratings);
    }

    addNotification(
      'Nạp tiền thành công', 
      `Đã nạp +${amount.toLocaleString('vi-VN')}đ vào CampusWallet của bạn.`, 
      'success'
    );

    await recordActivity({
      action: 'wallet_deposit',
      entityType: 'wallet',
      entityId: user.id,
      metadata: { amount, newBalance: updatedUser.balance },
      actor: user
    });
  };

  const updateUserAvatar = async (file: File) => {
    if (!user) return false;

    // Supabase path: upload to storage bucket 'avatars' and update profiles.avatar_url
    if (isSupabaseConfigured && supabase) {
      try {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const fileName = `${user.id}_${Date.now()}.${ext}`;
        const path = `avatars/${user.id}/${fileName}`;

        // Upload
        const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { cacheControl: '3600', upsert: true });
        if (uploadError) throw uploadError;

        // Get public URL (use signed URL if you use private buckets)
        const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(path);
        const publicUrl = publicData?.publicUrl || '';

        // Update profile record
        const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
        if (updateError) throw updateError;

        const updatedUser = { ...user, avatar_url: publicUrl };
        setUser(updatedUser);
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));

        addNotification('Ảnh đại diện cập nhật', 'Ảnh đại diện đã được tải lên và lưu trên Supabase.', 'success');

        await recordActivity({ action: 'update_avatar', entityType: 'profile', entityId: user.id, actor: user });

        // Refresh data
        fetchFromSupabase();
        return true;
      } catch (err) {
        console.error('Error uploading avatar to Supabase:', err);
        addNotification('Lỗi upload', 'Không thể tải ảnh lên. Vui lòng thử lại.', 'warning');
        return false;
      }
    }

    // Demo/local mode: store data URL in localStorage
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const updatedUser = { ...user, avatar_url: dataUrl };
      setUser(updatedUser);

      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      saveState(updatedUsers, orders, ratings);

      addNotification('Ảnh đại diện cập nhật', 'Ảnh đại diện đã được lưu cục bộ.', 'success');

      await recordActivity({ action: 'update_avatar', entityType: 'profile', entityId: user.id, actor: user });
      return true;
    } catch (err) {
      console.error('Error saving avatar locally:', err);
      addNotification('Lỗi lưu ảnh', 'Không thể lưu ảnh cục bộ.', 'warning');
      return false;
    }
  };

  // --- ACTIONS ---

  // Auth: Email verification & Mock/Supabase Login
  const login = async (email: string, fullName?: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu(\.[a-zA-Z]{2,})?$/i;
    const isSchoolEmail = emailRegex.test(email) || email.endsWith('.edu') || email.includes('.edu.vn') || email.includes('student');
    
    if (!isSchoolEmail) {
      return { success: false, error: 'Chỉ chấp nhận email sinh viên trường đại học (VD: tên@hust.edu.vn, *.edu, ...)' };
    }

    try {
      if (isSupabaseConfigured && supabase) {
        const defaultPassword = 'Password123!';
        const namePart = fullName || email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        let authUser = null;

        // Attempt signup
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.toLowerCase(),
          password: defaultPassword,
          options: {
            data: {
              full_name: namePart,
              avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${namePart}`
            }
          }
        });

        if (signUpError) {
          // If already registered, attempt login
          if (signUpError.message.includes('already') || signUpError.status === 400 || signUpError.message.toLowerCase().includes('use')) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: email.toLowerCase(),
              password: defaultPassword
            });
            if (signInError) {
              return { success: false, error: signInError.message };
            }
            authUser = signInData.user;
          } else {
            return { success: false, error: signUpError.message };
          }
        } else {
          authUser = signUpData.user;
        }

        if (!authUser) {
          return { success: false, error: 'Không thể xác thực tài khoản trên Supabase Auth' };
        }

        // Fetch profile created by DB trigger with slight delay to ensure trigger execution
        let profile = null;
        for (let i = 0; i < 5; i++) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
          if (data) {
            profile = data;
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (!profile) {
          return { success: false, error: 'Không tìm thấy profile tương ứng. Vui lòng đăng nhập lại!' };
        }

        if (profile.is_banned) {
          return { success: false, error: 'Tài khoản của bạn đã bị khóa do vi phạm chính sách cộng đồng!' };
        }

        const activeProfile: UserProfile = {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || namePart,
          avatar_url: profile.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${namePart}`,
          role: profile.role,
          reputation: profile.reputation,
          orders_completed: profile.orders_completed,
          is_banned: profile.is_banned,
          balance: profile.balance !== undefined && profile.balance !== null ? Number(profile.balance) : 200000,
          created_at: profile.created_at
        };

        setUser(activeProfile);
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(activeProfile));
        addNotification('Đăng nhập thành công', `Chào mừng ${activeProfile.full_name} quay trở lại!`, 'success');
        await recordActivity({
          action: 'login_success',
          entityType: 'auth',
          entityId: activeProfile.id,
          metadata: { email: activeProfile.email, source: 'supabase' },
          actor: activeProfile
        });
        return { success: true };
      }

      // LocalStorage flow
      let existingProfile = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (existingProfile) {
        if (existingProfile.is_banned) {
          return { success: false, error: 'Tài khoản của bạn đã bị khóa do vi phạm chính sách cộng đồng!' };
        }
      } else {
        const namePart = fullName || email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        let startingRole: UserRole = 'khach_hang';
        if (email.toLowerCase().includes('shipper')) startingRole = 'shipper';
        if (email.toLowerCase().includes('admin')) startingRole = 'quan_tri';

        existingProfile = {
          id: `user-${Date.now()}`,
          email: email.toLowerCase(),
          full_name: namePart,
          avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${namePart}`,
          role: startingRole,
          reputation: 100,
          orders_completed: 0,
          is_banned: false,
          balance: 200000,
          created_at: new Date().toISOString()
        };

        const updatedUsers = [...users, existingProfile];
        saveState(updatedUsers, orders, ratings);
      }

      setUser(existingProfile);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(existingProfile));
      addNotification('Đăng nhập thành công', `Chào mừng ${existingProfile.full_name} quay trở lại!`, 'success');

      await recordActivity({
        action: existingProfile ? 'login_success' : 'login_created_mock',
        entityType: 'auth',
        entityId: existingProfile.id,
        metadata: { email: existingProfile.email, source: 'local' },
        actor: existingProfile
      });

      return { success: true };
    } catch (e: unknown) {
      return { success: false, error: (e as Error).message || 'Lỗi đăng nhập hệ thống' };
    }
  };

  const logout = () => {
    if (user) {
      void recordActivity({
        action: 'logout',
        entityType: 'auth',
        entityId: user.id,
        metadata: { email: user.email },
        actor: user
      });
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.user);
    setNotifications([]);
  };

  const switchRole = async (newRole: UserRole) => {
    if (!user) return;

    if (newRole === 'quan_tri' && !canSwitchToAdminAccount(user)) {
      addNotification('Không đủ quyền', 'Chỉ tài khoản admin thật mới được vào khu vực quản trị.', 'warning');
      return;
    }

    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', user.id);
        fetchFromSupabase();
      } catch (err) {
        console.error('Lỗi chuyển vai trò trên Supabase:', err);
      }
    } else {
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      saveState(updatedUsers, orders, ratings);
    }
    
    addNotification('Chuyển vai trò', `Bạn đang trải nghiệm với vai trò: ${
      newRole === 'khach_hang' ? 'Sinh viên đặt đơn' : newRole === 'shipper' ? 'Shipper giao hàng' : 'Quản trị viên (Admin)'
    }`, 'info');

    await recordActivity({
      action: 'role_switched',
      entityType: 'profile',
      entityId: user.id,
      metadata: { from: user.role, to: newRole },
      actor: user
    });
  };

  const createOrder = async (
    orderData: Omit<Order, 'id' | 'customer_id' | 'customer_name' | 'customer_avatar' | 'status' | 'created_at' | 'shipper_id' | 'shipper_name' | 'shipper_avatar'>,
    printing?: PrintingDetails
  ) => {
    if (!user) return false;
    if (user.is_banned) {
      addNotification('Không thể tạo đơn', 'Tài khoản của bạn đã bị khóa, không thể tạo đơn mới.', 'warning');
      return false;
    }

    const { estimatedItemCost, totalAmount } = calculateOrderPricing(
      orderData.order_type,
      orderData.shipping_fee,
      orderData.item_cost,
      printing
    );

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: newOrderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            customer_id: user.id,
            title: orderData.title,
            description: orderData.description,
            order_type: orderData.order_type,
            delivery_location: orderData.delivery_location,
            phone_number: orderData.phone_number,
            notes: orderData.notes,
            shipping_fee: orderData.shipping_fee,
            item_cost: estimatedItemCost,
            total_amount: totalAmount,
            status: 'cho_nhan'
          })
          .select()
          .single();

        if (orderError) throw orderError;

        if (orderData.order_type === 'in_an' && printing && newOrderData) {
          const { error: printingError } = await supabase
            .from('printing_details')
            .insert({
              order_id: newOrderData.id,
              file_name: printing.file_name,
              file_url: 'https://example.com/mock-pdf-url',
              copies: printing.copies,
              is_color: printing.is_color,
              is_double_sided: printing.is_double_sided
            });
          
          if (printingError) throw printingError;
        }

        addNotification('Đặt đơn thành công', `Đơn "${orderData.title}" đã được đăng lên hệ thống Supabase.`, 'success');

        await recordActivity({
          action: 'order_created',
          entityType: 'order',
          entityId: newOrderData?.id ?? null,
          metadata: {
            order_type: orderData.order_type,
            shipping_fee: orderData.shipping_fee,
            total_amount: totalAmount
          },
          actor: user
        });

        await recordOrderHistory({
          orderId: newOrderData?.id ?? '',
          fromStatus: null,
          toStatus: 'cho_nhan',
          note: 'Đơn hàng được tạo mới',
          actor: user
        });


        fetchFromSupabase();
        return true;
      } catch (err: any) {
        console.error('Error creating order in Supabase:', err);
        const errMsg = err?.message || JSON.stringify(err) || 'Lỗi không xác định';
        addNotification('Lỗi đặt đơn', `Không thể tạo đơn: ${errMsg}`, 'warning');
        return false;
      }
    } else {
      const newOrder: Order = {
        ...orderData,
        id: `order-${Date.now()}`,
        customer_id: user.id,
        customer_name: user.full_name,
        customer_avatar: user.avatar_url,
        item_cost: estimatedItemCost,
        total_amount: totalAmount,
        status: 'cho_nhan',
        created_at: new Date().toISOString(),
        printing_details: orderData.order_type === 'in_an' ? printing : undefined
      };

      const updatedOrders = [newOrder, ...orders];
      saveState(users, updatedOrders, ratings);

      addNotification('Đặt đơn thành công', `Đơn "${newOrder.title}" đã được đăng (Hình thức: COD Tiền mặt).`, 'success');

      await recordActivity({
        action: 'order_created',
        entityType: 'order',
        entityId: newOrder.id,
        metadata: {
          order_type: newOrder.order_type,
          shipping_fee: newOrder.shipping_fee,
          total_amount: newOrder.total_amount
        },
        actor: user
      });

      await recordOrderHistory({
        orderId: newOrder.id,
        fromStatus: null,
        toStatus: 'cho_nhan',
        note: 'Đơn hàng được tạo mới',
        actor: user
      });


      return true;
    }
  };

  const acceptOrder = async (orderId: string) => {
    if (!user || user.role !== 'shipper') return false;

    if (user.is_banned) {
      addNotification('Lỗi', 'Tài khoản của bạn đã bị khóa, không thể nhận đơn.', 'warning');
      return false;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({
            shipper_id: user.id,
            status: 'da_nhan'
          })
          .eq('id', orderId)
          .eq('status', 'cho_nhan');

        if (error) throw error;

        addNotification(
          'Đơn hàng được nhận', 
          `Bạn đã nhận đơn hàng thành công trên hệ thống.`, 
          'success'
        );

        await recordActivity({
          action: 'order_accepted',
          entityType: 'order',
          entityId: orderId,
          metadata: { shipper_id: user.id },
          actor: user
        });

        await recordOrderHistory({
          orderId,
          fromStatus: 'cho_nhan',
          toStatus: 'da_nhan',
          note: `Shipper ${user.full_name} đã nhận đơn`,
          actor: user
        });

        fetchFromSupabase();
        return true;
      } catch (err) {
        console.error('Error accepting order on Supabase:', err);
        addNotification('Lỗi nhận đơn', 'Đơn hàng có thể đã được người khác nhận hoặc xảy ra lỗi kết nối.', 'warning');
        return false;
      }
    } else {
      const targetOrder = orders.find(o => o.id === orderId);
      if (!targetOrder || !canTransitionOrderStatus(targetOrder, 'da_nhan', user)) return false;

      const updatedOrder: Order = {
        ...targetOrder,
        shipper_id: user.id,
        shipper_name: user.full_name,
        shipper_avatar: user.avatar_url,
        status: 'da_nhan'
      };

      const updatedOrders = orders.map(o => o.id === orderId ? updatedOrder : o);
      saveState(users, updatedOrders, ratings);

      addNotification(
        'Đơn hàng được nhận', 
        `Shipper ${user.full_name} đã nhận đơn "${targetOrder.title}" của bạn.`, 
        'success'
      );

      await recordActivity({
        action: 'order_accepted',
        entityType: 'order',
        entityId: orderId,
        metadata: { shipper_id: user.id },
        actor: user
      });

      await recordOrderHistory({
        orderId,
        fromStatus: 'cho_nhan',
        toStatus: 'da_nhan',
        note: `Shipper ${user.full_name} đã nhận đơn`,
        actor: user
      });

      return true;
    }
  };

  const updateOrderStatus = async (orderId: string, nextStatus: OrderStatus, actualItemCost?: number) => {
    if (!user) return false;
    if (user.is_banned) {
      addNotification('Không thể thao tác', 'Tài khoản của bạn đang bị khóa.', 'warning');
      return false;
    }

    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return false;

    if (!canTransitionOrderStatus(targetOrder, nextStatus, user)) {
      addNotification('Trạng thái không hợp lệ', 'Bạn không có quyền thực hiện chuyển trạng thái này.', 'warning');
      return false;
    }

    const itemCost = targetOrder.item_cost || (targetOrder.total_amount ? targetOrder.total_amount - targetOrder.shipping_fee : 0);
    const finalItemCost = actualItemCost !== undefined ? actualItemCost : itemCost;
    const finalTotalAmount = finalItemCost + targetOrder.shipping_fee;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({
            status: nextStatus,
            item_cost: finalItemCost,
            total_amount: finalTotalAmount
          })
          .eq('id', orderId);

        if (error) throw error;

        if (nextStatus === 'hoan_thanh' && targetOrder.status !== 'hoan_thanh' && targetOrder.shipper_id) {
          const customerProfile = users.find(u => u.id === targetOrder.customer_id);
          const newCustBalance = Math.max(0, (customerProfile?.balance || 0) - finalTotalAmount);
          await supabase
            .from('profiles')
            .update({ balance: newCustBalance })
            .eq('id', targetOrder.customer_id);

          const shipperProfile = users.find(u => u.id === targetOrder.shipper_id);
          const newShipBalance = (shipperProfile?.balance || 0) + targetOrder.shipping_fee;
          await supabase
            .from('profiles')
            .update({ balance: newShipBalance })
            .eq('id', targetOrder.shipper_id);

          addNotification(
            'Đơn hàng hoàn thành! 🎉', 
            `Đơn "${targetOrder.title}" đã giao thành công. Đã thu COD ${finalTotalAmount.toLocaleString('vi-VN')}đ. Shipper nhận +5 uy tín!`, 
            'success'
          );
        } else if (nextStatus === 'da_huy') {
          if (targetOrder.shipper_id) {
            const shipperProfile = users.find(u => u.id === targetOrder.shipper_id);
            const newRep = Math.max(0, (shipperProfile?.reputation || 0) - 15);
            await supabase
              .from('profiles')
              .update({ reputation: newRep })
              .eq('id', targetOrder.shipper_id);
          }

          addNotification(
            'Hủy đơn hàng', 
            `Đơn hàng "${targetOrder.title}" đã bị hủy.`, 
            'warning'
          );
        } else if (nextStatus === 'dang_giao') {
          addNotification(
            'Đang giao hàng', 
            `Shipper bắt đầu giao đơn "${targetOrder.title}".`, 
            'info'
          );
        }

        await recordActivity({
          action: `order_status_${nextStatus}`,
          entityType: 'order',
          entityId: orderId,
          metadata: { previous_status: targetOrder.status, next_status: nextStatus, item_cost: finalItemCost, total_amount: finalTotalAmount },
          actor: user
        });

        await recordOrderHistory({
          orderId,
          fromStatus: targetOrder.status,
          toStatus: nextStatus,
          note: nextStatus === 'hoan_thanh'
            ? `Hoàn thành với COD ${finalTotalAmount.toLocaleString('vi-VN')}đ`
            : nextStatus === 'dang_giao'
              ? 'Shipper bắt đầu giao đơn'
              : 'Đơn hàng bị hủy',
          actor: user
        });

        fetchFromSupabase();
        return true;
      } catch (err) {
        console.error('Error updating order status in Supabase:', err);
        return false;
      }
    } else {
      const updatedOrder: Order = {
        ...targetOrder,
        item_cost: finalItemCost,
        total_amount: finalTotalAmount,
        status: nextStatus
      };

      let updatedUsers = [...users];

      if (nextStatus === 'hoan_thanh' && targetOrder.status !== 'hoan_thanh' && targetOrder.shipper_id) {
        updatedUsers = users.map(u => {
          if (u.id === targetOrder.customer_id) {
            return {
              ...u,
              balance: Math.max(0, (u.balance || 0) - finalTotalAmount)
            };
          }
          if (u.id === targetOrder.shipper_id) {
            return {
              ...u,
              orders_completed: u.orders_completed + 1,
              reputation: Math.min(u.reputation + 5, 200),
              balance: (u.balance || 0) + targetOrder.shipping_fee
            };
          }
          return u;
        });

        if (user) {
          const activeUserUpdate = updatedUsers.find(u => u.id === user.id);
          if (activeUserUpdate) {
            setUser(activeUserUpdate);
            localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(activeUserUpdate));
          }
        }

        addNotification(
          'Đơn hàng hoàn thành! 🎉', 
          `Đơn "${targetOrder.title}" đã giao thành công. Đã thu COD ${finalTotalAmount.toLocaleString('vi-VN')}đ. Shipper nhận +5 uy tín!`, 
          'success'
        );
      } else if (nextStatus === 'da_huy') {
        if (targetOrder.shipper_id) {
          updatedUsers = users.map(u => {
            if (u.id === targetOrder.shipper_id) {
              return {
                ...u,
                reputation: Math.max(u.reputation - 15, 0)
              };
            }
            return u;
          });

          if (user) {
            const activeUserUpdate = updatedUsers.find(u => u.id === user.id);
            if (activeUserUpdate) {
              setUser(activeUserUpdate);
              localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(activeUserUpdate));
            }
          }
        }

        addNotification(
          'Hủy đơn hàng', 
          `Đơn hàng "${targetOrder.title}" đã bị hủy.`, 
          'warning'
        );
      } else if (nextStatus === 'dang_giao') {
        addNotification(
          'Đang giao hàng', 
          `Shipper bắt đầu giao đơn "${targetOrder.title}".`, 
          'info'
        );
      }

      const updatedOrders = orders.map(o => o.id === orderId ? updatedOrder : o);
      saveState(updatedUsers, updatedOrders, ratings);

      await recordActivity({
        action: `order_status_${nextStatus}`,
        entityType: 'order',
        entityId: orderId,
        metadata: { previous_status: targetOrder.status, next_status: nextStatus, item_cost: finalItemCost, total_amount: finalTotalAmount },
        actor: user
      });

      await recordOrderHistory({
        orderId,
        fromStatus: targetOrder.status,
        toStatus: nextStatus,
        note: nextStatus === 'hoan_thanh'
          ? `Hoàn thành với COD ${finalTotalAmount.toLocaleString('vi-VN')}đ`
          : nextStatus === 'dang_giao'
            ? 'Shipper bắt đầu giao đơn'
            : 'Đơn hàng bị hủy',
        actor: user
      });

      return true;
    }
  };

  const submitRating = async (orderId: string, toId: string, score: number, comment: string) => {
    if (!user) return false;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('ratings')
          .insert({
            order_id: orderId,
            from_id: user.id,
            to_id: toId,
            rating: score,
            comment: comment
          });

        if (error) throw error;

        const targetUser = users.find(u => u.id === toId);
        if (targetUser) {
          const factor = score >= 4 ? 4 : score === 3 ? 0 : -8;
          const newRep = Math.max(0, Math.min(200, (targetUser.reputation || 100) + factor));
          await supabase
            .from('profiles')
            .update({ reputation: newRep })
            .eq('id', toId);
        }

        addNotification('Đánh giá thành công', 'Cảm ơn phản hồi của bạn giúp xây dựng cộng đồng an toàn!', 'success');
        await recordActivity({
          action: 'rating_submitted',
          entityType: 'rating',
          entityId: orderId,
          metadata: { to_id: toId, rating: score },
          actor: user
        });
        fetchFromSupabase();
        return true;
      } catch (err) {
        console.error('Error submitting rating to Supabase:', err);
        return false;
      }
    } else {
      const newRating: Rating = {
        id: `rate-${Date.now()}`,
        order_id: orderId,
        from_id: user.id,
        to_id: toId,
        rating: score,
        comment,
        created_at: new Date().toISOString()
      };

      const updatedRatings = [...ratings, newRating];

      const updatedUsers = users.map(u => {
        if (u.id === toId) {
          const factor = score >= 4 ? 4 : score === 3 ? 0 : -8;
          return {
            ...u,
            reputation: Math.max(0, Math.min(200, u.reputation + factor))
          };
        }
        return u;
      });

      saveState(updatedUsers, orders, updatedRatings);
      addNotification('Đánh giá thành công', 'Cảm ơn phản hồi của bạn giúp xây dựng cộng đồng an toàn!', 'success');

      await recordActivity({
        action: 'rating_submitted',
        entityType: 'rating',
        entityId: orderId,
        metadata: { to_id: toId, rating: score },
        actor: user
      });

      return true;
    }
  };

  const toggleBanUser = async (userId: string) => {
    if (!user || user.role !== 'quan_tri') return;

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    const newBan = !targetUser.is_banned;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('profiles')
          .update({ is_banned: newBan })
          .eq('id', userId);
        
        addNotification(
          newBan ? 'Khóa tài khoản' : 'Mở khóa tài khoản', 
          `Đã ${newBan ? 'khóa' : 'mở khóa'} tài khoản của ${targetUser.full_name}.`, 
          newBan ? 'warning' : 'success'
        );

        await recordActivity({
          action: newBan ? 'user_banned' : 'user_unbanned',
          entityType: 'profile',
          entityId: userId,
          metadata: { target_email: targetUser.email },
          actor: user
        });

        if (user.id === userId) {
          logout();
        } else {
          fetchFromSupabase();
        }
      } catch (err) {
        console.error('Error banning user in Supabase:', err);
      }
    } else {
      const updatedUsers = users.map(u => {
        if (u.id === userId) {
          return { ...u, is_banned: newBan };
        }
        return u;
      });

      if (user.id === userId) {
        logout();
        return;
      }

      saveState(updatedUsers, orders, ratings);
      
      addNotification(
        newBan ? 'Khóa tài khoản' : 'Mở khóa tài khoản', 
        `Đã ${newBan ? 'khóa' : 'mở khóa'} tài khoản của ${targetUser.full_name}.`, 
        newBan ? 'warning' : 'success'
      );

      await recordActivity({
        action: newBan ? 'user_banned' : 'user_unbanned',
        entityType: 'profile',
        entityId: userId,
        metadata: { target_email: targetUser.email },
        actor: user
      });
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      users,
      orders,
      ratings,
      activityLogs,
      orderStatusHistory,
      notifications,
      isDemoMode,
      login,
      logout,
      switchRole,
      createOrder,
      acceptOrder,
      updateOrderStatus,
      submitRating,
      toggleBanUser,
      clearNotification,
      addNotification,
      deposit,
      	updateUserAvatar,
      chats,
      sendChatMessage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
