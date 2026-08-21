'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { safeFetchJson } from '@/lib/apiHelper';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Attendance Confirmed',
    message: 'Your attendance for Python Programming (Period 1) has been recorded via QR scan.',
    type: 'ATTENDANCE',
    isRead: false,
    link: '/student/attendance',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    title: 'New Study Material Published',
    message: 'Dr. Pratibha Rao uploaded Unit 3: Object-Oriented Python notes.',
    type: 'MATERIAL',
    isRead: false,
    link: '/student/materials',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>(DEFAULT_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(2);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      const { ok, data } = await safeFetchJson(
        `/api/notifications?userId=${user.userId}`,
        undefined,
        { notifications: DEFAULT_NOTIFICATIONS, unreadCount: 2 }
      );
      if (data?.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.warn('Error fetching notifications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      fetchNotifications();
    }
  }, [user?.userId]);

  const markAsRead = async (id: string) => {
    try {
      await safeFetchJson('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.warn(e);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.userId) return;
    try {
      await safeFetchJson('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true, userId: user.userId }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
