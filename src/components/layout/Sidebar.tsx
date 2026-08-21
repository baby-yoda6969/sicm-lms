'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { getAssetPath } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardCheck,
  QrCode,
  Bell,
  User,
  Sparkles,
  FileSpreadsheet,
  Building,
  CalendarDays,
  CalendarClock,
  UserCheck,
  Settings,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isCollapsed, isAnimated } = useSidebar();

  const role = user?.role || 'STUDENT';

  // Clean Navigation Items
  const studentNav = [
    { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { name: 'Daily Schedule', href: '/student/timetable', icon: CalendarCheck },
    { name: 'Attendance', href: '/student/attendance', icon: ClipboardCheck },
    { name: 'QR Check-In', href: '/student/qr-checkin', icon: QrCode },
    { name: 'Notifications', href: '/student/notifications', icon: Bell },
    { name: 'Profile', href: '/student/profile', icon: User },
  ];

  const teacherNav = [
    { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
    { name: 'Teaching Schedule', href: '/teacher/timetable', icon: CalendarCheck },
    { name: 'Marks & Internal Assessment', href: '/teacher/marks', icon: Award },
    { name: 'Mark Attendance', href: '/teacher/attendance', icon: ClipboardCheck },
    { name: 'QR Session', href: '/teacher/qr-session', icon: QrCode },
    { name: 'Session Registers', href: '/teacher/history', icon: FileSpreadsheet },
    { name: 'Leaves & Sabbaticals', href: '/teacher/leaves', icon: CalendarDays },
  ];

  const adminNav = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Timetable Solver', href: '/admin/daily-timetable', icon: CalendarClock },
    { name: 'Faculty & Leaves', href: '/admin/leaves-substitutes', icon: UserCheck },
    { name: 'Analytics', href: '/admin/analytics', icon: FileSpreadsheet },
    { name: 'Cohorts & Batches', href: '/admin/academic', icon: Building },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  let currentNav = studentNav;
  if (role === 'TEACHER') currentNav = teacherNav;
  if (role === 'ADMIN') currentNav = adminNav;

  const defaultAvatar =
    role === 'TEACHER'
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=95'
      : role === 'ADMIN'
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=95'
      : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=95';

  const userPhoto = user?.avatar || defaultAvatar;

  return (
    <aside
      className={`shrink-0 border-r border-stone-200/90 bg-white min-h-[calc(100vh-4rem)] flex flex-col justify-between hidden md:flex overflow-x-hidden ${
        isAnimated ? 'transition-[width,padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]' : ''
      } ${
        isCollapsed ? 'w-16 py-4 px-0' : 'w-64 p-4'
      }`}
    >
      <div className="space-y-4">
        {/* User Profile Area */}
        {isCollapsed ? (
          <div className="flex justify-center items-center w-full pb-3 border-b border-stone-100">
            <Link
              href={role === 'STUDENT' ? '/student/profile' : '#'}
              title={`${user?.name || 'User'} (${user?.role})`}
              className="relative flex size-9 shrink-0 items-center justify-center rounded-full overflow-hidden shadow-2xs ring-1 ring-stone-200 hover:ring-blue-500 transition-transform hover:scale-105"
            >
              <img
                src={userPhoto}
                alt={user?.name || 'User'}
                className="h-full w-full object-cover"
              />
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-stone-200/70 bg-stone-50/70 p-3">
            <div className="flex items-center gap-3">
              <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-2xs ring-1 ring-stone-200">
                <img
                  src={userPhoto}
                  alt={user?.name || 'User Profile'}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="font-bold text-xs text-stone-900 truncate">
                  {user?.name || 'Academic Scholar'}
                </p>
                <p className="text-[10px] text-stone-500 truncate font-mono">
                  {user?.rollNumber || user?.employeeCode || (user?.role === 'ADMIN' ? 'SICM-ADM-001' : 'SICM Scholar')}
                </p>
                <span className="inline-block text-[10px] font-bold text-blue-900 uppercase tracking-wider">
                  {user?.role === 'TEACHER' ? 'Faculty Member' : user?.role === 'ADMIN' ? 'Administrator' : 'Student Scholar'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Item List */}
        <nav className="space-y-1">
          {!isCollapsed && (
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5 whitespace-nowrap">
              Academic Navigation
            </p>
          )}

          {currentNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <div key={item.name} className="flex justify-center">
                <Link
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center rounded-xl transition-all duration-150 relative group ${
                    isCollapsed
                      ? 'size-10 justify-center'
                      : 'w-full gap-3 px-3 py-2 text-xs font-semibold'
                  } ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60 shadow-2xs'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <Icon
                    className={`size-4.5 shrink-0 transition-colors ${
                      isActive ? 'text-blue-700' : 'text-stone-500 group-hover:text-stone-900'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate whitespace-nowrap">{item.name}</span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Collegiate Logo Footer */}
      <div className="pt-2">
        {isCollapsed ? (
          <div className="flex justify-center items-center w-full pt-3 border-t border-stone-100">
            <div
              className="flex size-8 items-center justify-center rounded-lg bg-stone-50 p-1 ring-1 ring-stone-200/80 shadow-2xs"
              title="Seshadripuram Institute of Commerce & Management"
            >
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
          </div>
        ) : (
          <div className="rounded-xl border border-stone-200 bg-gradient-to-br from-blue-50/40 via-white to-blue-50/20 p-2.5 text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white p-0.5 shadow-2xs ring-1 ring-stone-200">
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
              <div className="overflow-hidden min-w-0">
                <div className="text-stone-900 font-bold text-[10px] truncate whitespace-nowrap">
                  Jnanam Brahma
                </div>
                <p className="text-[9px] text-stone-500 truncate leading-tight whitespace-nowrap">
                  SICM Academic Portal
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
