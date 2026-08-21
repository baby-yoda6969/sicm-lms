'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { SEED_ASSIGNMENTS } from '@/lib/firebase/seed';

export default function TeacherAssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState(SEED_ASSIGNMENTS);
  const [createModal, setCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Operating Systems (BCA404)');
  const [dueDate, setDueDate] = useState('2026-09-05');
  const [maxMarks, setMaxMarks] = useState('20');
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newAsg = {
      id: `asg-${Date.now()}`,
      subjectId: 'sub-bca404',
      subjectName: subject,
      title,
      description,
      dueDate,
      maxMarks: Number(maxMarks),
      sectionName: 'BCA 2nd Year',
      teacherId: user?.teacherProfileId || 't-1',
      createdAt: new Date().toISOString().split('T')[0],
      submissionsCount: 0,
    };
    setAssignments([newAsg, ...assignments]);
    setCreateModal(false);
    setTitle('');
    setDescription('');
  };

  return (
    <AppShell>
      <div className="space-y-5 max-w-5xl mx-auto py-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/80">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Coursework & Assignments Management
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {user?.name || 'Dr. Pratibha Rao'} • Faculty Department of Computer Applications
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreateModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Create Assignment</span>
          </button>
        </div>

        {/* Assignments List */}
        <div className="space-y-3">
          {assignments.map((asg) => (
            <div
              key={asg.id}
              className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {asg.subjectName}
                  </span>
                  <span className="text-[10px] font-semibold text-stone-500 flex items-center gap-1">
                    <Clock className="size-3 text-stone-400" />
                    Due: {asg.dueDate}
                  </span>
                  <span className="text-[10px] font-bold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">
                    Max {asg.maxMarks} Marks
                  </span>
                </div>

                <h3 className="text-sm font-bold text-stone-900 tracking-tight mt-1">
                  {asg.title}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed font-medium">
                  {asg.description}
                </p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                <div className="text-right">
                  <span className="text-base font-extrabold text-blue-900">
                    {asg.submissionsCount || 0}
                  </span>
                  <span className="text-[9px] text-stone-400 block uppercase font-bold">
                    Submissions
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Assignment Modal */}
        {createModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-xl border border-stone-200 p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bold text-stone-900 text-sm">Publish New Assignment</h3>
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Course Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Assignment Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Process Scheduling Simulation"
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Max Marks</label>
                    <input
                      type="number"
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(e.target.value)}
                      className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Instructions & Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed guidelines, submission format..."
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setCreateModal(false)}
                    className="flex-1 py-2 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Publish Assignment
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
