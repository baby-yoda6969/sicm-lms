'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  ClipboardCheck,
  QrCode,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  Sun,
  UserCheck,
  UserX,
  XCircle,
  Send,
  Loader2,
  Award,
  ShieldCheck,
  FileSpreadsheet,
  CalendarDays,
  CalendarCheck,
  Radio,
  Layers,
} from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Morning Declaration State
  const [todayDate, setTodayDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [morningStatus, setMorningStatus] = useState<string>('NOT_DECLARED');
  const [morningReason, setMorningReason] = useState<string>('');
  const [declaredAtTime, setDeclaredAtTime] = useState<string | null>(null);
  const [declaring, setDeclaring] = useState(false);
  const [showReasonDialog, setShowReasonDialog] = useState(false);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        if (user?.teacherProfileId) {
          const res = await fetch(`/api/attendance/teacher?teacherId=${user.teacherProfileId}`);
          const json = await res.json();
          setData(json);

          // Fetch Morning Checkin status
          const checkinRes = await fetch(
            `/api/teacher/morning-checkin?date=${todayDate}&teacherId=${user.teacherProfileId}`
          );
          const checkinJson = await checkinRes.json();
          if (checkinJson.checkins && checkinJson.checkins.length > 0) {
            const checkin = checkinJson.checkins[0];
            setMorningStatus(checkin.status);
            setMorningReason(checkin.reason || '');
            setDeclaredAtTime(
              new Date(checkin.declaredAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            );
          }
        }
      } catch (err) {
        console.error('Error fetching teacher dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [user?.teacherProfileId, todayDate]);

  const handleDeclareMorningStatus = async (status: 'PRESENT' | 'ABSENT' | 'PARTIAL', reason?: string) => {
    if (!user?.teacherProfileId) return;

    try {
      setDeclaring(true);
      const res = await fetch('/api/teacher/morning-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: user.teacherProfileId,
          date: todayDate,
          status,
          reason: reason || morningReason,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setMorningStatus(status);
        setShowReasonDialog(false);
        setDeclaredAtTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        alert(json.error || 'Failed to submit declaration');
      }
    } catch (e: any) {
      alert(e.message || 'Error declaring status');
    } finally {
      setDeclaring(false);
    }
  };

  const teacher = data?.teacher || {
    name: 'Dr. Pratibha Rao, Ph.D.',
    employeeCode: 'SICM-FAC-101',
    designation: 'Associate Professor & HOD',
    department: 'Department of Computer Applications',
  };

  const todaySummary = data?.todaySummary || {
    totalClassesToday: 6,
    completedCount: 2,
    pendingCount: 4,
    classes: [],
  };

  const stats = data?.stats || {
    totalSessionsTaught: 36,
    averageAttendancePercentage: 91.2,
  };

  const completedPercentage = Math.round(
    (todaySummary.completedCount / (todaySummary.totalClassesToday || 1)) * 100
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Executive Header Banner with Integrated Presence Command Tray */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-950 via-crimson-950 to-stone-900 text-white shadow-2xl border border-blue-500/20">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 h-40 w-40 rounded-full bg-crimson-700/20 blur-2xl pointer-events-none" />

          {/* Main Hero Section */}
          <div className="p-6 sm:p-8 relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5">
              {/* Professor Portrait Photo Frame */}
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl overflow-hidden ring-4 ring-blue-400/30 backdrop-blur-md shadow-2xl bg-stone-800">
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=95'
                  }
                  alt={teacher.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {teacher.name}
                  </h1>
                  <span className="font-cinzel rounded-full bg-blue-400/20 px-3 py-0.5 text-[10px] font-bold text-blue-200 border border-blue-400/30 uppercase tracking-widest">
                    Faculty Fellowship
                  </span>
                  <span className="font-mono rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                    Active Faculty
                  </span>
                </div>

                <p className="text-xs text-stone-300 mt-1.5 font-medium flex items-center gap-2 flex-wrap">
                  <span>
                    Faculty ID: <strong className="font-mono text-white">{teacher.employeeCode}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Role: <strong className="text-white">{teacher.designation}</strong>
                  </span>
                </p>

                <p className="text-xs text-blue-200 font-serif font-semibold mt-1 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-blue-400" />
                  <span>{teacher.department} • Seshadripuram Institute of Commerce & Management</span>
                </p>
              </div>
            </div>

            {/* High-Impact Primary Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/teacher/qr-session"
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold px-5 py-3 text-xs uppercase tracking-wider shadow-xl shadow-blue-900/30 transition-all hover:scale-105"
              >
                <QrCode className="h-4 w-4" />
                <span>Launch Smart QR</span>
              </Link>
              <Link
                href="/teacher/attendance"
                className="flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 text-xs uppercase tracking-wider border border-white/20 transition-all backdrop-blur-md"
              >
                <ClipboardCheck className="h-4 w-4 text-blue-300" />
                <span>Manual Register</span>
              </Link>
            </div>
          </div>

          {/* Integrated Sleek Presence Protocol Bar inside Hero Card */}
          <div className="bg-black/40 backdrop-blur-md border-t border-white/10 px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2.5 flex-wrap text-xs">
              <span className="text-[11px] uppercase font-bold tracking-wider text-blue-200">
                Morning Presence:
              </span>
              {morningStatus === 'PRESENT' && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Verified On Campus{' '}
                  {declaredAtTime && `(${declaredAtTime} IST)`}
                </span>
              )}
              {morningStatus === 'ABSENT' && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-crimson-300 bg-crimson-500/20 border border-crimson-500/30 px-3 py-1 rounded-full">
                  <span className="h-2 w-2 rounded-full bg-crimson-400" /> Declared Absent (Substitute Requested)
                </span>
              )}
              {morningStatus === 'PARTIAL' && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gold-300 bg-gold-500/20 border border-gold-500/30 px-3 py-1 rounded-full">
                  <span className="h-2 w-2 rounded-full bg-gold-400" /> Partial Day Presence
                </span>
              )}
              {morningStatus === 'NOT_DECLARED' && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full animate-pulse">
                  Pending Morning Declaration (Due by 08:15 AM)
                </span>
              )}
            </div>

            {/* Quick 1-Click Persona Presence Switcher */}
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10 self-start sm:self-center">
              <button
                type="button"
                onClick={() => handleDeclareMorningStatus('PRESENT')}
                disabled={declaring}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  morningStatus === 'PRESENT'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                ✓ Present
              </button>
              <button
                type="button"
                onClick={() => setShowReasonDialog(true)}
                disabled={declaring}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  morningStatus === 'ABSENT'
                    ? 'bg-crimson-700 text-white shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                ✕ Absent
              </button>
              <button
                type="button"
                onClick={() => handleDeclareMorningStatus('PARTIAL')}
                disabled={declaring}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  morningStatus === 'PARTIAL'
                    ? 'bg-gold-500 text-stone-950 shadow-sm font-extrabold'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                ◷ Partial
              </button>
            </div>
          </div>
        </div>

        {/* Modal dialog for Absent reason */}
        {showReasonDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 border border-stone-200">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserX className="h-5 w-5 text-crimson-700" />
                  <h3 className="font-serif font-extrabold text-base text-stone-900">
                    Declare Absence for Today ({todayDate})
                  </h3>
                </div>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed">
                Please state your reason for today&apos;s absence. The Central Timetable Engine will immediately identify your affected classes and assign free departmental professors.
              </p>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 font-cinzel text-[10px]">
                  Absence Justification
                </label>
                <input
                  type="text"
                  value={morningReason}
                  onChange={(e) => setMorningReason(e.target.value)}
                  placeholder="e.g. Health issue / Medical leave, University symposium, Family emergency"
                  className="w-full rounded-2xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 focus:border-crimson-700 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowReasonDialog(false)}
                  className="px-4 py-2 rounded-2xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeclareMorningStatus('ABSENT', morningReason)}
                  disabled={declaring}
                  className="px-5 py-2 rounded-2xl bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 hover:to-black text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                >
                  {declaring ? 'Submitting...' : 'Confirm & Notify Dean'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4 Executive Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-cinzel text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Today&apos;s Lecture Slots
              </p>
              <Calendar className="h-4 w-4 text-crimson-800" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-extrabold text-stone-900">
                {todaySummary.totalClassesToday}
              </span>
              <span className="text-xs text-stone-500 font-medium">Periods</span>
            </div>
            <p className="text-[11px] text-stone-500">100% Conflict-Free Roster</p>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-cinzel text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Attendance Pending
              </p>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-extrabold text-stone-900">
                {todaySummary.pendingCount}
              </span>
              <span className="text-[10px] text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Pending Entry
              </span>
            </div>
            <p className="text-[11px] text-stone-500">Awaiting QR or manual register</p>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Periods Completed
              </p>
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-extrabold text-emerald-700">
                {todaySummary.completedCount}
              </span>
              <span className="text-xs text-stone-500 font-medium">/ {todaySummary.totalClassesToday}</span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${completedPercentage}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Avg Scholar Attendance
              </p>
              <TrendingUp className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-extrabold text-stone-900">
                {stats.averageAttendancePercentage}%
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                High
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              {stats.totalSessionsTaught} total lecture hours recorded
            </p>
          </div>
        </div>

        {/* Today's Classes List */}
        <div className="rounded-3xl border border-sky-200/80 bg-white overflow-hidden shadow-xs">
          <div className="p-5 sm:p-6 border-b border-sky-100 bg-gradient-to-r from-sky-50/60 via-blue-50/20 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-serif font-extrabold text-base text-stone-900">
                    Today&apos;s Teaching Schedule & Lecture Registers
                  </h2>
                  <span className="font-mono text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {todayDate}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Direct access to classroom lecture registers and rolling Smart QR tokens
                </p>
              </div>
            </div>

            <Link
              href="/teacher/timetable"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-sky-50 hover:border-sky-300 text-blue-700 font-bold text-xs shadow-2xs transition-all self-start sm:self-center"
            >
              <span>View Full Schedule</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-stone-100">
            {todaySummary.classes?.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400">
                No classes scheduled for today.
              </div>
            ) : (
              todaySummary.classes?.map((c: any) => (
                <div
                  key={c.timetableId}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-sky-50/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-900 font-serif font-bold text-sm border border-sky-200">
                      P{c.timeSlot.slotNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif font-bold text-sm sm:text-base text-stone-900">{c.subject.name}</span>
                        <span className="text-xs text-blue-800 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {c.subject.code}
                        </span>
                        {c.isSubstitute && (
                          <span className="bg-amber-50 text-amber-950 text-[10px] font-extrabold px-2 py-0.5 rounded border border-amber-300">
                            Substitute Duty
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-1 font-medium">
                        Cohort: <strong>{c.section.name}</strong> • Room: <strong className="font-mono text-stone-800">{c.room.roomNumber}</strong> • Time:{' '}
                        <strong className="font-mono text-stone-800">{c.timeSlot.startTime} - {c.timeSlot.endTime}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status badge */}
                    {c.status === 'COMPLETED' ? (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Marked ({c.presentCount}/{c.totalStudents})
                        </span>
                        <p className="text-[10px] text-stone-400 mt-0.5 font-medium font-mono">{c.attendancePercent}% present</p>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-xl">
                        <Clock className="h-3.5 w-3.5 text-stone-500" />
                        Pending Attendance
                      </span>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/teacher/attendance?timetableId=${c.timetableId}&date=${todayDate}`}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all"
                      >
                        {c.status === 'COMPLETED' ? 'Edit Sheet' : 'Mark Sheet'}
                      </Link>
                      <Link
                        href={`/teacher/qr-session?timetableId=${c.timetableId}&date=${todayDate}`}
                        className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-blue-700 transition-colors border border-sky-200"
                        title="Project Smart QR"
                      >
                        <QrCode className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
