'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  BookOpen,
  User,
  Clock,
  Award,
  FileText,
  Download,
  ChevronRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { SEED_SUBJECTS } from '@/lib/firebase/seed';

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<any>(SEED_SUBJECTS[0]);

  return (
    <AppShell>
      <div className="space-y-5 max-w-6xl mx-auto py-2">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/80">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Enrolled Courses & Subjects
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {user?.sectionName || 'BCA 2nd Year'} • Semester 4 • Academic Year 2026-2027
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 self-start sm:self-auto">
            {SEED_SUBJECTS.length} Active Courses
          </span>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Courses List */}
          <div className="lg:col-span-5 space-y-2.5">
            {SEED_SUBJECTS.map((subject) => {
              const isSelected = selectedSubject?.id === subject.id;
              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => setSelectedSubject(subject)}
                  className={`w-full text-left p-4 rounded-lg border transition-all cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-500/30'
                      : 'bg-white border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded">
                          {subject.code}
                        </span>
                        <span className="text-[10px] text-stone-500 font-semibold">
                          {subject.credits} Credits
                        </span>
                      </div>
                      <h3 className="font-bold text-stone-900 text-xs mt-1.5">
                        {subject.name}
                      </h3>
                      <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1.5 font-medium">
                        <User className="size-3 text-stone-400" />
                        {subject.teacherName}
                      </p>
                    </div>
                    <ChevronRight className={`size-4 mt-1 transition-transform ${isSelected ? 'text-blue-600 translate-x-1' : 'text-stone-300'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Course Syllabus & Details */}
          {selectedSubject && (
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {selectedSubject.code}
                    </span>
                    <h2 className="text-lg font-bold text-stone-900 tracking-tight mt-1.5">
                      {selectedSubject.name}
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Faculty Instructor: <strong className="text-stone-800">{selectedSubject.teacherName}</strong> • {selectedSubject.departmentName}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xl font-extrabold text-stone-900">
                      {selectedSubject.credits}
                    </span>
                    <span className="text-[9px] text-stone-400 uppercase tracking-wider block font-bold">
                      Credits
                    </span>
                  </div>
                </div>

                {/* Modules Outline */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="size-3.5 text-blue-600" />
                    <span>Curriculum Syllabus Modules</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-lg bg-stone-50 border border-stone-100 space-y-1">
                      <div className="flex items-center justify-between font-bold text-stone-900">
                        <span>Unit 1: Fundamentals & Core Architecture</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">Completed</span>
                      </div>
                      <p className="text-stone-500 leading-relaxed text-[11px]">
                        Basic concepts, computational models, environment setup, syntax semantics and memory allocation structures.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 space-y-1">
                      <div className="flex items-center justify-between font-bold text-stone-900">
                        <span>Unit 2: Algorithms, State Machines & Protocols</span>
                        <span className="text-[10px] text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded font-semibold border border-blue-200">In Progress</span>
                      </div>
                      <p className="text-stone-500 leading-relaxed text-[11px]">
                        Dynamic algorithmic pipelines, synchronizations, thread lifecycles and standard design abstractions.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-stone-50 border border-stone-100 space-y-1">
                      <div className="flex items-center justify-between font-bold text-stone-900">
                        <span>Unit 3: Distributed Paradigms & Case Analysis</span>
                        <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.2 rounded font-semibold">Upcoming</span>
                      </div>
                      <p className="text-stone-500 leading-relaxed text-[11px]">
                        Advanced system engineering, real-world case studies, benchmark profiling and laboratory experiments.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Action Links */}
                <div className="pt-2 flex flex-wrap gap-2">
                  <Link
                    href="/student/materials"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <Download className="size-3.5" />
                    <span>View Lecture Materials</span>
                  </Link>
                  <Link
                    href="/student/assignments"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors"
                  >
                    <FileText className="size-3.5 text-stone-400" />
                    <span>Course Assignments</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
