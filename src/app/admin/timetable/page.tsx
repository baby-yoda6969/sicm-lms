'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Users,
  Building,
  X,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { SEED_TIMETABLE, SEED_TEACHERS, SEED_SUBJECTS } from '@/lib/firebase/seed';
import { TimetableSlot, detectTimetableConflict } from '@/lib/firebase/firestore';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6];

export default function AdminTimetablePage() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<TimetableSlot[]>(SEED_TIMETABLE);
  const [addModal, setAddModal] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const [formDay, setFormDay] = useState('Tuesday');
  const [formPeriod, setFormPeriod] = useState(1);
  const [formSubjectId, setFormSubjectId] = useState(SEED_SUBJECTS[0].id);
  const [formTeacherId, setFormTeacherId] = useState(SEED_TEACHERS[0].id);
  const [formRoom, setFormRoom] = useState('Room 302');
  const [formSection, setFormSection] = useState('BCA 2nd Year');

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictWarning(null);

    const subjectObj = SEED_SUBJECTS.find((s) => s.id === formSubjectId);
    const teacherObj = SEED_TEACHERS.find((t) => t.id === formTeacherId);

    const newSlot: TimetableSlot = {
      id: `slot-${Date.now()}`,
      dayOfWeek: formDay,
      periodNumber: Number(formPeriod),
      startTime: formPeriod === 1 ? '08:30' : formPeriod === 2 ? '09:30' : formPeriod === 3 ? '10:45' : formPeriod === 4 ? '11:45' : formPeriod === 5 ? '01:15' : '02:15',
      endTime: formPeriod === 1 ? '09:30' : formPeriod === 2 ? '10:30' : formPeriod === 3 ? '11:45' : formPeriod === 4 ? '12:45' : formPeriod === 5 ? '02:15' : '03:15',
      subjectId: formSubjectId,
      subjectCode: subjectObj?.code || 'BCA401',
      subjectName: subjectObj?.name || 'Subject',
      teacherId: formTeacherId,
      teacherName: teacherObj?.name || 'Faculty',
      roomNumber: formRoom,
      sectionName: formSection,
      semesterNumber: 4,
    };

    // Automated Conflict Detection Check
    const conflict = detectTimetableConflict(newSlot, timetable);
    if (conflict.hasConflict) {
      setConflictWarning(conflict.reason || 'Conflict detected in timetable scheduling.');
      return;
    }

    setTimetable([...timetable, newSlot]);
    setAddModal(false);
  };

  const handleDeleteSlot = (id: string) => {
    setTimetable(timetable.filter((s) => s.id !== id));
  };

  return (
    <AppShell>
      <div className="space-y-5 max-w-6xl mx-auto py-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/80">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Institutional Timetable Manager
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Automated Schedule & Conflict Resolution Engine • BCA Department
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setConflictWarning(null);
              setAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Schedule Lecture Slot</span>
          </button>
        </div>

        {/* Timetable Grid Schedule */}
        <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">BCA 2nd Year • Master Weekly Schedule</h3>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ✓ Zero Conflict Validated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                  <th className="p-3 pl-5">Day</th>
                  {PERIODS.map((p) => (
                    <th key={p} className="p-3 text-center">
                      Period {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {DAYS.map((day) => {
                  const daySlots = timetable.filter((s) => s.dayOfWeek === day);
                  return (
                    <tr key={day} className="hover:bg-stone-50/40 transition-colors">
                      <td className="p-3.5 pl-5 font-bold text-stone-900 whitespace-nowrap">
                        {day}
                      </td>
                      {PERIODS.map((p) => {
                        const slot = daySlots.find((s) => s.periodNumber === p);
                        return (
                          <td key={p} className="p-1.5 text-center align-top min-w-[130px]">
                            {slot ? (
                              <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-200/80 text-left space-y-0.5 relative group shadow-2xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                                    {slot.subjectCode}
                                  </span>
                                  <span className="text-[9px] text-stone-400 font-medium">
                                    {slot.roomNumber}
                                  </span>
                                </div>
                                <p className="font-bold text-stone-900 text-[11px] leading-snug line-clamp-1">
                                  {slot.subjectName}
                                </p>
                                <p className="text-[10px] text-stone-500 line-clamp-1">
                                  {slot.teacherName}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="absolute -top-1 -right-1 size-4 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[9px] shadow-xs cursor-pointer"
                                  title="Delete Slot"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <div className="h-12 rounded-lg border border-dashed border-stone-200 flex items-center justify-center text-[10px] text-stone-300">
                                Empty
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule Slot Modal with Live Conflict Detection */}
        {addModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-xl border border-stone-200 p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bold text-stone-900 text-sm">Schedule Timetable Slot</h3>
                <button
                  type="button"
                  onClick={() => setAddModal(false)}
                  className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Conflict Warning Alert */}
              {conflictWarning && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-950 space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700">
                    <ShieldAlert className="size-3.5" />
                    <span>Scheduling Conflict Detected</span>
                  </div>
                  <p className="leading-relaxed text-[11px]">{conflictWarning}</p>
                </div>
              )}

              <form onSubmit={handleAddSlot} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Day of Week</label>
                    <select
                      value={formDay}
                      onChange={(e) => setFormDay(e.target.value)}
                      className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600 cursor-pointer"
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Period Slot</label>
                    <select
                      value={formPeriod}
                      onChange={(e) => setFormPeriod(Number(e.target.value))}
                      className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600 cursor-pointer"
                    >
                      {PERIODS.map((p) => (
                        <option key={p} value={p}>
                          Period {p} ({p === 1 ? '08:30' : p === 2 ? '09:30' : p === 3 ? '10:45' : p === 4 ? '11:45' : p === 5 ? '01:15' : '02:15'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Course Subject</label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600 cursor-pointer"
                  >
                    {SEED_SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Assigned Faculty</label>
                  <select
                    value={formTeacherId}
                    onChange={(e) => setFormTeacherId(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600 cursor-pointer"
                  >
                    {SEED_TEACHERS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Classroom / Lab</label>
                    <input
                      type="text"
                      value={formRoom}
                      onChange={(e) => setFormRoom(e.target.value)}
                      placeholder="e.g. Room 302"
                      className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Class Section</label>
                    <input
                      type="text"
                      value={formSection}
                      onChange={(e) => setFormSection(e.target.value)}
                      className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setAddModal(false)}
                    className="flex-1 py-2 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Validate & Assign
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
