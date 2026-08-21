'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { safeFetchJson } from '@/lib/apiHelper';
import Link from 'next/link';
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Clock,
  BookOpen,
  ArrowRight,
  TrendingUp,
  MapPin,
  User,
  ShieldAlert,
  CalendarCheck,
  ClipboardCheck,
  Award,
  Sparkles,
  Camera,
} from 'lucide-react';
import { getAttendanceTier, getTierBadgeClasses, getTierBadgeText } from '@/lib/utils';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.studentProfileId) {
          const { ok, data } = await safeFetchJson(
            `/api/attendance/student?studentProfileId=${user.studentProfileId}`,
            undefined,
            {
              stats: {
                totalHeld: 120,
                totalAttended: 104,
                overallPercentage: 86.7,
                consecutiveDays: 14,
              },
              records: [
                {
                  id: 'rec-1',
                  date: new Date().toISOString().split('T')[0],
                  subjectName: 'Python Programming',
                  subjectCode: 'BCA401',
                  timeSlot: '09:00 - 10:00 AM',
                  status: 'PRESENT',
                  method: 'QR_SCAN',
                  roomNumber: 'Lab 3',
                },
                {
                  id: 'rec-2',
                  date: new Date().toISOString().split('T')[0],
                  subjectName: 'Database Management Systems',
                  subjectCode: 'BCA402',
                  timeSlot: '10:00 - 11:00 AM',
                  status: 'PRESENT',
                  method: 'QR_SCAN',
                  roomNumber: 'Room 204',
                },
              ],
            }
          );
          if (data) setAttendanceData(data);
        }

        const { ok: tOk, data: todayData } = await safeFetchJson(
          `/api/timetable?studentProfileId=${user?.studentProfileId}&date=${new Date().toISOString().split('T')[0]}`,
          undefined,
          {
            timetables: [
              {
                id: 'tt-1',
                timeSlot: { name: 'Period 1 (09:00 - 10:00 AM)', startTime: '09:00', endTime: '10:00' },
                subject: { name: 'Python Programming', code: 'BCA401', color: '#0D2F6B' },
                teacher: { user: { name: 'Dr. Pratibha Rao' } },
                room: { roomNumber: 'Lab 3' },
              },
              {
                id: 'tt-2',
                timeSlot: { name: 'Period 2 (10:00 - 11:00 AM)', startTime: '10:00', endTime: '11:00' },
                subject: { name: 'Database Management Systems', code: 'BCA402', color: '#0284C7' },
                teacher: { user: { name: 'Prof. Suresh Kumar' } },
                room: { roomNumber: 'Room 204' },
              },
              {
                id: 'tt-3',
                timeSlot: { name: 'Period 3 (11:15 - 12:15 PM)', startTime: '11:15', endTime: '12:15' },
                subject: { name: 'Operating Systems', code: 'BCA403', color: '#16A34A' },
                teacher: { user: { name: 'Prof. Narayana S.' } },
                room: { roomNumber: 'Room 204' },
              },
            ],
          }
        );
        if (todayData?.timetables) setTodayClasses(todayData.timetables);
      } catch (e) {
        console.warn('Error loading dashboard data', e);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const overallPct = attendanceData?.overall?.percentage ?? 84.5;
  const overallTier = getAttendanceTier(overallPct);

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Top Executive Header Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-stone-950 via-stone-900 to-blue-950 p-6 sm:p-7 text-white shadow-md border border-stone-800">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <Link
                href="/student/profile"
                className="relative flex size-14 shrink-0 items-center justify-center rounded-lg overflow-hidden ring-2 ring-blue-400/30 hover:ring-blue-400 backdrop-blur-md shadow-md bg-stone-800 group cursor-pointer transition-all"
                title="Click to view profile & update photo"
              >
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=95'
                  }
                  alt={user?.name || 'Aarav Sharma'}
                  className="size-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="size-4 text-white" />
                </div>
              </Link>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    Welcome, {user?.name || 'Aarav Sharma'}
                  </h1>
                  <span className="rounded bg-blue-400/20 px-2 py-0.5 text-[10px] font-bold text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                    Collegiate Scholar
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-1">
                  Registration: <span className="font-mono font-semibold text-white">U18CM21S0001</span> • Roll No:{' '}
                  <span className="font-mono font-semibold text-white">{user?.rollNumber || '22BCA001'}</span>
                </p>
                <div className="flex flex-wrap gap-2 mt-2.5 text-xs">
                  <span className="rounded bg-white/10 px-2.5 py-0.5 text-stone-200 border border-white/10 text-[11px]">
                    Cohort: <strong>{user?.sectionName || 'BCA 2nd Year'}</strong>
                  </span>
                  <span className="rounded bg-white/10 px-2.5 py-0.5 text-stone-200 border border-white/10 font-mono text-[11px]">
                    Batch: <strong>2024-2027</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href="/student/qr-checkin"
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-xs transition-all shadow-xs"
              >
                <QrCode className="size-3.5" />
                <span>Scan QR Check-In</span>
              </Link>
              <Link
                href="/student/timetable"
                className="flex items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 text-xs transition-all border border-white/20"
              >
                <CalendarCheck className="size-3.5 text-blue-200" />
                <span>Daily Schedule</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Aggregate Attendance
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-stone-900">{overallPct}%</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${getTierBadgeClasses(overallTier)}`}>
                  {overallTier === 'SAFE' ? 'Safe Standing' : overallTier === 'WARNING' ? 'Warning' : 'Shortage'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1 font-medium">
                {attendanceData?.overall?.totalPresent || 88} of {attendanceData?.overall?.totalHeld || 104} lectures
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-lg bg-stone-50 border border-stone-100">
              <TrendingUp className={`size-5 ${overallPct >= 75 ? 'text-emerald-700' : 'text-rose-700'}`} />
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Today&apos;s Lecture Roster
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-stone-900">{todayClasses.length || 6}</span>
                <span className="text-xs font-semibold text-stone-500">Periods</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1 font-medium">
                Active daily schedule running
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-800 border border-blue-100">
              <CalendarCheck className="size-5" />
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Course Compliance
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-emerald-700">
                  {attendanceData?.overall?.safeSubjectsCount || 4}
                </span>
                <span className="text-xs font-semibold text-stone-500">
                  of {attendanceData?.subjects?.length || 5} Compliant
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1 font-medium">
                All major subjects in standing
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Award className="size-5" />
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left 2 Cols: Subject Attendance Summary */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-blue-600" />
                <h2 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
                  Academic Subject Attendance
                </h2>
              </div>
              <Link
                href="/student/attendance"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                Full Register <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
              <div className="divide-y divide-stone-100">
                {attendanceData?.subjects?.map((s: any) => (
                  <div key={s.subjectId} className="p-4 hover:bg-stone-50/70 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="inline-block size-2 rounded"
                            style={{ backgroundColor: s.color || '#0D2F6B' }}
                          />
                          <span className="font-bold text-xs text-stone-900">{s.name}</span>
                          <span className="text-[10px] text-stone-400 font-mono">({s.code})</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1">
                          Conducted: <strong>{s.held}</strong> • Present:{' '}
                          <strong className="text-emerald-700">{s.present}</strong> • Absent:{' '}
                          <strong className="text-rose-600">{s.absent}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-extrabold text-stone-900">{s.percentage}%</span>
                        <div className="mt-0.5">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold border ${getTierBadgeClasses(
                              s.tier
                            )}`}
                          >
                            {getTierBadgeText(s.tier)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 w-full bg-stone-100 rounded h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded transition-all duration-500 ${
                          s.tier === 'SAFE'
                            ? 'bg-emerald-600'
                            : s.tier === 'WARNING'
                            ? 'bg-amber-500'
                            : 'bg-rose-600'
                        }`}
                        style={{ width: `${Math.min(100, s.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Today's Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-stone-700" />
                <h2 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
                  Today&apos;s Schedule
                </h2>
              </div>
              <Link
                href="/student/timetable"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                Full Day <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs space-y-2.5">
              {todayClasses.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-6">No scheduled classes today.</p>
              ) : (
                todayClasses.map((c, idx) => (
                  <div
                    key={c.id}
                    className={`rounded-lg p-3 border transition-all ${
                      idx === 0
                        ? 'bg-blue-50/60 border-blue-200'
                        : 'bg-stone-50/80 border-stone-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                        {c.timeSlot.startTime} - {c.timeSlot.endTime}
                      </span>
                      {idx === 0 && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded">
                          <span className="size-1.5 rounded-full bg-blue-600 animate-pulse" />
                          Current Period
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-xs text-stone-900">{c.subject.name}</p>
                    <div className="flex items-center justify-between mt-1.5 text-[11px] text-stone-600">
                      <span className="flex items-center gap-1">
                        <User className="size-3 text-stone-400" />
                        {c.substituteTeacher?.user?.name || c.teacher?.user?.name}
                      </span>
                      <span className="flex items-center gap-1 font-medium font-mono text-[10px]">
                        <MapPin className="size-3 text-stone-400" />
                        {c.room.roomNumber}
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
