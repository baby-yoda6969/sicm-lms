'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  MapPin,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCheck,
  Sun,
  Edit2,
  Filter,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  Award,
} from 'lucide-react';

export default function AdminDailyTimetablePage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dailyData, setDailyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);

  // Active Tab View: 'schedule' | 'faculty' | 'substitutes'
  const [activeTab, setActiveTab] = useState<'schedule' | 'faculty' | 'substitutes'>('schedule');

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('ALL');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('ALL');

  // Admin override state
  const [overrideModalTeacher, setOverrideModalTeacher] = useState<any>(null);
  const [overrideStatus, setOverrideStatus] = useState<string>('ABSENT');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [submittingOverride, setSubmittingOverride] = useState(false);

  // Slot substitute edit state
  const [editingSlot, setEditingSlot] = useState<any>(null);
  const [selectedSubstituteId, setSelectedSubstituteId] = useState<string>('');
  const [savingSlot, setSavingSlot] = useState(false);

  const fetchDailyStatus = async (dateToFetch?: string) => {
    const target = dateToFetch || selectedDate;
    try {
      setLoading(true);
      const res = await fetch(`/api/timetable/daily-generate?date=${target}`);
      const data = await res.json();
      setDailyData(data);
    } catch (e) {
      console.error('Error fetching daily timetable status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyStatus();
  }, [selectedDate]);

  const handleGenerateTodayTimetable = async () => {
    try {
      setGenerating(true);
      setGenerationResult(null);

      const res = await fetch('/api/timetable/daily-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          autoAssignSubstitutes: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGenerationResult(data);
        await fetchDailyStatus();
      } else {
        alert(data.error || 'Failed to generate daily timetable.');
      }
    } catch (err: any) {
      alert(err.message || 'Generation error');
    } finally {
      setGenerating(false);
    }
  };

  const handleOffsetDate = (days: number) => {
    const curr = new Date(selectedDate);
    curr.setDate(curr.getDate() + days);
    setSelectedDate(curr.toISOString().split('T')[0]);
  };

  const handleAdminOverrideCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideModalTeacher) return;

    try {
      setSubmittingOverride(true);
      const res = await fetch('/api/teacher/morning-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: overrideModalTeacher.id,
          date: selectedDate,
          status: overrideStatus,
          reason: overrideReason || `Dean override: ${overrideStatus}`,
        }),
      });

      if (res.ok) {
        setOverrideModalTeacher(null);
        await fetchDailyStatus();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingOverride(false);
    }
  };

  const handleSaveSlotSubstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    try {
      setSavingSlot(true);
      const res = await fetch('/api/timetable', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSlot.id,
          substituteTeacherId: selectedSubstituteId || null,
        }),
      });

      if (res.ok) {
        setEditingSlot(null);
        await fetchDailyStatus();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSlot(false);
    }
  };

  const currentTimetables = dailyData?.currentTimetables || [];

  // Filter matrix by section, program, and search query
  const filteredTimetables = currentTimetables.filter((t: any) => {
    const secName = t.section?.name || '';
    const subName = t.subject?.name || '';
    const teacherName = t.teacher?.user?.name || '';
    const subTeacherName = t.substituteTeacher?.user?.name || '';

    if (selectedSectionFilter !== 'ALL' && t.sectionId !== selectedSectionFilter) return false;
    if (selectedProgramFilter !== 'ALL' && !secName.startsWith(selectedProgramFilter)) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches =
        secName.toLowerCase().includes(q) ||
        subName.toLowerCase().includes(q) ||
        teacherName.toLowerCase().includes(q) ||
        subTeacherName.toLowerCase().includes(q) ||
        t.room?.roomNumber?.toLowerCase().includes(q);
      if (!matches) return false;
    }

    return true;
  });

  const substitutedSlots = currentTimetables.filter((t: any) => !!t.substituteTeacherId);

  return (
    <AppShell>
      <div className="space-y-5 max-w-7xl mx-auto py-2">
        {/* Top Clean Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Daily Timetable Solver
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Automated faculty availability matching & collision-free schedule synthesizer
            </p>
          </div>

          {/* Date Picker Navigation & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center rounded-lg border border-stone-200 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => handleOffsetDate(-1)}
                className="p-1.5 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2 py-1 text-xs font-semibold text-stone-900 bg-transparent outline-none cursor-pointer"
              />
              <button
                type="button"
                onClick={() => handleOffsetDate(1)}
                className="p-1.5 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                title="Next Day"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-2xs transition-colors"
            >
              Today
            </button>

            <button
              type="button"
              onClick={handleGenerateTodayTimetable}
              disabled={generating}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Generating Schedule…' : 'Generate Daily Schedule'}</span>
            </button>
          </div>
        </div>

        {/* 3 Clean Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Total Periods Scheduled
              </span>
              <p className="text-xl font-extrabold text-stone-900">
                {currentTimetables.length} Lectures
              </p>
              <span className="text-[11px] text-stone-500 font-medium">Across all 27 class cohorts</span>
            </div>
            <div className="size-10 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center">
              <Calendar className="size-5" />
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Faculty Morning Presence
              </span>
              <p className="text-xl font-extrabold text-emerald-700">
                {dailyData?.presentTeachersCount || 0} / {(dailyData?.presentTeachersCount || 0) + (dailyData?.absentTeachersCount || 0)} On Campus
              </p>
              <span className="text-[11px] text-emerald-800 font-semibold">
                {dailyData?.absentTeachersCount || 0} Faculty absent / on leave
              </span>
            </div>
            <div className="size-10 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
              <UserCheck className="size-5" />
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Substitute Reassignments
              </span>
              <p className="text-xl font-extrabold text-blue-900">
                {substitutedSlots.length} Active Substitutes
              </p>
              <span className="text-[11px] text-stone-500 font-medium">Auto-matched from same department</span>
            </div>
            <div className="size-10 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center">
              <Users className="size-5" />
            </div>
          </div>
        </div>

        {/* Uncongested Tabbed Workflow Bar */}
        <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            📅 Master Lecture Schedule ({filteredTimetables.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faculty')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'faculty'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            👥 Faculty Morning Declarations ({dailyData?.teacherStatuses?.length || 0})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('substitutes')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'substitutes'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            🔄 Substitutes & Leaves ({substitutedSlots.length})
          </button>
        </div>

        {/* TAB 1: MASTER LECTURE SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative w-full sm:w-60">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search subject, faculty, room..."
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-blue-600 outline-none pr-8"
                  />
                  <Search className="size-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <select
                  value={selectedProgramFilter}
                  onChange={(e) => setSelectedProgramFilter(e.target.value)}
                  className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-800 outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="ALL">All Programs (BCA, B.Com, BBA)</option>
                  <option value="BCA">BCA Department</option>
                  <option value="BCOM">B.Com Department</option>
                  <option value="BBA">BBA Department</option>
                </select>

                <select
                  value={selectedSectionFilter}
                  onChange={(e) => setSelectedSectionFilter(e.target.value)}
                  className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-800 outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="ALL">All Class Cohorts</option>
                  {dailyData?.sections?.map((sec: any) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-xs text-stone-500 font-medium">
                Showing {filteredTimetables.length} slots for {selectedDate}
              </span>
            </div>

            {/* Structured Table */}
            <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                      <th className="p-3.5 pl-5">Period / Time</th>
                      <th className="p-3.5">Cohort</th>
                      <th className="p-3.5">Course Subject</th>
                      <th className="p-3.5">Assigned Faculty</th>
                      <th className="p-3.5">Room</th>
                      <th className="p-3.5 text-right pr-5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredTimetables.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-10 text-center text-stone-400">
                          No timetable entries found for this filter. Click &ldquo;Synthesize Schedule&rdquo; to generate.
                        </td>
                      </tr>
                    ) : (
                      filteredTimetables.map((t: any) => {
                        const isSubstituted = !!t.substituteTeacherId;
                        return (
                          <tr key={t.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="p-3.5 pl-5 font-mono">
                              <p className="font-bold text-stone-900">{t.timeSlot.name.split(' (')[0]}</p>
                              <p className="text-[10px] text-stone-400">
                                {t.timeSlot.startTime} - {t.timeSlot.endTime}
                              </p>
                            </td>

                            <td className="p-3.5 font-semibold text-stone-900">{t.section.name}</td>

                            <td className="p-3.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className="size-2 rounded"
                                  style={{ backgroundColor: t.subject.color || '#0D2F6B' }}
                                />
                                <div>
                                  <p className="font-bold text-stone-900">{t.subject.name}</p>
                                  <span className="font-mono text-[10px] text-stone-400">{t.subject.code}</span>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5">
                                <User className="size-3.5 text-stone-400" />
                                <span className="font-semibold text-stone-900">
                                  {t.substituteTeacher?.user?.name || t.teacher.user.name}
                                </span>
                                {isSubstituted && (
                                  <span className="rounded bg-amber-50 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 border border-amber-200">
                                    Substitute
                                  </span>
                                )}
                              </div>
                              {isSubstituted && (
                                <p className="text-[10px] text-stone-400 mt-0.5">
                                  Regular: {t.teacher.user.name}
                                </p>
                              )}
                            </td>

                            <td className="p-3.5 font-mono font-medium text-stone-700">
                              {t.room.roomNumber}
                            </td>

                            <td className="p-3.5 text-right pr-5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSlot(t);
                                  setSelectedSubstituteId(t.substituteTeacherId || '');
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                              >
                                Reassign
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FACULTY MORNING AVAILABILITY */}
        {activeTab === 'faculty' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-xs">
              <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                    Faculty Morning Attendance Declarations
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Live declarations submitted for {selectedDate} ({dailyData?.dayOfWeek})
                  </p>
                </div>
                <span className="text-xs font-semibold text-stone-500">
                  {dailyData?.teacherStatuses?.length || 0} Faculty Registered
                </span>
              </div>

              <div className="divide-y divide-stone-100 text-xs">
                {dailyData?.teacherStatuses?.map((t: any) => {
                  const isAbsent = t.status === 'ABSENT_TODAY' || t.status === 'ON_LEAVE';
                  const isPartial = t.status === 'PARTIAL';

                  return (
                    <div
                      key={t.id}
                      className="p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/50 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-stone-900 text-xs">{t.name}</p>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded border ${
                              isAbsent
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : isPartial
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {isAbsent ? '● Declared Absent' : isPartial ? '◐ Partial' : '✓ Present on Campus'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500">{t.department}</p>
                        {isAbsent && t.reason && (
                          <p className="text-[10px] text-rose-700 italic">
                            Reason: &ldquo;{t.reason}&rdquo;
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setOverrideModalTeacher(t);
                          setOverrideStatus(isAbsent ? 'PRESENT' : 'ABSENT');
                          setOverrideReason('');
                        }}
                        className="px-3 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-center"
                      >
                        Override Status
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUBSTITUTIONS & LEAVES */}
        {activeTab === 'substitutes' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                  Automated Faculty Substitutions ({substitutedSlots.length})
                </h3>
                <span className="text-[11px] text-stone-500 font-medium">Matching identical subject domains</span>
              </div>

              {substitutedSlots.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400">
                  No substitute assignments required today. All regular faculty are present.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {substitutedSlots.map((slot: any) => (
                    <div
                      key={slot.id}
                      className="p-3.5 rounded-lg border border-blue-100 bg-blue-50/50 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{slot.subject.name}</span>
                        <span className="font-mono text-[10px] text-stone-500">{slot.section.name}</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Regular Faculty: <strong className="text-stone-800">{slot.teacher.user.name}</strong> (Absent)
                      </p>
                      <p className="text-[11px] text-blue-900 font-bold">
                        Substitute: {slot.substituteTeacher?.user?.name || 'Assigned Professor'}
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[10px] text-stone-400">
                        <span>{slot.timeSlot.name}</span>
                        <span>Room {slot.room.roomNumber}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Admin Teacher Override */}
        {overrideModalTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl space-y-4 border border-stone-200">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-bold text-stone-900 text-sm">
                  Override Status for {overrideModalTeacher.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setOverrideModalTeacher(null)}
                  className="p-1 rounded hover:bg-stone-100 text-stone-400"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleAdminOverrideCheckin} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Attendance Status</label>
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                  >
                    <option value="PRESENT">Present on Campus Today</option>
                    <option value="ABSENT">Absent / Cannot Attend Today</option>
                    <option value="PARTIAL">Partial Presence</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Administrative Reason</label>
                  <input
                    type="text"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="e.g. Attending academic conference / Medical leave"
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setOverrideModalTeacher(null)}
                    className="px-3.5 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingOverride}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                  >
                    {submittingOverride ? 'Saving...' : 'Update Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Slot Substitute Reassignment */}
        {editingSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl space-y-4 border border-stone-200">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    Reassign Slot: {editingSlot.subject.name}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-mono">
                    {editingSlot.section.name} • {editingSlot.timeSlot.name} • Room {editingSlot.room.roomNumber}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="p-1 rounded hover:bg-stone-100 text-stone-400"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSlotSubstitute} className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] text-stone-500">Regular Professor:</span>
                  <p className="font-bold text-stone-900">{editingSlot.teacher.user.name}</p>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Assign Substitute Professor</label>
                  <select
                    value={selectedSubstituteId}
                    onChange={(e) => setSelectedSubstituteId(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                  >
                    <option value="">No Substitute (Regular Faculty)</option>
                    {dailyData?.teacherStatuses?.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.department}) - {t.status === 'ABSENT_TODAY' ? '🔴 Absent' : '🟢 Available'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setEditingSlot(null)}
                    className="px-3.5 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingSlot}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                  >
                    {savingSlot ? 'Saving...' : 'Save Reassignment'}
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
