'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import {
  QrCode,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import QRCodeGeneratorModal from '@/components/attendance/QRCodeGeneratorModal';
import { SEED_STUDENTS, SEED_SUBJECTS } from '@/lib/firebase/seed';

export default function TeacherAttendancePage() {
  const { user } = useAuth();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState({
    slotId: 'slot-mon-3',
    subjectId: 'sub-bca404',
    subjectName: 'Operating Systems (BCA404)',
    sectionName: 'BCA 2nd Year',
  });

  const [studentStatuses, setStudentStatuses] = useState<{ [id: string]: 'PRESENT' | 'ABSENT' | 'LATE' }>({
    's-1': 'PRESENT',
    's-2': 'PRESENT',
    's-3': 'ABSENT',
  });

  const toggleStatus = (studentId: string) => {
    setStudentStatuses((prev) => {
      const current = prev[studentId] || 'ABSENT';
      const next = current === 'PRESENT' ? 'ABSENT' : current === 'ABSENT' ? 'LATE' : 'PRESENT';
      return { ...prev, [studentId]: next };
    });
  };

  const presentCount = Object.values(studentStatuses).filter((s) => s === 'PRESENT').length;

  return (
    <AppShell>
      <div className="space-y-5 max-w-5xl mx-auto py-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/80">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Class Attendance Register
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {user?.name || 'Dr. Pratibha Rao'} • Faculty Portal • BCA 2nd Year
            </p>
          </div>

          <button
            type="button"
            onClick={() => setQrModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <QrCode className="size-3.5" />
            <span>Generate Attendance QR</span>
          </button>
        </div>

        {/* Active Lecture Banner */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Period 3 • 10:45 – 11:45 AM
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Session
              </span>
            </div>
            <h2 className="text-base font-bold text-stone-900 tracking-tight">
              Operating Systems (BCA404)
            </h2>
            <p className="text-xs text-stone-500">
              Lecture Hall 302 • Class Cohort: BCA 2nd Year (45 Enrolled Students)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xl font-extrabold text-stone-900">
                {presentCount} <span className="text-xs font-normal text-stone-400">/ {SEED_STUDENTS.length}</span>
              </p>
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                Marked Present
              </span>
            </div>
          </div>
        </div>

        {/* Student Roster Table */}
        <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Student Attendance Roster</h3>
            <span className="text-[11px] text-stone-500 font-medium">Click status to toggle manually</span>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {SEED_STUDENTS.map((student) => {
              const status = studentStatuses[student.id] || 'ABSENT';
              return (
                <div
                  key={student.id}
                  className="p-3.5 sm:px-5 flex items-center justify-between gap-4 hover:bg-stone-50/50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-stone-900 text-xs">{student.name}</p>
                      <span className="font-mono text-[10px] text-stone-500">
                        ({student.rollNumber})
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      Reg: {student.registerNumber} • {student.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleStatus(student.id)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer border ${
                      status === 'PRESENT'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : status === 'LATE'
                        ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {status === 'PRESENT' ? '✓ Present' : status === 'LATE' ? '⏳ Late' : '✕ Absent'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* QR Code Generator Modal */}
      <QRCodeGeneratorModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        timetableSlotId={selectedSlot.slotId}
        subjectId={selectedSlot.subjectId}
        subjectName={selectedSlot.subjectName}
        teacherId={user?.teacherProfileId || 't-1'}
        sectionName={selectedSlot.sectionName}
      />
    </AppShell>
  );
}
