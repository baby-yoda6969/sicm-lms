'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import {
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ChevronRight,
  Search,
} from 'lucide-react';

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        if (user?.studentProfileId) {
          const res = await fetch(`/api/attendance/student?studentProfileId=${user.studentProfileId}`);
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error('Error fetching attendance:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user?.studentProfileId]);

  const overall = data?.overall || {
    percentage: 100,
    totalHeld: 28,
    totalPresent: 28,
    totalAbsent: 0,
    tier: 'SAFE',
  };

  const filteredSubjects = (data?.subjects || []).filter((s: any) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.facultyName && s.facultyName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filter === 'CRITICAL') {
      return matchesSearch && s.percentage < 75;
    }
    return matchesSearch;
  });

  const criticalCount = (data?.subjects || []).filter((s: any) => s.percentage < 75).length;

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto py-2">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Attendance
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {user?.sectionName || 'BCA 2nd Year'} • Academic Year 2026-2027
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 self-start sm:self-center px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-stone-500" />
            <span>Download Statement</span>
          </button>
        </div>

        {/* UX-Optimized Aggregate Summary Banner */}
        <div className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                Overall Attendance
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
                  {overall.percentage}%
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
                  {overall.percentage >= 75 ? '✓ Exam Eligible (≥75%)' : '⚠️ Shortage (<75%)'}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 sm:text-right">
              Attended <strong className="text-stone-900 font-bold">{overall.totalPresent}</strong> of <strong className="text-stone-900 font-bold">{overall.totalHeld}</strong> total classes across {data?.subjects?.length || 8} courses.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 rounded-xl bg-stone-100 p-1 border border-stone-200/80 w-fit">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === 'ALL'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Courses ({data?.subjects?.length || 0})
            </button>
            {criticalCount > 0 && (
              <button
                type="button"
                onClick={() => setFilter('CRITICAL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === 'CRITICAL'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-rose-600 hover:text-rose-800'
                }`}
              >
                Shortage ({criticalCount})
              </button>
            )}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="pointer-events-none absolute inset-y-0 left-0 pl-3 h-4 w-4 my-auto text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search course or faculty..."
              className="w-full rounded-xl border border-stone-200 bg-white pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* UX-Optimized Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubjects.map((s: any) => {
            const margin = s.classesCanAffordToMiss !== undefined ? s.classesCanAffordToMiss : (s.marginBuffer || 0);
            const isSafe = s.percentage >= 75;

            return (
              <div
                key={s.subjectId}
                onClick={() => setSelectedSubject(s)}
                className="group rounded-2xl border border-stone-200/90 bg-white p-5 hover:border-blue-400 hover:shadow-xs transition-all duration-200 flex flex-col justify-between space-y-4 cursor-pointer"
              >
                <div className="space-y-3">
                  {/* Top Row: Course Code, Name, and Big Percentage */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <span className="text-xs font-mono font-bold text-blue-700 uppercase">
                        {s.code}
                      </span>
                      <h3 className="text-base font-bold text-stone-900 group-hover:text-blue-700 transition-colors truncate">
                        {s.name}
                      </h3>
                      <p className="text-xs text-stone-400">
                        {s.facultyName || 'Dr. Pratibha Rao'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-2xl font-extrabold block ${isSafe ? 'text-stone-900' : 'text-rose-600'}`}>
                        {s.percentage}%
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          isSafe ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {isSafe ? 'Safe' : 'Shortage'}
                      </span>
                    </div>
                  </div>

                  {/* Slim Progress Bar with 75% University Marker */}
                  <div className="space-y-1">
                    <div className="relative w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSafe ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, s.percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Prominent High-Contrast Attendance Counter */}
                  <div className="flex items-baseline justify-between text-xs pt-0.5">
                    <div>
                      <span className="text-base font-extrabold text-stone-900 font-mono">
                        {s.present}
                      </span>
                      <span className="text-xs text-stone-500 font-medium"> / {s.held} classes attended</span>
                    </div>
                    <div>
                      {s.absent > 0 ? (
                        <span className="text-xs font-bold text-rose-600 font-mono">{s.absent} missed</span>
                      ) : (
                        <span className="text-xs font-medium text-stone-400">0 missed</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Minimal Footer with Direct Guidance */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  {isSafe ? (
                    <span className="text-xs text-emerald-700 font-medium">
                      ✓ Can miss <strong>{margin} {margin === 1 ? 'class' : 'classes'}</strong> safely
                    </span>
                  ) : (
                    <span className="text-xs text-rose-700 font-bold">
                      ⚠️ Need +{s.classesNeededFor75} classes to reach 75%
                    </span>
                  )}

                  <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-800 flex items-center gap-0.5">
                    <span>Logs</span>
                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sessions Log Modal */}
        {selectedSubject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-xl space-y-4 max-h-[80vh] flex flex-col border border-stone-200">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 shrink-0">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-700">{selectedSubject.code}</span>
                  <h3 className="text-base font-bold text-stone-900">
                    {selectedSubject.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {selectedSubject.facultyName} • <strong>{selectedSubject.percentage}% Attendance</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSubject(null)}
                  className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 divide-y divide-stone-100 text-xs">
                {selectedSubject.history?.length === 0 ? (
                  <p className="p-8 text-center text-stone-400">No session records found for this course.</p>
                ) : (
                  selectedSubject.history?.map((h: any) => (
                    <div key={h.sessionId || Math.random()} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-stone-800">{h.date} • {h.slotName}</p>
                        <p className="text-[11px] text-stone-400">Lecturer: {h.teacherName}</p>
                      </div>

                      <div>
                        {h.status === 'PRESENT' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" /> Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
                            <AlertCircle className="h-3 w-3" /> Absent
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
