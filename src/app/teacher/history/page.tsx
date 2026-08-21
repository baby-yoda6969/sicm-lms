'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  Users,
  Search,
  ArrowRight,
  QrCode,
  Eye,
  Award,
} from 'lucide-react';

export default function TeacherAttendanceHistoryPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        if (user?.teacherProfileId) {
          const res = await fetch(`/api/attendance/teacher?teacherId=${user.teacherProfileId}`);
          const data = await res.json();
          if (data.todaySummary?.classes) {
            setSessions(data.todaySummary.classes);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.teacherProfileId]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-extrabold text-stone-900 tracking-tight">
                Faculty Attendance Registers
              </h1>
              <span className="font-cinzel rounded-md bg-crimson-100 px-2.5 py-0.5 text-xs font-bold text-crimson-900 border border-crimson-200">
                Audit Registers
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Historical register of submitted lecture attendance sheets across your assigned classes
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
            <h2 className="font-serif font-bold text-sm text-stone-900">Recorded Lecture Periods</h2>
            <span className="text-xs text-stone-500 font-mono">{sessions.length} sessions available</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-[10px] font-cinzel font-bold text-stone-500 uppercase tracking-widest">
                  <th className="p-4">Slot & Course</th>
                  <th className="p-4">Cohort & Room</th>
                  <th className="p-4 text-center">Present / Total</th>
                  <th className="p-4 text-center">Attendance %</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-400">
                      No historical sessions found.
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s.timetableId} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-4">
                        <p className="font-serif font-bold text-stone-900">{s.subject.name}</p>
                        <p className="text-[11px] text-stone-400 font-mono">
                          {s.subject.code} • {s.timeSlot.startTime} - {s.timeSlot.endTime}
                        </p>
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-stone-800">{s.section.name}</p>
                        <p className="text-[11px] text-stone-500 font-mono text-[10px]">Room {s.room.roomNumber}</p>
                      </td>

                      <td className="p-4 text-center font-bold text-stone-700 font-mono">
                        {s.presentCount} / {s.totalStudents}
                      </td>

                      <td className="p-4 text-center">
                        <span className="font-serif font-extrabold text-stone-900">{s.attendancePercent}%</span>
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                            s.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-gold-50 text-gold-900 border-gold-300'
                          }`}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {s.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <Link
                          href={`/teacher/attendance?timetableId=${s.timetableId}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-crimson-800 hover:text-crimson-950 bg-crimson-50 hover:bg-crimson-100 px-3.5 py-1.5 rounded-xl border border-crimson-200 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View / Edit Sheet
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
