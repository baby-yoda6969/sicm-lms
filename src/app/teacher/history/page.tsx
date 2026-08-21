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
import { safeFetchJson } from '@/lib/apiHelper';

export default function TeacherAttendanceHistoryPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([
    {
      timetableId: 'sess-1',
      subject: { name: 'Python Programming', code: 'BCA401' },
      section: { name: 'BCA 2nd Year' },
      room: { roomNumber: 'Lab 2' },
      timeSlot: { startTime: '08:30 AM', endTime: '09:30 AM' },
      presentCount: 65,
      totalStudents: 70,
      attendancePercent: 92.8,
      status: 'COMPLETED',
    },
    {
      timetableId: 'sess-2',
      subject: { name: 'Operating Systems', code: 'BCA404' },
      section: { name: 'BCA 2nd Year' },
      room: { roomNumber: 'Hall 302' },
      timeSlot: { startTime: '09:30 AM', endTime: '10:30 AM' },
      presentCount: 63,
      totalStudents: 70,
      attendancePercent: 90.0,
      status: 'COMPLETED',
    },
  ]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const { ok, data } = await safeFetchJson(
          `/api/attendance/teacher?teacherId=${user?.teacherProfileId || 't-1'}`,
          undefined,
          {
            todaySummary: {
              classes: [
                {
                  timetableId: 'sess-1',
                  subject: { name: 'Python Programming', code: 'BCA401' },
                  section: { name: 'BCA 2nd Year' },
                  room: { roomNumber: 'Lab 2' },
                  timeSlot: { startTime: '08:30 AM', endTime: '09:30 AM' },
                  presentCount: 65,
                  totalStudents: 70,
                  attendancePercent: 92.8,
                  status: 'COMPLETED',
                },
                {
                  timetableId: 'sess-2',
                  subject: { name: 'Operating Systems', code: 'BCA404' },
                  section: { name: 'BCA 2nd Year' },
                  room: { roomNumber: 'Hall 302' },
                  timeSlot: { startTime: '09:30 AM', endTime: '10:30 AM' },
                  presentCount: 63,
                  totalStudents: 70,
                  attendancePercent: 90.0,
                  status: 'COMPLETED',
                },
              ],
            },
          }
        );
        if (data?.todaySummary?.classes) {
          setSessions(data.todaySummary.classes);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.teacherProfileId]);

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                Faculty Attendance Registers
              </h1>
              <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase tracking-wider">
                Audit Registers
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Historical register of submitted lecture attendance sheets across your assigned classes
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
            <h2 className="font-bold text-xs uppercase tracking-wider text-stone-900">Recorded Lecture Periods</h2>
            <span className="text-xs text-stone-500 font-mono">{sessions.length} sessions available</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="p-3.5 pl-5">Slot & Course</th>
                  <th className="p-3.5">Cohort & Room</th>
                  <th className="p-3.5 text-center">Present / Total</th>
                  <th className="p-3.5 text-center">Attendance %</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right pr-5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-400">
                      No historical sessions found.
                    </td>
                  </tr>
                ) : (
                  sessions.map((s, idx) => (
                    <tr key={s.timetableId || idx} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-3.5 pl-5">
                        <p className="font-bold text-stone-900">{s.subject?.name || s.subjectName || 'Lecture'}</p>
                        <p className="text-[11px] text-stone-400 font-mono">
                          {s.subject?.code || ''} • {s.timeSlot?.startTime || s.startTime || '08:30 AM'} - {s.timeSlot?.endTime || s.endTime || '09:30 AM'}
                        </p>
                      </td>

                      <td className="p-3.5">
                        <p className="font-semibold text-stone-800">{s.section?.name || s.sectionName || 'BCA 2nd Year'}</p>
                        <p className="text-[10px] text-stone-500 font-mono">Room {s.room?.roomNumber || s.roomNumber || '101'}</p>
                      </td>

                      <td className="p-3.5 text-center font-bold text-stone-700 font-mono">
                        {s.presentCount || 0} / {s.totalStudents || 70}
                      </td>

                      <td className="p-3.5 text-center">
                        <span className="font-bold text-stone-900">{s.attendancePercent || 90}%</span>
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                            s.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-900 border-amber-300'
                          }`}
                        >
                          <CheckCircle2 className="size-3" />
                          {s.status || 'COMPLETED'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right pr-5">
                        <Link
                          href={`/teacher/attendance?timetableId=${s.timetableId || 'sess-1'}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                        >
                          <Eye className="size-3" />
                          View Register
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
