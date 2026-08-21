'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import {
  BookOpen,
  Plus,
  Search,
  User,
  Award,
  Layers,
  X,
} from 'lucide-react';
import { SEED_SUBJECTS, SEED_TEACHERS } from '@/lib/firebase/seed';

export default function AdminCoursesPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState(SEED_SUBJECTS);
  const [search, setSearch] = useState('');
  const [addModal, setAddModal] = useState(false);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState('4');
  const [teacherId, setTeacherId] = useState(SEED_TEACHERS[0].id);

  const filtered = subjects.filter(
    (s) =>
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.teacherName && s.teacherName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const tObj = SEED_TEACHERS.find((t) => t.id === teacherId);
    const newSub = {
      id: `sub-${Date.now()}`,
      code,
      name,
      credits: Number(credits),
      semesterNumber: 4,
      departmentName: 'Computer Applications',
      teacherId,
      teacherName: tObj?.name || 'Faculty',
    };
    setSubjects([newSub, ...subjects]);
    setAddModal(false);
    setCode('');
    setName('');
  };

  return (
    <AppShell>
      <div className="space-y-5 max-w-5xl mx-auto py-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/80">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Academic Courses & Curriculum
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Department of Computer Applications • BCA Syllabus Management
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="w-48 sm:w-56 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-blue-600 outline-none pr-7 shadow-2xs"
              />
              <Search className="size-3 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={() => setAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Add Course</span>
            </button>
          </div>
        </div>

        {/* Subjects List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2.5 hover:border-stone-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {s.code}
                </span>
                <span className="text-[10px] font-bold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">
                  {s.credits} Credits • Sem 4
                </span>
              </div>

              <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                {s.name}
              </h3>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span className="flex items-center gap-1 font-medium text-stone-700">
                  <User className="size-3 text-stone-400" />
                  {s.teacherName}
                </span>
                <span className="text-[10px] text-stone-400">{s.departmentName}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Add Course Modal */}
        {addModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-xl border border-stone-200 p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bold text-stone-900 text-sm">Add New Course Subject</h3>
                <button
                  type="button"
                  onClick={() => setAddModal(false)}
                  className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleAddCourse} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Course Code</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="BCA407"
                      className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Credits</label>
                    <input
                      type="number"
                      value={credits}
                      onChange={(e) => setCredits(e.target.value)}
                      className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Subject Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Cloud Computing & Microservices"
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Faculty Instructor</label>
                  <select
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600 cursor-pointer"
                  >
                    {SEED_TEACHERS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.employeeCode})
                      </option>
                    ))}
                  </select>
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
                    className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Save Course
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
