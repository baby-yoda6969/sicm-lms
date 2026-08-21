'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getAssetPath } from '@/lib/utils';
import { useNotifications } from '@/context/NotificationContext';
import { useSidebar } from '@/context/SidebarContext';
import {
  Bell,
  CheckCheck,
  ChevronDown,
  LogOut,
  Sparkles,
  User,
  ShieldCheck,
  Award,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, switchDemoUser } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { isCollapsed, toggleSidebar, isAnimated } = useSidebar();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Chancellor / Dean Portal', color: 'bg-purple-50 text-purple-900 border-purple-200' };
      case 'TEACHER':
        return { label: 'Faculty Fellowship', color: 'bg-blue-50 text-blue-900 border-blue-200' };
      case 'STUDENT':
      default:
        return { label: 'Collegiate Student Portal', color: 'bg-emerald-50 text-emerald-900 border-emerald-200' };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-stone-200/90 bg-white/98 backdrop-blur-md shadow-2xs">
      {/* Left Column: Synchronized with Sidebar rail width */}
      <div
        className={`flex items-center h-full border-r border-stone-200/90 shrink-0 ${
          isAnimated ? 'transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]' : ''
        } ${
          isCollapsed ? 'w-16 justify-center' : 'w-64 px-4 justify-between'
        }`}
      >
        {isCollapsed ? (
          /* When collapsed: ONLY the SICM Logo is displayed on top-left */
          <button
            type="button"
            onClick={toggleSidebar}
            title="Expand sidebar"
            className="group relative flex size-10 items-center justify-center rounded-xl bg-white p-1 shadow-2xs ring-1 ring-stone-200 hover:ring-blue-500 transition-all cursor-pointer"
          >
            <img
              src={getAssetPath('/logo.png')}
              alt="SICM Logo"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('/sicm-lms/')) {
                  target.src = '/sicm-lms/logo.png';
                }
              }}
              className="h-full w-full object-contain transition-transform group-hover:scale-90"
            />
            {/* Smooth hover expand icon overlay */}
            <span className="absolute inset-0 flex items-center justify-center bg-blue-600/85 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
              <PanelLeftOpen className="size-4.5 text-white" />
            </span>
          </button>
        ) : (
          /* When expanded: Full Logo + SICM typography + Collapse button */
          <div className="flex items-center justify-between w-full">
            <Link href="/" className="flex items-center gap-2.5 group overflow-hidden">
              <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-white p-0.5 shadow-2xs ring-1 ring-stone-200 group-hover:scale-105 transition-transform">
                <img
                  src={getAssetPath('/logo.png')}
                  alt="SICM"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('/sicm-lms/')) {
                      target.src = '/sicm-lms/logo.png';
                    }
                  }}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="overflow-hidden whitespace-nowrap">
                <span className="font-extrabold text-base tracking-tight text-stone-900 block leading-tight">
                  SICM
                </span>
                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                  Jnanam Brahma
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={toggleSidebar}
              title="Collapse sidebar"
              className="flex size-8 items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <PanelLeftClose className="size-4.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Navbar Header Content */}
      <div className="flex-1 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {user && (
            <span
              className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold border ${roleInfo.color}`}
            >
              {roleInfo.label}
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* 1-Click Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowNotificationDrawer(false);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/90 hover:bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-900 transition-all shadow-2xs cursor-pointer"
            >
              <Award className="size-3.5 text-blue-700" />
              <span className="hidden sm:inline text-stone-500">Persona:</span>
              <span className="font-bold text-stone-900 capitalize">{user?.role?.toLowerCase() || 'Guest'}</span>
              <ChevronDown className="size-3 text-stone-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-stone-100">
                  <p className="text-xs font-bold text-stone-900">Switch Persona</p>
                  <p className="text-[10px] text-stone-500">Instant test demo accounts</p>
                </div>
                <div className="mt-1 space-y-1">
                  <button
                    onClick={() => {
                      switchDemoUser('STUDENT');
                      setShowRoleMenu(false);
                    }}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs hover:bg-emerald-50 hover:text-emerald-900 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-stone-900">Aarav Sharma</p>
                      <p className="text-[10px] text-stone-500">BCA 2nd Year (Student)</p>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Student</span>
                  </button>

                  <button
                    onClick={() => {
                      switchDemoUser('TEACHER');
                      setShowRoleMenu(false);
                    }}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs hover:bg-blue-50 hover:text-blue-900 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-stone-900">Dr. Pratibha Rao</p>
                      <p className="text-[10px] text-stone-500">Faculty & HOD</p>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">Teacher</span>
                  </button>

                  <button
                    onClick={() => {
                      switchDemoUser('ADMIN');
                      setShowRoleMenu(false);
                    }}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs hover:bg-purple-50 hover:text-purple-900 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-stone-900">Prof. Narayana S.</p>
                      <p className="text-[10px] text-stone-500">Academic Dean</p>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">Admin</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotificationDrawer(!showNotificationDrawer);
                setShowRoleMenu(false);
                setShowUserMenu(false);
              }}
              className="relative flex size-9 items-center justify-center rounded-xl border border-stone-200 bg-stone-50/80 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-all cursor-pointer"
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotificationDrawer && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-stone-200 bg-white p-4 shadow-xl z-50 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="size-4 text-blue-700" />
                    <h4 className="text-sm font-bold text-stone-900">Academic Dispatches</h4>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="size-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 text-xs">
                  {notifications.length === 0 ? (
                    <p className="p-6 text-center text-stone-400">No new notices.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-2.5 transition-colors cursor-pointer ${
                          n.read ? 'opacity-60 hover:opacity-100' : 'bg-blue-50/40 font-medium'
                        }`}
                      >
                        <p className="font-semibold text-stone-800">{n.title}</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowRoleMenu(false);
                setShowNotificationDrawer(false);
              }}
              className="flex size-9 items-center justify-center rounded-xl overflow-hidden ring-1 ring-stone-200 hover:ring-blue-500 transition-all cursor-pointer shadow-2xs"
            >
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=95'
                }
                alt="User"
                className="h-full w-full object-cover"
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-stone-100">
                  <p className="text-xs font-bold text-stone-900">{user?.name}</p>
                  <p className="text-[10px] text-stone-500 truncate">{user?.email}</p>
                </div>
                <div className="mt-1 space-y-0.5">
                  <Link
                    href={user?.role === 'STUDENT' ? '/student/profile' : '#'}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-stone-700 hover:bg-stone-100"
                  >
                    <User className="size-3.5 text-stone-400" />
                    Profile & Academic ID
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
