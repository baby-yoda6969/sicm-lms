'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';
import { SEED_ASSIGNMENTS } from '@/lib/firebase/seed';

export default function StudentAssignmentsPage() {
  const { user } = useAuth();
  const [selectedAsg, setSelectedAsg] = useState<any | null>(null);
  const [submittedMap, setSubmittedMap] = useState<{ [key: string]: boolean }>({
    'asg-1': false,
    'asg-2': true,
    'asg-3': false,
  });
  const [uploadModal, setUploadModal] = useState<any | null>(null);
  const [fileSelected, setFileSelected] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!uploadModal) return;
    setSubmittedMap((prev) => ({ ...prev, [uploadModal.id]: true }));
    setUploadModal(null);
    setFileSelected(null);
  };

  return (
    <AppShell>
      <div className="space-y-5 max-w-5xl mx-auto py-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/80">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Coursework & Assignments
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {user?.sectionName || 'BCA 2nd Year'} • Academic Term 2026-2027
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              1 Submitted
            </span>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
              2 Pending
            </span>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-3">
          {SEED_ASSIGNMENTS.map((asg) => {
            const isSubmitted = submittedMap[asg.id];
            return (
              <div
                key={asg.id}
                className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-stone-300"
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

                <div className="shrink-0 self-start sm:self-center">
                  {isSubmitted ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      <span>Submitted & Verified</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setUploadModal(asg);
                        setFileSelected(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <Upload className="size-3.5" />
                      <span>Submit Solution</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upload Modal */}
        {uploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-xl border border-stone-200 p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Upload Submission</h3>
                  <p className="text-[11px] text-stone-500">{uploadModal.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadModal(null)}
                  className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="border-2 border-dashed border-stone-200 rounded-lg p-5 text-center space-y-2.5 bg-stone-50/50">
                <div className="size-10 rounded-lg bg-white border border-stone-200 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                  <Upload className="size-5" />
                </div>
                {fileSelected ? (
                  <div className="p-2 bg-blue-50 text-blue-800 rounded text-xs font-semibold">
                    ✓ {fileSelected} (Ready for upload)
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-stone-800">
                      Drag & drop assignment PDF or code file
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Max file size 25MB (PDF, DOCX, ZIP, PY, C)
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  id="asg-file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFileSelected(f.name);
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('asg-file')?.click()}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-2xs cursor-pointer"
                >
                  Browse Device Files
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModal(null)}
                  className="flex-1 py-2 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!fileSelected}
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Confirm Submission
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
