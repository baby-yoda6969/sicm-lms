'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  UserPlus,
  Calendar,
  MapPin,
  Sparkles,
  X,
  Send,
  Users,
  Award,
} from 'lucide-react';

export default function AdminLeavesAndSubstitutesPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Substitute modal state
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [substituteCandidates, setSubstituteCandidates] = useState<any[]>([]);
  const [chosenTeacherId, setChosenTeacherId] = useState<string>('');
  const [substituteNotes, setSubstituteNotes] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teacher/leaves');
      const data = await res.json();
      if (data.leaves) {
        setLeaves(data.leaves);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // 1. Approve / Reject Leave
  const handleReviewLeave = async (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/teacher/leaves', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveId,
          status,
          adminUserId: user?.userId,
        }),
      });

      if (res.ok) {
        await fetchLeaves();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 2. Open Substitute Matcher for an affected slot
  const handleOpenSubstitute = async (slot: any) => {
    setSelectedSlot(slot);
    setChosenTeacherId('');
    setSubstituteNotes('');
    try {
      setLoadingCandidates(true);
      const res = await fetch(
        `/api/teacher/substitute?dayOfWeek=${slot.dayOfWeek}&timeSlotId=${slot.timeSlotId}&departmentId=${slot.subject.departmentId}&excludeTeacherId=${slot.teacherId}`
      );
      const data = await res.json();
      if (data.candidates) {
        setSubstituteCandidates(data.candidates);
        if (data.candidates.length > 0) {
          setChosenTeacherId(data.candidates[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  // 3. Assign Substitute
  const handleAssignSubstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !chosenTeacherId) return;

    try {
      setAssigning(true);
      const res = await fetch('/api/teacher/substitute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timetableId: selectedSlot.id,
          substituteTeacherId: chosenTeacherId,
          notes: substituteNotes,
        }),
      });

      if (res.ok) {
        setSelectedSlot(null);
        await fetchLeaves();
      } else {
        alert('Failed to assign substitute.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-extrabold text-stone-900 tracking-tight">
                Faculty Absence & Substitute Governance
              </h1>
              <span className="font-cinzel rounded-md bg-crimson-100 px-2.5 py-0.5 text-xs font-bold text-crimson-900 border border-crimson-200">
                Live Impact Solver
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Review sabbatical and leave petitions, identify impacted lecture periods, and assign free departmental professors
            </p>
          </div>
        </div>

        {/* Leave Requests & Affected Classes */}
        <div className="space-y-4">
          {leaves.length === 0 ? (
            <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center text-xs text-stone-400">
              No faculty leaves currently in the system.
            </div>
          ) : (
            leaves.map((leave) => (
              <div
                key={leave.id}
                className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4"
              >
                {/* Leave Details Top Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-extrabold text-base text-stone-900">
                        {leave.teacher.user.name}
                      </h3>
                      <span className="rounded-md bg-stone-100 px-2 py-0.5 font-bold text-xs text-stone-700">
                        {leave.leaveType}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          leave.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : leave.status === 'PENDING'
                            ? 'bg-gold-50 text-gold-900 border-gold-300'
                            : 'bg-crimson-50 text-crimson-800 border-crimson-200'
                        }`}
                      >
                        {leave.status === 'APPROVED' && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {leave.status === 'PENDING' && <Clock className="h-3.5 w-3.5" />}
                        {leave.status === 'REJECTED' && <XCircle className="h-3.5 w-3.5" />}
                        {leave.status}
                      </span>
                    </div>

                    <p className="text-xs text-stone-500 mt-1">
                      {leave.teacher.department.name} • Applied on{' '}
                      {new Date(leave.appliedAt).toLocaleDateString()} • Date Range:{' '}
                      <strong>{leave.startDate} to {leave.endDate}</strong>
                    </p>
                    <p className="text-xs text-stone-700 mt-1 italic">&ldquo;{leave.reason}&rdquo;</p>
                  </div>

                  {/* Review Actions */}
                  {leave.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReviewLeave(leave.id, 'APPROVED')}
                        className="px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve Petition
                      </button>
                      <button
                        onClick={() => handleReviewLeave(leave.id, 'REJECTED')}
                        className="px-4 py-2 rounded-2xl bg-crimson-800 hover:bg-crimson-900 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* Affected Timetable Slots List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-cinzel text-[10px] font-bold uppercase tracking-widest text-stone-500">
                      Impacted Timetable Periods ({leave.affectedSlots?.length || 0} periods detected)
                    </span>
                  </div>

                  {leave.affectedSlots?.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">No active timetable periods during this leave interval.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {leave.affectedSlots.map((slot: any) => (
                        <div
                          key={slot.id}
                          className="rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900">{slot.dayOfWeek}</span>
                            <span className="font-mono text-stone-500 text-[11px]">
                              {slot.timeSlot.startTime} - {slot.timeSlot.endTime}
                            </span>
                          </div>

                          <div>
                            <p className="font-serif font-bold text-stone-900">{slot.subject.name}</p>
                            <p className="text-[11px] text-stone-500 font-mono text-[10px]">
                              {slot.section.name} • Room {slot.room.roomNumber}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                            {slot.substituteTeacher ? (
                              <div className="flex items-center gap-1 text-emerald-800 font-bold text-[11px]">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Sub: {slot.substituteTeacher.user.name}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-crimson-800 font-bold text-[11px]">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                <span>Unassigned</span>
                              </div>
                            )}

                            <button
                              onClick={() => handleOpenSubstitute(slot)}
                              className="text-[11px] font-bold text-crimson-800 hover:text-crimson-950 flex items-center gap-1 hover:underline"
                            >
                              <UserPlus className="h-3.5 w-3.5" />
                              {slot.substituteTeacher ? 'Change' : 'Assign Sub'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal for Matching Substitute Candidates */}
        {selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col border border-stone-200">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-serif font-extrabold text-base text-stone-900">
                    Match Substitute Professor
                  </h3>
                  <p className="text-xs text-stone-500">
                    Slot: <strong>{selectedSlot.subject.name}</strong> • {selectedSlot.dayOfWeek} ({selectedSlot.timeSlot.name})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="rounded-xl p-1 text-stone-400 hover:bg-stone-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAssignSubstitute} className="space-y-4 flex-1 overflow-y-auto pr-1">
                <div>
                  <p className="font-cinzel text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                    Available Free Departmental Professors
                  </p>

                  {loadingCandidates ? (
                    <div className="py-6 text-center text-xs text-stone-400">
                      Scanning faculty schedules for conflicts...
                    </div>
                  ) : substituteCandidates.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-crimson-50 border border-crimson-200 text-xs text-crimson-800">
                      No completely free professors found in this department for this slot. All faculty members are teaching classes.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {substituteCandidates.map((c) => (
                        <label
                          key={c.id}
                          className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                            chosenTeacherId === c.id
                              ? 'bg-crimson-50/80 border-crimson-300 ring-2 ring-crimson-600/30'
                              : 'bg-stone-50/60 border-stone-200 hover:bg-stone-100/70'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="substituteTeacher"
                              value={c.id}
                              checked={chosenTeacherId === c.id}
                              onChange={(e) => setChosenTeacherId(e.target.value)}
                              className="text-crimson-800 focus:ring-crimson-700"
                            />
                            <div>
                              <p className="font-serif font-bold text-xs text-stone-900">{c.name}</p>
                              <p className="text-[10px] text-stone-500 font-mono">
                                {c.employeeCode} • {c.department}
                              </p>
                            </div>
                          </div>

                          <span className="rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 border border-emerald-200">
                            Available Slot
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 font-cinzel text-[10px]">
                    Internal Notes / Syllabus Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={substituteNotes}
                    onChange={(e) => setSubstituteNotes(e.target.value)}
                    placeholder="e.g. Please conduct Unit 3 Practical Session in Lab 1"
                    className="w-full rounded-2xl border border-stone-200 p-3 text-xs text-stone-900 outline-none focus:border-crimson-700"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setSelectedSlot(null)}
                    className="px-4 py-2 rounded-2xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assigning || !chosenTeacherId}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 hover:to-black text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
                  >
                    <Send className="h-4 w-4 text-gold-400" />
                    <span>{assigning ? 'Allocating...' : 'Confirm Assignment'}</span>
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
