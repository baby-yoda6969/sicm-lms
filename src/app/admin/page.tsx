'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { safeFetchJson } from '@/lib/apiHelper';
import Link from 'next/link';
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Users,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  UserCheck,
  Award,
  Layers,
  CalendarCheck,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminOverview = async () => {
      try {
        setLoading(true);
        // 1. Fetch analytics
        const { ok, data } = await safeFetchJson('/api/analytics', undefined, {
          kpis: {
            totalStudents: 1890,
            totalTeachers: 30,
            avgAttendance: 88.5,
            activeCourses: 9,
            activeCohorts: 27,
            totalClassrooms: 18,
          },
        });
        if (data) setAnalytics(data);

        // 2. Fetch pending leaves
        const { ok: lOk, data: leavesData } = await safeFetchJson('/api/teacher/leaves', undefined, {
          leaves: [
            {
              id: 'l-1',
              teacher: { user: { name: 'Dr. Pratibha Rao' } },
              teacherName: 'Dr. Pratibha Rao',
              department: 'Computer Applications',
              leaveType: 'CASUAL',
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0],
              reason: 'Academic Conference at Bangalore University',
              status: 'PENDING',
              affectedClassesCount: 2,
            },
          ],
        });
        if (leavesData?.leaves) {
          setPendingLeaves(leavesData.leaves.filter((l: any) => l.status === 'PENDING'));
        }
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminOverview();
  }, []);

  const kpis = analytics?.kpis || {
    totalStudents: 1890,
    totalTeachers: 30,
    totalSections: 27,
    totalSubjects: 36,
    todayClassesCount: 162,
    teachersOnLeaveToday: 2,
    institutionAvgAttendance: 89.4,
    lowAttendanceStudentsCount: 8,
  };

  return (
    <AppShell>
      <div className="space-y-5 max-w-7xl mx-auto py-2">
        {/* Executive Header Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-stone-950 via-stone-900 to-blue-950 p-6 sm:p-7 text-white shadow-md border border-stone-800">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="relative flex size-14 shrink-0 items-center justify-center rounded-lg overflow-hidden ring-2 ring-blue-400/30 backdrop-blur-md shadow-md bg-stone-800">
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=95'
                  }
                  alt="Prof. Narayana S."
                  className="size-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    Academic Chancellor & Administrator Control Center
                  </h1>
                  <span className="rounded bg-blue-400/20 px-2 py-0.5 text-[10px] font-bold text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                    Dean Office
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-1">
                  Prof. Narayana S. • Seshadripuram Institute of Commerce & Management
                </p>
                <p className="text-xs text-blue-300 font-medium mt-0.5">
                  Academic Year 2026-2027 • Central Timetable & Attendance Governance
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/daily-timetable"
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-xs transition-all shadow-xs"
              >
                <CalendarCheck className="size-3.5" />
                <span>Generate Daily Schedule</span>
              </Link>
              <Link
                href="/admin/academic"
                className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 text-xs border border-white/20 transition-all"
              >
                <Building className="size-3.5 text-blue-200" />
                <span>Programs & Cohorts</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Sleek, Sharp Timetable Solver Action Card */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-stone-300">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#0D2F6B] text-white shadow-2xs">
              <CalendarCheck className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                  Daily Dynamic Timetable Generation Solver
                </h3>
                <span className="rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 border border-blue-200">
                  Everyday Workflow
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed font-medium">
                Prepare today&apos;s schedule dynamically according to teacher morning availability, approved leaves, and automated substitute matching across all 27 class sections.
              </p>
            </div>
          </div>

          <Link
            href="/admin/daily-timetable"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0D2F6B] hover:bg-[#0A2352] text-white font-semibold px-4 py-2 text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            <span>Open Daily Solver</span>
            <ArrowRight className="size-3.5 text-blue-200" />
          </Link>
        </div>

        {/* 6 Executive KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Total Scholars
            </p>
            <p className="text-xl font-extrabold text-stone-900 mt-1">{kpis.totalStudents}</p>
            <p className="text-[10px] text-stone-500 font-mono">27 Cohorts</p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Faculty Roster
            </p>
            <p className="text-xl font-extrabold text-stone-900 mt-1">{kpis.totalTeachers}</p>
            <p className="text-[10px] text-stone-500">Professors</p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Daily Lectures
            </p>
            <p className="text-xl font-extrabold text-blue-900 mt-1">{kpis.todayClassesCount}</p>
            <p className="text-[10px] text-stone-500">Active Periods</p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Avg Attendance
            </p>
            <p className="text-xl font-extrabold text-emerald-700 mt-1">
              {kpis.institutionAvgAttendance}%
            </p>
            <p className="text-[10px] text-emerald-800 font-semibold">Campus Aggregate</p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Faculty On Leave
            </p>
            <p className="text-xl font-extrabold text-amber-700 mt-1">
              {kpis.teachersOnLeaveToday}
            </p>
            <p className="text-[10px] text-amber-800 font-semibold">Substitutes Active</p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Shortage Alerts
            </p>
            <p className="text-xl font-extrabold text-rose-700 mt-1">
              {kpis.lowAttendanceStudentsCount}
            </p>
            <p className="text-[10px] text-rose-800 font-semibold">&lt;75% Threshold</p>
          </div>
        </div>

        {/* 2-Column Section: Pending Leaves & Shortage Watchlist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Column: Pending Faculty Leave Requests */}
          <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-2xs flex flex-col">
            <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-blue-700" />
                <h2 className="font-bold text-xs uppercase tracking-wider text-stone-900">
                  Pending Faculty Leave Applications
                </h2>
              </div>
              <Link
                href="/admin/leaves-substitutes"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                Manage All <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="p-4 flex-1 divide-y divide-stone-100">
              {pendingLeaves.length === 0 ? (
                <div className="py-6 text-center text-xs text-stone-400">
                  No pending faculty leave applications awaiting review.
                </div>
              ) : (
                pendingLeaves.map((l) => (
                  <div key={l.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-stone-900">
                          {l.teacher?.user?.name || l.teacherName || 'Faculty Member'}
                        </span>
                        <span className="bg-amber-50 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-200">
                          {l.leaveType || l.type || 'CASUAL'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {l.startDate} to {l.endDate} • Reason: &ldquo;{l.reason}&rdquo;
                      </p>
                      <p className="text-[10px] text-rose-700 font-semibold mt-1">
                        Affects {l.affectedClassesCount || 0} scheduled timetable periods
                      </p>
                    </div>

                    <Link
                      href="/admin/leaves-substitutes"
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shrink-0 transition-colors"
                    >
                      Review & Substitute
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Attendance Shortage Watchlist Preview */}
          <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-2xs flex flex-col">
            <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-rose-700" />
                <h2 className="font-bold text-xs uppercase tracking-wider text-stone-900">
                  Attendance Shortage Watchlist (&lt;75%)
                </h2>
              </div>
              <Link
                href="/admin/analytics"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                Full Analytics <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="p-4 flex-1 divide-y divide-stone-100">
              {analytics?.lowAttendanceList?.length === 0 ? (
                <div className="py-6 text-center text-xs text-stone-400">
                  All scholars meet the 75% attendance requirement.
                </div>
              ) : (
                analytics?.lowAttendanceList?.slice(0, 3).map((item: any, idx: number) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-bold text-stone-900 text-xs">{item.name}</p>
                      <p className="text-[11px] text-stone-500">
                        {item.rollNumber} • {item.subjectName}
                      </p>
                      <p className="text-[10px] text-stone-400 font-mono">
                        {item.present}/{item.held} lectures attended
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-sm text-rose-700">{item.percentage}%</span>
                      <span className="block text-[9px] font-bold text-rose-800 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 mt-0.5">
                        Shortage
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
