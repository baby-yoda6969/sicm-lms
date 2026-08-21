'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  User,
  Calendar,
  Send,
  Award,
} from 'lucide-react';

export default function TeacherLeavesPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [leaveType, setLeaveType] = useState('CASUAL');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      if (user?.teacherProfileId) {
        const res = await fetch(`/api/teacher/leaves?teacherId=${user.teacherProfileId}`);
        const data = await res.json();
        if (data.leaves) {
          setLeaves(data.leaves);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [user?.teacherProfileId]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please provide a reason for the leave application.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/teacher/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: user?.teacherProfileId,
          leaveType,
          startDate,
          endDate,
          reason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowApplyModal(false);
        setReason('');
        await fetchLeaves();
      } else {
        alert(data.error || 'Failed to submit leave application.');
      }
    } catch (err: any) {
      alert(err.message || 'Submission error');
    } finally {
      setSubmitting(false);
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
                Faculty Sabbatical & Leave Petitions
              </h1>
              <span className="font-cinzel rounded-md bg-gold-100 px-2.5 py-0.5 text-xs font-bold text-gold-950 border border-gold-300">
                Governance
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Submit casual, medical, and academic leave petitions with automated collegiate substitute matching
            </p>
          </div>

          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 hover:to-black text-white font-bold px-4 py-2.5 text-xs uppercase tracking-wider shadow-md shadow-crimson-900/20 transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4 text-gold-400" />
            Submit Leave Petition
          </button>
        </div>

        {/* Leaves Table */}
        <div className="rounded-3xl border border-stone-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
            <h2 className="font-serif font-bold text-sm text-stone-900">My Leave Applications & History</h2>
            <span className="text-xs text-stone-500 font-mono">{leaves.length} applications recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-[10px] font-cinzel font-bold text-stone-500 uppercase tracking-widest">
                  <th className="p-4">Leave Category</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Reason & Justification</th>
                  <th className="p-4 text-center">Impacted Periods</th>
                  <th className="p-4 text-center">Petition Status</th>
                  <th className="p-4">Substitute Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-400">
                      No leave petitions submitted yet.
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-4 font-bold text-stone-900">
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 font-mono text-[11px]">
                          {leave.leaveType}
                        </span>
                      </td>

                      <td className="p-4 text-stone-600">
                        <span className="font-semibold text-stone-900 font-mono text-[11px]">{leave.startDate}</span>
                        {leave.startDate !== leave.endDate && (
                          <span className="text-stone-500 font-normal font-mono text-[11px]"> to {leave.endDate}</span>
                        )}
                      </td>

                      <td className="p-4 text-stone-700 max-w-xs truncate" title={leave.reason}>
                        {leave.reason}
                      </td>

                      <td className="p-4 text-center">
                        <span className="rounded-full bg-stone-100 px-2.5 py-0.5 font-bold text-stone-700">
                          {leave.affectedClassesCount || 0} periods
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                            leave.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : leave.status === 'PENDING'
                              ? 'bg-gold-50 text-gold-900 border-gold-300'
                              : 'bg-crimson-50 text-crimson-800 border-crimson-200'
                          }`}
                        >
                          {leave.status === 'APPROVED' && <CheckCircle2 className="h-3 w-3" />}
                          {leave.status === 'PENDING' && <Clock className="h-3 w-3" />}
                          {leave.status === 'REJECTED' && <XCircle className="h-3 w-3" />}
                          {leave.status}
                        </span>
                      </td>

                      <td className="p-4 text-stone-600 text-[11px]">
                        {leave.substituteNotes ? (
                          <span className="text-emerald-800 font-semibold">{leave.substituteNotes}</span>
                        ) : leave.status === 'APPROVED' ? (
                          <span className="text-stone-400 italic">No substitute required</span>
                        ) : (
                          <span className="text-stone-400 italic">Under Chancellery Review</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Apply For Leave Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-100">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 border border-stone-200">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-crimson-800" />
                  <h3 className="font-serif font-extrabold text-base text-stone-900">
                    Apply for Faculty Leave / Sabbatical
                  </h3>
                </div>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="rounded-xl p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleApply} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1 font-cinzel text-[10px]">
                    Leave Category
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full rounded-2xl border border-stone-200 px-3.5 py-2 text-stone-900 font-semibold focus:border-crimson-700 outline-none"
                  >
                    <option value="CASUAL">Casual Leave (CL)</option>
                    <option value="MEDICAL">Medical Leave (ML)</option>
                    <option value="ACADEMIC">Academic / Duty Leave (OD)</option>
                    <option value="EMERGENCY">Emergency Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1 font-cinzel text-[10px]">
                      From Date
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-2xl border border-stone-200 px-3.5 py-2 text-stone-900 focus:border-crimson-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1 font-cinzel text-[10px]">
                      To Date
                    </label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-2xl border border-stone-200 px-3.5 py-2 text-stone-900 focus:border-crimson-700 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1 font-cinzel text-[10px]">
                    Reason & Academic Justification
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Attending University Board of Studies meeting / Research symposium"
                    className="w-full rounded-2xl border border-stone-200 p-3 text-stone-900 focus:border-crimson-700 outline-none resize-none"
                  />
                </div>

                <div className="rounded-2xl bg-gold-50/80 p-3 border border-gold-300 text-[11px] text-stone-800 leading-relaxed">
                  Upon petition submission, the Academic Chancellery will review the request, identify impacted lecture periods, and allocate departmental substitute professors.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 rounded-2xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-2xl bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 hover:to-black text-white font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5 text-gold-400" />
                    {submitting ? 'Submitting...' : 'Submit Application'}
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
