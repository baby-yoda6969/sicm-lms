'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  BookOpen,
  ClipboardCheck,
  Calendar,
  User,
  QrCode,
  Users,
  Building,
} from 'lucide-react';

interface NavTab {
  label: string;
  href: string;
  icon: any;
  isPrimary?: boolean;
}

export default function MobileNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user || pathname === '/login') return null;

  const role = user.role;

  const studentTabs: NavTab[] = [
    { label: 'Home', href: '/student', icon: Home },
    { label: 'Courses', href: '/student/courses', icon: BookOpen },
    { label: 'Check-In', href: '/student/qr-checkin', icon: QrCode, isPrimary: true },
    { label: 'Attendance', href: '/student/attendance', icon: ClipboardCheck },
    { label: 'Schedule', href: '/student/timetable', icon: Calendar },
  ];

  const teacherTabs: NavTab[] = [
    { label: 'Home', href: '/teacher', icon: Home },
    { label: 'Attendance', href: '/teacher/attendance', icon: ClipboardCheck },
    { label: 'Timetable', href: '/teacher/timetable', icon: Calendar },
    { label: 'Materials', href: '/teacher/materials', icon: BookOpen },
    { label: 'Assignments', href: '/teacher/assignments', icon: BookOpen },
  ];

  const adminTabs: NavTab[] = [
    { label: 'Home', href: '/admin', icon: Home },
    { label: 'Timetable', href: '/admin/timetable', icon: Calendar },
    { label: 'Students', href: '/admin/students', icon: Users },
    { label: 'Teachers', href: '/admin/teachers', icon: Building },
    { label: 'Analytics', href: '/admin/analytics', icon: ClipboardCheck },
  ];

  const tabs = role === 'ADMIN' ? adminTabs : role === 'TEACHER' ? teacherTabs : studentTabs;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 lg:hidden px-3 py-1.5 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          if (tab.isPrimary) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center -mt-5 group"
              >
                <div className="size-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition-transform active:scale-95">
                  <Icon className="size-5" />
                </div>
                <span className="text-[10px] font-bold text-blue-700 mt-1">
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
                isActive
                  ? 'text-blue-700 font-bold'
                  : 'text-stone-500 hover:text-stone-900 font-medium'
              }`}
            >
              <Icon className={`size-5 ${isActive ? 'text-blue-600' : 'text-stone-400'}`} />
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
