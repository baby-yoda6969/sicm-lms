'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Clock,
  MapPin,
  User,
  QrCode,
  CheckCircle2,
  Coffee,
  Calendar,
} from 'lucide-react';
import { safeFetchJson } from '@/lib/apiHelper';
import { getAssetPath } from '@/lib/utils';

const WEEKDAYS = [
  { day: 'MONDAY', label: 'Mon', full: 'Monday' },
  { day: 'TUESDAY', label: 'Tue', full: 'Tuesday' },
  { day: 'WEDNESDAY', label: 'Wed', full: 'Wednesday' },
  { day: 'THURSDAY', label: 'Thu', full: 'Thursday' },
  { day: 'FRIDAY', label: 'Fri', full: 'Friday' },
  { day: 'SATURDAY', label: 'Sat', full: 'Saturday' },
];

const STUDENT_MASTER_SCHEDULE: Record<string, any[]> = {
  MONDAY: [
    {
      id: 'st-mon-1',
      timeSlot: { slotNumber: 1, name: 'Period 1', startTime: '08:30 AM', endTime: '09:30 AM' },
      subject: { code: 'BCA401', name: 'Python Programming', color: '#0D2F6B' },
      teacher: { user: { name: 'Prof. K. R. Sharma' } },
      room: { roomNumber: 'Lab 2' },
      status: 'ACTIVE',
    },
    {
      id: 'st-mon-2',
      timeSlot: { slotNumber: 2, name: 'Period 2', startTime: '09:30 AM', endTime: '10:30 AM' },
      subject: { code: 'BCA402', name: 'Software Engineering', color: '#0284C7' },
      teacher: { user: { name: 'Dr. Suresh Kumar' } },
      room: { roomNumber: 'Room 302' },
      status: 'UPCOMING',
    },
    {
      id: 'st-mon-3',
      timeSlot: { slotNumber: 3, name: 'Period 3', startTime: '10:45 AM', endTime: '11:45 AM' },
      subject: { code: 'BCA404', name: 'Operating Systems & Architecture', color: '#16A34A' },
      teacher: { user: { name: 'Dr. Pratibha Rao' } },
      room: { roomNumber: 'Hall 302' },
      status: 'UPCOMING',
    },
    {
      id: 'st-mon-4',
      timeSlot: { slotNumber: 4, name: 'Period 4', startTime: '11:45 AM', endTime: '12:45 PM' },
      subject: { code: 'BCA403', name: 'Database Management Systems', color: '#8B5CF6' },
      teacher: { user: { name: 'Prof. Ananya Sen' } },
      room: { roomNumber: 'Room 304' },
      status: 'UPCOMING',
    },
    {
      id: 'st-mon-5',
      timeSlot: { slotNumber: 5, name: 'Period 5', startTime: '01:15 PM', endTime: '02:15 PM' },
      subject: { code: 'BCA405', name: 'Computer Networks', color: '#EA580C' },
      teacher: { user: { name: 'Prof. Ramesh Bhat' } },
      room: { roomNumber: 'Room 302' },
      status: 'UPCOMING',
    },
  ],
  TUESDAY: [
    {
      id: 'st-tue-1',
      timeSlot: { slotNumber: 1, name: 'Period 1', startTime: '08:30 AM', endTime: '09:30 AM' },
      subject: { code: 'BCA404', name: 'Operating Systems & Architecture', color: '#16A34A' },
      teacher: { user: { name: 'Dr. Pratibha Rao' } },
      room: { roomNumber: 'Hall 302' },
      status: 'UPCOMING',
    },
    {
      id: 'st-tue-2',
      timeSlot: { slotNumber: 2, name: 'Period 2', startTime: '09:30 AM', endTime: '10:30 AM' },
      subject: { code: 'BCA401', name: 'Python Programming', color: '#0D2F6B' },
      teacher: { user: { name: 'Prof. K. R. Sharma' } },
      room: { roomNumber: 'Lab 2' },
      status: 'UPCOMING',
    },
    {
      id: 'st-tue-3',
      timeSlot: { slotNumber: 3, name: 'Period 3', startTime: '10:45 AM', endTime: '11:45 AM' },
      subject: { code: 'BCA403', name: 'Database Management Systems', color: '#8B5CF6' },
      teacher: { user: { name: 'Prof. Ananya Sen' } },
      room: { roomNumber: 'Room 304' },
      status: 'UPCOMING',
    },
    {
      id: 'st-tue-4',
      timeSlot: { slotNumber: 4, name: 'Period 4', startTime: '11:45 AM', endTime: '12:45 PM' },
      subject: { code: 'BCA402', name: 'Software Engineering', color: '#0284C7' },
      teacher: { user: { name: 'Dr. Suresh Kumar' } },
      room: { roomNumber: 'Room 302' },
      status: 'UPCOMING',
    },
  ],
  WEDNESDAY: [
    {
      id: 'st-wed-1',
      timeSlot: { slotNumber: 1, name: 'Period 1', startTime: '08:30 AM', endTime: '09:30 AM' },
      subject: { code: 'BCA401', name: 'Python Programming', color: '#0D2F6B' },
      teacher: { user: { name: 'Prof. K. R. Sharma' } },
      room: { roomNumber: 'Lab 2' },
      status: 'UPCOMING',
    },
    {
      id: 'st-wed-2',
      timeSlot: { slotNumber: 2, name: 'Period 2', startTime: '09:30 AM', endTime: '10:30 AM' },
      subject: { code: 'BCA405', name: 'Computer Networks', color: '#EA580C' },
      teacher: { user: { name: 'Prof. Ramesh Bhat' } },
      room: { roomNumber: 'Room 302' },
      status: 'UPCOMING',
    },
    {
      id: 'st-wed-3',
      timeSlot: { slotNumber: 3, name: 'Period 3', startTime: '10:45 AM', endTime: '11:45 AM' },
      subject: { code: 'BCA406', name: 'DBMS Laboratory Session', color: '#7C3AED' },
      teacher: { user: { name: 'Prof. Ananya Sen' } },
      room: { roomNumber: 'Lab 3' },
      status: 'UPCOMING',
    },
    {
      id: 'st-wed-4',
      timeSlot: { slotNumber: 4, name: 'Period 4', startTime: '11:45 AM', endTime: '12:45 PM' },
      subject: { code: 'BCA404', name: 'Operating Systems & Architecture', color: '#16A34A' },
      teacher: { user: { name: 'Dr. Pratibha Rao' } },
      room: { roomNumber: 'Hall 302' },
      status: 'UPCOMING',
    },
  ],
  THURSDAY: [
    {
      id: 'st-thu-1',
      timeSlot: { slotNumber: 1, name: 'Period 1', startTime: '08:30 AM', endTime: '09:30 AM' },
      subject: { code: 'BCA401', name: 'Python Programming', color: '#0D2F6B' },
      teacher: { user: { name: 'Dr. Pratibha Rao' } },
      room: { roomNumber: 'Lab 3' },
      status: 'ACTIVE',
    },
    {
      id: 'st-thu-2',
      timeSlot: { slotNumber: 2, name: 'Period 2', startTime: '09:30 AM', endTime: '10:30 AM' },
      subject: { code: 'BCA402', name: 'Database Management Systems', color: '#0284C7' },
      teacher: { user: { name: 'Prof. Suresh Kumar' } },
      room: { roomNumber: 'Room 204' },
      status: 'UPCOMING',
    },
    {
      id: 'st-thu-3',
      timeSlot: { slotNumber: 3, name: 'Period 3', startTime: '10:45 AM', endTime: '11:45 AM' },
      subject: { code: 'BCA403', name: 'Operating Systems', color: '#16A34A' },
      teacher: { user: { name: 'Prof. Narayana S.' } },
      room: { roomNumber: 'Room 204' },
      status: 'UPCOMING',
    },
    {
      id: 'st-thu-4',
      timeSlot: { slotNumber: 4, name: 'Period 4', startTime: '11:45 AM', endTime: '12:45 PM' },
      subject: { code: 'BCA404', name: 'Software Engineering', color: '#8B5CF6' },
      teacher: { user: { name: 'Dr. Rekha M.' } },
      room: { roomNumber: 'Room 204' },
      status: 'UPCOMING',
    },
  ],
  FRIDAY: [
    {
      id: 'st-fri-1',
      timeSlot: { slotNumber: 1, name: 'Period 1', startTime: '08:30 AM', endTime: '09:30 AM' },
      subject: { code: 'BCA403', name: 'Database Management Systems', color: '#8B5CF6' },
      teacher: { user: { name: 'Prof. Ananya Sen' } },
      room: { roomNumber: 'Room 304' },
      status: 'UPCOMING',
    },
    {
      id: 'st-fri-2',
      timeSlot: { slotNumber: 2, name: 'Period 2', startTime: '09:30 AM', endTime: '10:30 AM' },
      subject: { code: 'BCA401', name: 'Python Programming', color: '#0D2F6B' },
      teacher: { user: { name: 'Prof. K. R. Sharma' } },
      room: { roomNumber: 'Lab 2' },
      status: 'UPCOMING',
    },
    {
      id: 'st-fri-3',
      timeSlot: { slotNumber: 3, name: 'Period 3', startTime: '10:45 AM', endTime: '11:45 AM' },
      subject: { code: 'BCA404', name: 'Operating Systems & Architecture', color: '#16A34A' },
      teacher: { user: { name: 'Dr. Pratibha Rao' } },
      room: { roomNumber: 'Hall 302' },
      status: 'UPCOMING',
    },
    {
      id: 'st-fri-4',
      timeSlot: { slotNumber: 4, name: 'Period 4', startTime: '11:45 AM', endTime: '12:45 PM' },
      subject: { code: 'BCA405', name: 'Computer Networks', color: '#EA580C' },
      teacher: { user: { name: 'Prof. Ramesh Bhat' } },
      room: { roomNumber: 'Room 302' },
      status: 'UPCOMING',
    },
  ],
  SATURDAY: [
    {
      id: 'st-sat-1',
      timeSlot: { slotNumber: 1, name: 'Period 1', startTime: '08:30 AM', endTime: '09:30 AM' },
      subject: { code: 'BCA406', name: 'Python & Linux Lab Session', color: '#7C3AED' },
      teacher: { user: { name: 'Dr. Pratibha Rao' } },
      room: { roomNumber: 'Lab 3' },
      status: 'UPCOMING',
    },
    {
      id: 'st-sat-2',
      timeSlot: { slotNumber: 2, name: 'Period 2', startTime: '09:30 AM', endTime: '10:30 AM' },
      subject: { code: 'BCA402', name: 'Software Engineering Seminar', color: '#0284C7' },
      teacher: { user: { name: 'Dr. Suresh Kumar' } },
      room: { roomNumber: 'Seminar Hall' },
      status: 'UPCOMING',
    },
    {
      id: 'st-sat-3',
      timeSlot: { slotNumber: 3, name: 'Period 3', startTime: '10:45 AM', endTime: '11:45 AM' },
      subject: { code: 'BCA401', name: 'Industry Problem Solving Session', color: '#0D2F6B' },
      teacher: { user: { name: 'Prof. K. R. Sharma' } },
      room: { roomNumber: 'Hall 302' },
      status: 'UPCOMING',
    },
  ],
};

function getDayNameFromDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const dayIndex = d.getDay();
  const map = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return map[dayIndex] || 'MONDAY';
}

export default function StudentDailyTimetablePage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [activeDay, setActiveDay] = useState<string>(() => {
    const todayDay = getDayNameFromDate(new Date().toISOString().split('T')[0]);
    return todayDay === 'SUNDAY' ? 'MONDAY' : todayDay;
  });

  const [dailySchedule, setDailySchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync activeDay when date picker changes
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const day = getDayNameFromDate(newDate);
    setActiveDay(day === 'SUNDAY' ? 'MONDAY' : day);
  };

  // Sync date when day tab is clicked
  const handleSelectDayTab = (dayName: string) => {
    setActiveDay(dayName);
    const curr = new Date();
    const dayIndexMap: Record<string, number> = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };
    const targetDayIndex = dayIndexMap[dayName] || 1;
    const currentDayIndex = curr.getDay();
    const diff = (targetDayIndex - currentDayIndex + 7) % 7;
    curr.setDate(curr.getDate() + diff);
    setSelectedDate(curr.toISOString().split('T')[0]);
  };

  // Fetch Daily Schedule
  useEffect(() => {
    const fetchDailyTimetable = async () => {
      try {
        setLoading(true);
        const daySchedule = STUDENT_MASTER_SCHEDULE[activeDay] || STUDENT_MASTER_SCHEDULE.THURSDAY;

        const { ok, data } = await safeFetchJson(
          `/api/timetable?date=${selectedDate}&studentProfileId=${user?.studentProfileId || 's-1'}&sectionId=${user?.sectionId || 'sec-2'}`,
          undefined,
          {
            timetables: daySchedule,
            dayOfWeek: activeDay,
          }
        );

        if (data?.timetables && data.timetables.length > 0) {
          setDailySchedule(data.timetables);
        } else {
          setDailySchedule(daySchedule);
        }
      } catch (e) {
        setDailySchedule(STUDENT_MASTER_SCHEDULE[activeDay] || STUDENT_MASTER_SCHEDULE.THURSDAY);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyTimetable();
  }, [selectedDate, activeDay, user?.studentProfileId, user?.sectionId]);

  const handleSetToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    handleDateChange(todayStr);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <AppShell>
      <div className="space-y-5 max-w-7xl mx-auto py-2">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                Class Lecture Time-Table
              </h1>
              <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase tracking-wider">
                Cohort Schedule
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Cohort: <strong>{user?.sectionName || 'BCA 2nd Year'}</strong> • Seshadripuram Institute of Commerce & Management
            </p>
          </div>

          {/* Quick Date and Today Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSetToday}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                isToday
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              Today
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 shadow-2xs focus:border-blue-500 outline-none font-mono cursor-pointer"
            />
          </div>
        </div>

        {/* 6 Weekday Quick Filter Tabs */}
        <div className="flex rounded-xl bg-white border border-stone-200 p-1.5 shadow-2xs gap-1 overflow-x-auto">
          {WEEKDAYS.map((w) => {
            const isSelected = activeDay === w.day;
            const periodCount = STUDENT_MASTER_SCHEDULE[w.day]?.length || 0;
            return (
              <button
                key={w.day}
                type="button"
                onClick={() => handleSelectDayTab(w.day)}
                className={`flex items-center justify-between gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer min-w-28 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <span>{w.full}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {periodCount} Periods
                </span>
              </button>
            );
          })}
        </div>

        {/* Master Institutional Timetable Document Card */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-xs overflow-hidden">
          {/* Institutional Header Banner */}
          <div className="border-b border-stone-200 bg-gradient-to-r from-stone-50 via-blue-50/40 to-white text-stone-900 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex size-13 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-2xs ring-1 ring-stone-200">
                  <img
                    src={getAssetPath('/logo.png')}
                    alt="SICM Emblem"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('/sicm-lms/')) {
                        target.src = '/sicm-lms/logo.png';
                      }
                    }}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                    Seshadripuram Educational Trust
                  </span>
                  <h2 className="text-base sm:text-lg font-bold tracking-tight text-stone-900">
                    SESHADRIPURAM INSTITUTE OF COMMERCE & MANAGEMENT
                  </h2>
                  <p className="text-xs text-stone-500 font-medium">
                    Department of Computer Applications • Academic Year 2026-2027
                  </p>
                </div>
              </div>

              {/* Scholar Meta Box */}
              <div className="bg-white rounded-xl px-3.5 py-2.5 border border-stone-200 shadow-2xs text-left sm:text-right shrink-0 space-y-0.5">
                <p className="text-xs font-bold text-stone-900">
                  SCHOLAR: {user?.name || 'Aarav Sharma'} ({user?.rollNumber || '22BCA001'})
                </p>
                <p className="text-xs text-blue-700 font-mono font-semibold">
                  {activeDay} • {selectedDate}
                </p>
                <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                  {dailySchedule.length} Scheduled Periods
                </span>
              </div>
            </div>
          </div>

          {/* Generously Spaced Daily Timetable Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-600">
                  <th className="py-3 px-5 text-center w-20 border-r border-stone-200">Period</th>
                  <th className="py-3 px-5 w-44 border-r border-stone-200">Time Interval</th>
                  <th className="py-3 px-5 border-r border-stone-200">Course & Subject</th>
                  <th className="py-3 px-5 w-48 border-r border-stone-200">Faculty In-Charge</th>
                  <th className="py-3 px-5 w-36 border-r border-stone-200">Lecture Hall</th>
                  <th className="py-3 px-5 text-right w-44">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {dailySchedule.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400">
                      <Coffee className="size-8 text-stone-300 mx-auto mb-2" />
                      <p className="font-bold text-stone-700">No Lectures Scheduled for {activeDay}</p>
                      <p className="text-xs text-stone-400 mt-0.5">Self-study & collegiate project preparation on {selectedDate}.</p>
                    </td>
                  </tr>
                ) : (
                  dailySchedule.map((c: any) => {
                    const isLab = c.subject?.name?.toLowerCase().includes('lab');

                    return (
                      <React.Fragment key={c.id}>
                        {/* Period Row */}
                        <tr className="hover:bg-stone-50/70 transition-colors">
                          {/* Period # */}
                          <td className="py-4 px-5 text-center font-bold text-stone-900 border-r border-stone-100 bg-stone-50/30">
                            <span className="inline-flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-900 font-bold text-xs border border-blue-200">
                              {c.timeSlot?.slotNumber || 1}
                            </span>
                          </td>

                          {/* Time Interval */}
                          <td className="py-4 px-5 border-r border-stone-100 font-mono text-stone-800 font-bold">
                            <div className="flex items-center gap-1 text-xs text-stone-900">
                              <Clock className="size-3.5 text-blue-600 shrink-0" />
                              <span>{c.timeSlot?.startTime} – {c.timeSlot?.endTime}</span>
                            </div>
                            <span className="text-[10px] text-stone-400 font-normal mt-0.5 block">60 Mins Duration</span>
                          </td>

                          {/* Course & Subject */}
                          <td className="py-4 px-5 border-r border-stone-100">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                {c.subject?.code}
                              </span>
                              <span className="font-bold text-stone-900">
                                {c.subject?.name}
                              </span>
                              {isLab && (
                                <span className="rounded bg-cyan-50 border border-cyan-200 text-cyan-800 text-[9px] font-bold px-1.5 py-0.2">
                                  LAB PRACTICAL
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Faculty In-Charge */}
                          <td className="py-4 px-5 border-r border-stone-100 font-medium text-stone-700">
                            <div className="flex items-center gap-1.5">
                              <User className="size-3.5 text-stone-400 shrink-0" />
                              <span className="font-bold text-stone-900">{c.teacher?.user?.name || 'Faculty'}</span>
                            </div>
                            <div className="text-[10px] text-stone-400 mt-0.5">Professor In-Charge</div>
                          </td>

                          {/* Venue / Room */}
                          <td className="py-4 px-5 border-r border-stone-100 font-medium text-stone-700">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="size-3.5 text-stone-400 shrink-0" />
                              <span className="font-mono font-bold text-stone-900">{c.room?.roomNumber}</span>
                            </div>
                          </td>

                          {/* Attendance Status */}
                          <td className="py-4 px-5 text-right">
                            {c.status === 'ACTIVE' ? (
                              <Link
                                href="/student/qr-checkin"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all"
                              >
                                <QrCode className="size-3" />
                                <span>Check-in QR</span>
                              </Link>
                            ) : c.status === 'COMPLETED' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                                <CheckCircle2 className="size-3" />
                                Present (Verified)
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-stone-400 bg-stone-100 px-2.5 py-1 rounded-md">
                                Scheduled
                              </span>
                            )}
                          </td>
                        </tr>

                        {/* Tea Break in clean theme after Period 2 */}
                        {c.timeSlot?.slotNumber === 2 && (
                          <tr className="bg-amber-50/50 border-y border-amber-200/80">
                            <td colSpan={6} className="py-2 px-5 text-center">
                              <div className="flex items-center justify-center gap-2 text-amber-900 font-bold text-[11px]">
                                <Coffee className="size-3.5 text-amber-600" />
                                <span>COLLEGIATE TEA & MENTORSHIP RECESS (10:30 – 10:45 AM)</span>
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
        </div>
      </div>
    </AppShell>
  );
}
