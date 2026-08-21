'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { safeFetchJson } from '@/lib/apiHelper';
import { getAssetPath } from '@/lib/utils';
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
  ChevronRight,
  BookOpen,
  CalendarDays,
} from 'lucide-react';

const WEEKDAYS = [
  { day: 'MONDAY', label: 'Mon', full: 'Monday' },
  { day: 'TUESDAY', label: 'Tue', full: 'Tuesday' },
  { day: 'WEDNESDAY', label: 'Wed', full: 'Wednesday' },
  { day: 'THURSDAY', label: 'Thu', full: 'Thursday' },
  { day: 'FRIDAY', label: 'Fri', full: 'Friday' },
  { day: 'SATURDAY', label: 'Sat', full: 'Saturday' },
];

const TEACHER_MASTER_SCHEDULE: Record<string, any[]> = {
  MONDAY: [
    {
      id: 'tt-mon-1',
      timeSlot: { slotNumber: 1, name: 'Period 1', startTime: '08:30 AM', endTime: '09:30 AM' },
      subject: { code: 'BCA401', name: 'Python Programming', color: '#0D2F6B' },
      section: { name: 'BCA 2nd Year', totalStudents: 70 },
      room: { roomNumber: 'Lab 2', name: 'Computer Applications Lab 2' },
      type: 'PRACTICAL',
    },
    {
      id: 'tt-mon-2',
      timeSlot: { slotNumber: 2, name: 'Period 2', startTime: '09:30 AM', endTime: '10:30 AM' },
      subject: { code: 'BCA404', name: 'Operating Systems & Architecture', color: '#0284C7' },
      section: { name: 'BCA 2nd Year', totalStudents: 70 },
      room: { roomNumber: 'Hall 302', name: 'Main Academic Block' },
      type: 'THEORY',
    },
    {
      id: 'tt-mon-3',
      timeSlot: { slotNumber: 3, name: 'Period 3', startTime: '10:45 AM', endTime: '11:45 AM' },
      subject: { code: 'BCA601', name: 'Cloud Computing & DevOps', color: '#16A34A' },
      section: { name: 'BCA 3rd Year', totalStudents: 68 },
      room: { roomNumber: 'Room 204', name: 'Central Wing' },
      type: 'THEORY',
    },
    {
      id: 'tt-mon-4',
      timeSlot: { slotNumber: 4, name: 'Period 4', startTime: '11:45 AM', endTime: '12:45 PM' },
      subject: { code: 'BCA406', name: 'Linux & Shell Scripting Lab', color: '#7C3AED' },
      section: { name: 'BCA 2nd Year', totalStudents: 70 },
      room: { roomNumber: 'Lab 3', name: 'Advanced Systems Lab' },
      type: 'LAB',
    },
    {
      id: 'tt-mon-5',
      timeSlot: { slotNumber: 5, name: 'Period 5', startTime: '01:15 PM', endTime: '02:15 PM' },
      subject: { code: 'BCA201', name: 'Data Structures & Algorithms', color: '#EA580C' },
      section: { name: 'BCA 1st Year', totalStudents: 72 },
      room: { roomNumber: 'Hall 102', name: 'First Floor' },
      type: 'THEORY',
    },
  ],
  TUESDAY: [
    {
      id: 'tt-tue-1',
      timeSlot: { slotNumber: 1, name: 'Period 1', startTime: '08:30 AM', endTime: '09:30 AM' },
      subject: { code: 'BCA404', name: 'Operating Systems & Architecture', color: '#0284C7' },
      section: { name: 'BCA 2nd Year', totalStudents: 70 },
      room: { roomNumber: 'Hall 302', name: 'Main Academic Block' },
      type: 'THEORY',
    },
    {
      id: 'tt-tue-2',
      timeSlot: { slotNumber: 2, name: 'Period 2', startTime: '09:30 AM', endTime: '10:30 AM' },
      subject: { code: 'BCA401', name: 'Python Programming', color: '#0D2F6B' },
      section: { name: 'BCA 2nd Year', totalStudents: 70 },
      room: { roomNumber: 'Lab 2', name: 'Computer Applications Lab 2' },
      type: 'THEORY',
    },
    {
      id: 'tt-tue-3',
      timeSlot: { slotNumber: 3, name: 'Period 3', startTime: '10:45 AM', endTime: '11:45 AM' },
      subject: { code: 'BCA201', name: 'Data Structures & Algorithms', color: '#EA580C' },
      section: { name: 'BCA 1st Year', totalStudents: 72 },
      room: { roomNumber: 'Hall 102', name: 'First Floor' },
      type: 'THEORY',
    },
    {
      id: 'tt-tue-4',
      timeSlot: { slotNumber: 4, name: 'Period 4', startTime: '11:45 AM', endTime: '12:45 PM' },
      subject: { code: 'BCA601', name: 'Cloud Computing & DevOps', color: '#16A34A' },
      section: { name: 'BCA 3rd Year', totalStudents: 68 },
      room: { roomNumber: 'Room 204', name: 'Central Wing' },
      type: 'THEORY',
    },
  ],
  WEDNESDAY: [
    {
      id: 'tt-wed-1',
      timeSlot: { slotNumber: 1, name: 'Period 1', startTime: '08:30 AM', endTime: '09:30 AM' },
      subject: { code: 'BCA401', name: 'Python Programming', color: '#0D2F6B' },
      section: { name: 'BCA 2nd Year', totalStudents: 70 },
      room: { roomNumber: 'Lab 2', name: 'Computer Applications Lab 2' },
      type: 'THEORY',
    },
    {
      id: 'tt-wed-2',
      timeSlot: { slotNumber: 2, name: 'Period 2', startTime: '09:30 AM', endTime: '10:30 AM' },
      subject: { code: 'BCA601', name: 'Cloud Computing & DevOps', color: '#16A34A' },
      section: { name: 'BCA 3rd Year', totalStudents: 68 },
      room: { roomNumber: 'Room 204', name: 'Central Wing' },
      type: 'THEORY',
    },
    {
      id: 'tt-wed-3',
      timeSlot: { slotNumber: 3, name: 'Period 3', startTime: '10:45 AM', endTime: '11:45 AM' },
      subject: { code: 'BCA406', name: 'Python & Linux Lab', color: '#7C3AED' },
      section: { name: 'BCA 2nd Year', totalStudents: 70 },
      room: { roomNumber: 'Lab 3', name: 'Advanced Systems Lab' },
      type: 'LAB',
    },
    {
      id: 'tt-wed-4',
      timeSlot: { slotNumber: 4, name: 'Period 4', startTime: '11:45 AM', endTime: '12:45 PM' },
      subject: { code: 'BCA201', name: 'Data Structures & Algorithms', color: '#EA580C' },
      section: { name: 'BCA 1st Year', totalStudents: 72 },
      room: { roomNumber: 'Hall 102', name: 'First Floor' },
      type: 'THEORY',
    },
    {
      id: 'tt-wed-5',
      timeSlot: { slotNumber: 5, name: 'Period 5', startTime: '01:15 PM', endTime: '02:15 PM' },
      subject: { code: 'BCA404', name: 'Operating Systems & Architecture', color: '#0284C7' },
      section: { name: 'BCA 2nd Year', totalStudents: 70 },
      room: { roomNumber: 'Hall 302', name: 'Main Academic Block' },
      type: 'THEORY',
    },
  ],
  THURSDAY: [
    {
      id: 'tt-thu-1',
      timeSlot: { slotNumber: 1, name: 'Period 1', startTime: '08:30 AM', endTime: '09:30 AM' },
      subject: { code: 'BCA401', name: 'Python Programming', color: '#0D2F6B' },
      section: { name: 'BCA 2nd Year', totalStudents: 70 },
      room: { roomNumber: 'Lab 3', name: 'Computer Applications Lab 3' },
      type: 'THEORY',
    },
    {
      id: 'tt-thu-2',
      timeSlot: { slotNumber: 2, name: 'Period 2', startTime: '09:30 AM', endTime: '10:30 AM' },
      subject: { code: 'BCA404', name: 'Operating Systems & Architecture', color: '#0284C7' },
      section: { name: 'BCA 2nd Year', totalStudents: 70 },
      room: { roomNumber: 'Hall 302', name: 'Main Academic Block' },
      type: 'THEORY',
    },
    {
      id: 'tt-thu-3',
      timeSlot: { slotNumber: 3, name: 'Period 3', startTime: '10:45 AM', endTime: '11:45 AM' },
      subject: { code: 'BCA601', name: 'Cloud Computing & DevOps', color: '#16A34A' },
      section: { name: 'BCA 3rd Year', totalStudents: 68 },
      room: { roomNumber: 'Room 204', name: 'Central Wing' },
      type: 'THEORY',
    },
    {
      id: 'tt-thu-4',
      timeSlot: { slotNumber: 4, name: 'Period 4', startTime: '11:45 AM', endTime: '12:45 PM' },
      subject: { code: 'BCA406', name: 'Python Advanced Lab Session', color: '#7C3AED' },
      section: { name: 'BCA 2nd Year', totalStudents: 70 },
      room: { roomNumber: 'Lab 2', name: 'Computer Applications Lab 2' },
      type: 'LAB',
    },
    {
      id: 'tt-thu-5',
      timeSlot: { slotNumber: 5, name: 'Period 5', startTime: '01:15 PM', endTime: '02:15 PM' },
      subject: { code: 'BCA201', name: 'Data Structures & Algorithms', color: '#EA580C' },
      section: { name: 'BCA 1st Year', totalStudents: 72 },
      room: { roomNumber: 'Hall 102', name: 'First Floor' },
      type: 'THEORY',
    },
  ],
  FRIDAY: [
    {
      id: 'tt-fri-1',
      timeSlot: { slotNumber: 1, name: 'Period 1', startTime: '08:30 AM', endTime: '09:30 AM' },
      subject: { code: 'BCA201', name: 'Data Structures & Algorithms', color: '#EA580C' },
      section: { name: 'BCA 1st Year', totalStudents: 72 },
      room: { roomNumber: 'Hall 102', name: 'First Floor' },
      type: 'THEORY',
    },
    {
      id: 'tt-fri-2',
      timeSlot: { slotNumber: 2, name: 'Period 2', startTime: '09:30 AM', endTime: '10:30 AM' },
      subject: { code: 'BCA401', name: 'Python Programming', color: '#0D2F6B' },
      section: { name: 'BCA 2nd Year', totalStudents: 70 },
      room: { roomNumber: 'Lab 2', name: 'Computer Applications Lab 2' },
      type: 'THEORY',
    },
    {
      id: 'tt-fri-3',
      timeSlot: { slotNumber: 3, name: 'Period 3', startTime: '10:45 AM', endTime: '11:45 AM' },
      subject: { code: 'BCA404', name: 'Operating Systems & Architecture', color: '#0284C7' },
      section: { name: 'BCA 2nd Year', totalStudents: 70 },
      room: { roomNumber: 'Hall 302', name: 'Main Academic Block' },
      type: 'THEORY',
    },
    {
      id: 'tt-fri-4',
      timeSlot: { slotNumber: 4, name: 'Period 4', startTime: '11:45 AM', endTime: '12:45 PM' },
      subject: { code: 'BCA601', name: 'Cloud Computing & DevOps', color: '#16A34A' },
      section: { name: 'BCA 3rd Year', totalStudents: 68 },
      room: { roomNumber: 'Room 204', name: 'Central Wing' },
      type: 'THEORY',
    },
  ],
  SATURDAY: [
    {
      id: 'tt-sat-1',
      timeSlot: { slotNumber: 1, name: 'Period 1', startTime: '08:30 AM', endTime: '09:30 AM' },
      subject: { code: 'BCA406', name: 'Special Mentorship & Project Review', color: '#7C3AED' },
      section: { name: 'BCA 2nd Year', totalStudents: 70 },
      room: { roomNumber: 'Seminar Hall', name: 'Central Auditorium Wing' },
      type: 'SEMINAR',
    },
    {
      id: 'tt-sat-2',
      timeSlot: { slotNumber: 2, name: 'Period 2', startTime: '09:30 AM', endTime: '10:30 AM' },
      subject: { code: 'BCA601', name: 'Cloud DevOps Capstone Guidance', color: '#16A34A' },
      section: { name: 'BCA 3rd Year', totalStudents: 68 },
      room: { roomNumber: 'Lab 3', name: 'Advanced Systems Lab' },
      type: 'LAB',
    },
    {
      id: 'tt-sat-3',
      timeSlot: { slotNumber: 3, name: 'Period 3', startTime: '10:45 AM', endTime: '11:45 AM' },
      subject: { code: 'BCA401', name: 'Industry Problem Solving Session', color: '#0D2F6B' },
      section: { name: 'BCA 2nd Year', totalStudents: 70 },
      room: { roomNumber: 'Hall 302', name: 'Main Academic Block' },
      type: 'THEORY',
    },
  ],
};

function getDayNameFromDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const dayIndex = d.getDay();
  const map = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return map[dayIndex] || 'MONDAY';
}

export default function TeacherDailySchedulePage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [activeDay, setActiveDay] = useState<string>(() => {
    const todayDay = getDayNameFromDate(new Date().toISOString().split('T')[0]);
    return todayDay === 'SUNDAY' ? 'MONDAY' : todayDay;
  });

  const [dailyClasses, setDailyClasses] = useState<any[]>([]);
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
    // Find next matching day date
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
    const fetchDailySchedule = async () => {
      try {
        setLoading(true);
        const daySchedule = TEACHER_MASTER_SCHEDULE[activeDay] || TEACHER_MASTER_SCHEDULE.THURSDAY;

        const { ok, data } = await safeFetchJson(
          `/api/timetable?teacherId=${user?.teacherProfileId || 't-1'}&date=${selectedDate}`,
          undefined,
          {
            timetables: daySchedule,
            dayOfWeek: activeDay,
          }
        );

        if (data?.timetables && data.timetables.length > 0) {
          setDailyClasses(data.timetables);
        } else {
          setDailyClasses(daySchedule);
        }
      } catch (e) {
        setDailyClasses(TEACHER_MASTER_SCHEDULE[activeDay] || TEACHER_MASTER_SCHEDULE.THURSDAY);
      } finally {
        setLoading(false);
      }
    };

    fetchDailySchedule();
  }, [user?.teacherProfileId, selectedDate, activeDay]);

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
                Academic Lecture Time-Table
              </h1>
              <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase tracking-wider">
                Assigned Allocation
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Faculty Teaching Allotment • Seshadripuram Institute of Commerce & Management
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
            const periodCount = TEACHER_MASTER_SCHEDULE[w.day]?.length || 0;
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
                    NAAC Accredited &lsquo;A&rsquo; Grade • Academic Year 2026-2027
                  </p>
                </div>
              </div>

              {/* Faculty Info Meta Box */}
              <div className="bg-white rounded-xl px-3.5 py-2.5 border border-stone-200 shadow-2xs text-left sm:text-right shrink-0 space-y-0.5">
                <p className="text-xs font-bold text-stone-900">
                  FACULTY: {user?.name || 'Dr. Pratibha Rao'}
                </p>
                <p className="text-xs text-blue-700 font-mono font-semibold">
                  {activeDay} • {selectedDate}
                </p>
                <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                  {dailyClasses.length} Scheduled Periods
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
                  <th className="py-3 px-5 w-44 border-r border-stone-200">Time Slot</th>
                  <th className="py-3 px-5 border-r border-stone-200">Course & Subject</th>
                  <th className="py-3 px-5 w-44 border-r border-stone-200">Class Cohort</th>
                  <th className="py-3 px-5 w-40 border-r border-stone-200">Hall / Lab</th>
                  <th className="py-3 px-5 text-right w-56">Attendance Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {dailyClasses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400">
                      <Coffee className="size-8 text-stone-300 mx-auto mb-2" />
                      <p className="font-bold text-stone-700">No Teaching Periods Allocated for {activeDay}</p>
                      <p className="text-xs text-stone-400 mt-0.5">Dedicated research, scholarship & mentorship time on {selectedDate}.</p>
                    </td>
                  </tr>
                ) : (
                  dailyClasses.map((c: any) => {
                    const isSubstitute = c.substituteTeacherId === (user?.teacherProfileId || 't-1');
                    const isLab = c.type === 'LAB' || c.subject?.name?.toLowerCase().includes('lab');

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
                            <span className="text-[10px] text-stone-400 font-normal mt-0.5 block">60 Mins Session</span>
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
                              {isSubstitute && (
                                <span className="rounded bg-amber-50 border border-amber-300 text-amber-950 text-[9px] font-bold px-1.5 py-0.2">
                                  SUBSTITUTE
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Class Cohort */}
                          <td className="py-4 px-5 border-r border-stone-100 font-medium text-stone-700">
                            <div className="font-bold text-stone-900">{c.section?.name}</div>
                            <div className="text-[11px] text-stone-400">{c.section?.totalStudents || 70} Scholars Enrolled</div>
                          </td>

                          {/* Venue / Room */}
                          <td className="py-4 px-5 border-r border-stone-100 font-medium text-stone-700">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="size-3.5 text-stone-400 shrink-0" />
                              <span className="font-mono font-bold text-stone-900">{c.room?.roomNumber}</span>
                            </div>
                            <div className="text-[10px] text-stone-400 truncate max-w-36 mt-0.5">{c.room?.name}</div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/teacher/attendance?timetableId=${c.id}&date=${selectedDate}`}
                                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs transition-all shadow-2xs"
                              >
                                Register
                              </Link>
                              <Link
                                href={`/teacher/qr-session?timetableId=${c.id}&date=${selectedDate}`}
                                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1"
                              >
                                <QrCode className="size-3" />
                                <span>Smart QR</span>
                              </Link>
                            </div>
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
