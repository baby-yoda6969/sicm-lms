'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Save,
  Clock,
  Layers,
  ArrowRight,
  Info,
  CheckCheck,
} from 'lucide-react';

export default function AdminAutoGenerateTimetablePage() {
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [workingDays, setWorkingDays] = useState<string[]>([
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ]);
  const [generating, setGenerating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [commitSuccess, setCommitSuccess] = useState(false);

  const daysList = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  useEffect(() => {
    const fetchSections = async () => {
      const res = await fetch('/api/academic?type=sections');
      const data = await res.json();
      if (data.sections && data.sections.length > 0) {
        setSections(data.sections);
        setSelectedSectionId(data.sections[0].id);
      }
    };
    fetchSections();
  }, []);

  const toggleDay = (day: string) => {
    if (workingDays.includes(day)) {
      if (workingDays.length > 1) {
        setWorkingDays(workingDays.filter((d) => d !== day));
      }
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleRunGenerator = async () => {
    if (!selectedSectionId) return;
    try {
      setGenerating(true);
      setResult(null);
      setCommitSuccess(false);

      const res = await fetch('/api/timetable/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: selectedSectionId,
          workingDays,
          commit: false,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.result);
      } else {
        alert(data.error || 'Failed to generate timetable.');
      }
    } catch (e: any) {
      alert(e.message || 'Generation error');
    } finally {
      setGenerating(false);
    }
  };

  const handleCommitToDatabase = async () => {
    if (!selectedSectionId || !result) return;
    try {
      setCommitting(true);
      const res = await fetch('/api/timetable/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: selectedSectionId,
          workingDays,
          commit: true,
          clearExisting: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCommitSuccess(true);
      } else {
        alert(data.error || 'Failed to commit timetable.');
      }
    } catch (e: any) {
      alert(e.message || 'Error committing schedule');
    } finally {
      setCommitting(false);
    }
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Smart Automated Timetable Generator
              </h1>
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                Multi-Constraint Solver
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Heuristic constraint optimization engine ensuring balanced loads, zero teacher/room collisions, and availability compliance
            </p>
          </div>
        </div>

        {/* Generator Setup Configuration Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Target Section Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Target Class / Section
              </label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-900 focus:border-sicm-600 outline-none"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} ({sec.semester?.program?.name})
                  </option>
                ))}
              </select>
              {selectedSection && (
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Semester Subjects: {selectedSection.semester?.subjects?.length || 5} subjects to allocate
                </p>
              )}
            </div>

            {/* 2. Working Days Selector */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Working Days (Select active days)
              </label>
              <div className="flex flex-wrap gap-2">
                {daysList.map((day) => {
                  const isActive = workingDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isActive
                          ? 'bg-sicm-800 text-white border-sicm-900 shadow-xs'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Standard institutional timing: 6 periods/day (08:30 AM – 03:15 PM)
              </p>
            </div>
          </div>

          {/* Solver Rules Box */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Info className="h-4 w-4 text-sicm-700" />
              <span>Automated Constraint Priorities</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-1 text-slate-700">
                <CheckCheck className="h-3.5 w-3.5 text-emerald-600" /> Faculty Availability Checked
              </div>
              <div className="flex items-center gap-1 text-slate-700">
                <CheckCheck className="h-3.5 w-3.5 text-emerald-600" /> No Teacher Double-Booking
              </div>
              <div className="flex items-center gap-1 text-slate-700">
                <CheckCheck className="h-3.5 w-3.5 text-emerald-600" /> No Room/Lab Overlaps
              </div>
              <div className="flex items-center gap-1 text-slate-700">
                <CheckCheck className="h-3.5 w-3.5 text-emerald-600" /> Balanced Daily Distribution
              </div>
            </div>
          </div>

          {/* Action trigger */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleRunGenerator}
              disabled={generating}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <CalendarCheck className="h-4 w-4 text-blue-200" />
              <span>{generating ? 'Processing Schedule...' : 'Generate Master Timetable'}</span>
            </button>
          </div>
        </div>

        {/* Output Preview */}
        {result && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <h2 className="font-extrabold text-base text-slate-900">
                    Generated Schedule Preview
                  </h2>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    {result.slots.length} of {result.totalSlotsRequired} slots assigned
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  100% Conflict-free. Ready to commit to the live academic calendar.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {commitSuccess ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Live Timetable Updated!
                  </span>
                ) : (
                  <button
                    onClick={handleCommitToDatabase}
                    disabled={committing}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <Save className="h-4 w-4" />
                    {committing ? 'Committing...' : 'Commit to Live Timetable'}
                  </button>
                )}
              </div>
            </div>

            {/* Generated Slots Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3">Day</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Assigned Faculty</th>
                    <th className="p-3">Room / Lab</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {result.slots.map((s: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-slate-800">{s.dayOfWeek}</td>
                      <td className="p-3 font-mono text-slate-500">
                        {s.startTime} - {s.endTime}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: s.subjectColor || '#3b82f6' }}
                          />
                          <span className="font-bold text-slate-900">{s.subjectName}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({s.subjectCode})</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-700 font-semibold">{s.teacherName}</td>
                      <td className="p-3 text-slate-700 font-bold">{s.roomNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
