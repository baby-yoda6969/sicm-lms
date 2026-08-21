'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useNotifications } from '@/context/NotificationContext';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Calendar,
  Clock,
  Info,
  CheckCircle,
  Filter,
  Award,
} from 'lucide-react';

export default function StudentNotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-extrabold text-stone-900 tracking-tight">
                Academic Dispatches & Broadcasts
              </h1>
              {unreadCount > 0 && (
                <span className="font-cinzel rounded-full bg-crimson-100 px-2.5 py-0.5 text-[10px] font-bold text-crimson-900 border border-crimson-200">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Lecture schedule modifications, substitute professor alerts, and collegiate attendance notices
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 hover:to-black text-white px-4 py-2 text-xs font-bold transition-all shadow-xs"
            >
              <CheckCheck className="h-4 w-4 text-gold-400" />
              Mark All as Read
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'ALERT', 'TIMETABLE', 'LEAVE', 'INFO'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all border ${
                filterType === type
                  ? 'bg-crimson-800 text-white border-crimson-900 shadow-xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {type === 'ALL' ? 'All Broadcasts' : type}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="rounded-3xl border border-stone-200 bg-white overflow-hidden shadow-xs divide-y divide-stone-100">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400 space-y-2">
              <Bell className="h-8 w-8 text-stone-300 mx-auto" />
              <p>No dispatches matching this filter.</p>
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-4 sm:p-5 transition-colors cursor-pointer flex items-start gap-4 ${
                  !n.isRead ? 'bg-crimson-50/30 hover:bg-crimson-50/60' : 'hover:bg-stone-50/70'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                    n.type === 'ALERT'
                      ? 'bg-crimson-100 text-crimson-800'
                      : n.type === 'TIMETABLE'
                      ? 'bg-gold-100 text-gold-900'
                      : n.type === 'LEAVE'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {n.type === 'ALERT' && <AlertTriangle className="h-5 w-5" />}
                  {n.type === 'TIMETABLE' && <Calendar className="h-5 w-5" />}
                  {n.type === 'LEAVE' && <Clock className="h-5 w-5" />}
                  {n.type === 'INFO' && <Info className="h-5 w-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif font-bold text-xs text-stone-900 truncate">{n.title}</h3>
                    <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                      {new Date(n.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(n.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">{n.message}</p>
                </div>

                {!n.isRead && (
                  <span className="h-2 w-2 rounded-full bg-crimson-600 shrink-0 mt-2" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
