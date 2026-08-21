'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Clock,
  MapPin,
  Users,
  QrCode,
  ClipboardCheck,
  Coffee,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function TeacherDailySchedulePage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dailyClasses, setDailyClasses] = useState<any[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState<string>('THURSDAY');
  const [loading, setLoading] = useState(true);

  // Fetch Daily Schedule
  const fetchDailySchedule = async (dateToFetch?: string) => {
    const target = dateToFetch || selectedDate;
    try {
      setLoading(true);
      if (user?.teacherProfileId) {
        const res = await fetch(`/api/timetable?teacherId=${user.teacherProfileId}&date=${target}`);
        const data = await res.json();
        if (data.timetables) {
          setDailyClasses(data.timetables);
          setDayOfWeek(data.dayOfWeek || 'THURSDAY');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailySchedule();
  }, [user?.teacherProfileId, selectedDate]);

  const handleSetToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setSelectedDate(todayStr);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto py-2">
        {/* Top Control Bar with Simplistic Light Blue Styling */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Academic Lecture Time-Table
            </h1>
            <p className="text-xs text-stone-500 font-medium">
              Faculty Teaching Allotment • Seshadripuram Institute of Commerce & Management
            </p>
          </div>

          {/* Clean Controls (Only Today and Date Input) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Today Button Only */}
            <button
              type="button"
              onClick={handleSetToday}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                isToday
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-sky-50 hover:text-blue-700'
              }`}
            >
              Today
            </button>

            {/* Date Picker */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-bold text-stone-800 shadow-xs focus:border-blue-500 outline-none font-mono cursor-pointer"
            />
          </div>
        </div>

        {/* Master Institutional Timetable Document Card in Light Blue Palette */}
        <div className="rounded-3xl border border-sky-200/80 bg-white shadow-lg overflow-hidden">
          {/* Institutional Header Banner in Simplistic Light Sky Theme */}
          <div className="border-b border-sky-200 bg-gradient-to-r from-sky-50 via-blue-50/60 to-white text-stone-900 p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-sky-200">
                  <img src="/logo.png" alt="SICM Emblem" className="h-full w-full object-contain" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">
                    Seshadripuram Educational Trust
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900">
                    SESHADRIPURAM INSTITUTE OF COMMERCE & MANAGEMENT
                  </h2>
                  <p className="text-xs text-stone-600 font-medium">
                    NAAC Accredited &lsquo;A&rsquo; Grade • Academic Year 2026-2027
                  </p>
                </div>
              </div>

              {/* Faculty Info Meta Box */}
              <div className="bg-white rounded-2xl px-4 py-3 border border-sky-200 shadow-xs text-left sm:text-right shrink-0 space-y-0.5">
                <p className="text-xs sm:text-sm font-bold text-stone-900">
                  FACULTY: {user?.name || 'Dr. Pratibha Rao'}
                </p>
                <p className="text-xs text-sky-800 font-mono font-semibold">
                  {dayOfWeek} • {selectedDate}
                </p>
                <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full border border-sky-200">
                  Verified Schedule
                </span>
              </div>
            </div>
          </div>

          {/* Generously Spaced Daily Timetable Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-sky-50/40 text-xs font-bold uppercase tracking-wider text-sky-900">
                  <th className="py-4 px-6 text-center w-24 border-r border-stone-200">Period</th>
                  <th className="py-4 px-6 w-48 border-r border-stone-200">Time Interval</th>
                  <th className="py-4 px-6 border-r border-stone-200">Course & Subject</th>
                  <th className="py-4 px-6 w-52 border-r border-stone-200">Class Cohort</th>
                  <th className="py-4 px-6 w-48 border-r border-stone-200">Hall / Room</th>
                  <th className="py-4 px-6 text-right w-60">Attendance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs sm:text-sm">
                {dailyClasses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-stone-400">
                      <Coffee className="h-9 w-9 text-stone-300 mx-auto mb-2" />
                      <p className="font-serif font-bold text-stone-700">No Teaching Periods Allocated for {dayOfWeek}</p>
                      <p className="text-xs text-stone-400 mt-1">Dedicated research, scholarship & mentorship time on {selectedDate}.</p>
                    </td>
                  </tr>
                ) : (
                  dailyClasses.map((c: any) => {
                    const isSubstitute = c.substituteTeacherId === user?.teacherProfileId;
                    const isLab = c.subject?.name?.toLowerCase().includes('lab');

                    return (
                      <React.Fragment key={c.id}>
                        {/* Period Row */}
                        <tr className="hover:bg-sky-50/50 transition-colors">
                          {/* Period # */}
                          <td className="py-5 px-6 text-center font-serif font-extrabold text-base text-stone-900 border-r border-stone-100 bg-sky-50/20">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-900 font-serif font-bold text-sm border border-sky-200">
                              {c.timeSlot.slotNumber}
                            </span>
                          </td>

                          {/* Time Interval */}
                          <td className="py-5 px-6 border-r border-stone-100 font-mono text-stone-800 font-bold">
                            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-sky-900">
                              <Clock className="h-4 w-4 text-sky-600 shrink-0" />
                              <span>{c.timeSlot.startTime} – {c.timeSlot.endTime}</span>
                            </div>
                            <span className="text-[11px] text-stone-400 font-normal mt-0.5 block">60 Mins Duration</span>
                          </td>

                          {/* Course & Subject */}
                          <td className="py-5 px-6 border-r border-stone-100">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="font-mono text-xs font-extrabold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                                {c.subject.code}
                              </span>
                              <span className="font-serif font-bold text-sm sm:text-base text-stone-900">
                                {c.subject.name}
                              </span>
                              {isLab && (
                                <span className="rounded-md bg-cyan-50 border border-cyan-200 text-cyan-900 text-[10px] font-bold px-2 py-0.5">
                                  LAB PRACTICAL
                                </span>
                              )}
                              {isSubstitute && (
                                <span className="rounded-md bg-amber-50 border border-amber-300 text-amber-950 text-[10px] font-extrabold px-2 py-0.5">
                                  SUBSTITUTE
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Class Cohort */}
                          <td className="py-5 px-6 border-r border-stone-100 font-medium text-stone-700">
                            <div className="font-bold text-stone-900 text-xs sm:text-sm">{c.section.name}</div>
                            <div className="text-xs text-stone-400 mt-0.5">70 Enrolled Scholars</div>
                          </td>

                          {/* Venue / Room */}
                          <td className="py-5 px-6 border-r border-stone-100 font-medium text-stone-700">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4 text-stone-400 shrink-0" />
                              <span className="font-mono font-bold text-stone-900 text-xs sm:text-sm">{c.room.roomNumber}</span>
                            </div>
                            <div className="text-xs text-stone-400 truncate max-w-40 mt-0.5">{c.room.name}</div>
                          </td>

                          {/* Actions */}
                          <td className="py-5 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/teacher/attendance?timetableId=${c.id}&date=${selectedDate}`}
                                className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-sky-50 hover:border-sky-300 text-stone-800 font-bold text-xs transition-all shadow-2xs"
                              >
                                Register
                              </Link>
                              <Link
                                href={`/teacher/qr-session?timetableId=${c.id}&date=${selectedDate}`}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                              >
                                <QrCode className="h-3.5 w-3.5" />
                                <span>Smart QR</span>
                              </Link>
                            </div>
                          </td>
                        </tr>

                        {/* Tea Break in Light Blue theme after Period 2 */}
                        {c.timeSlot.slotNumber === 2 && (
                          <tr className="bg-sky-50/70 border-y border-sky-200">
                            <td colSpan={6} className="py-2.5 px-6 text-center">
                              <div className="flex items-center justify-center gap-2 text-sky-950 font-cinzel text-xs font-bold uppercase tracking-widest">
                                <Coffee className="h-4 w-4 text-sky-700" />
                                <span>10:30 AM – 10:45 AM • MORNING TEA BREAK & SHORT RECESS (15 MIN)</span>
                              </div>
                            </td>
                          </tr>
                        )}

                        {/* Lunch Break in Light Blue theme after Period 4 */}
                        {c.timeSlot.slotNumber === 4 && (
                          <tr className="bg-sky-50/70 border-y border-sky-200">
                            <td colSpan={6} className="py-2.5 px-6 text-center">
                              <div className="flex items-center justify-center gap-2 text-sky-950 font-cinzel text-xs font-bold uppercase tracking-widest">
                                <span>🍱 12:45 PM – 01:15 PM • MID-DAY LUNCH RECESS & FACULTY DINING (30 MIN)</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Institutional Document Footer */}
          <div className="border-t border-sky-100 bg-sky-50/30 px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-stone-800">SICM Academic Timetable Cell</span>
              <span>• Certified by Principal & Academic Dean</span>
            </div>
            <div className="font-mono text-stone-400 text-xs">
              Document Ref: SICM/TT/2026/FAC-101
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
