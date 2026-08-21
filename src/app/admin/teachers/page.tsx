'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import {
  Building,
  Plus,
  Search,
  Mail,
  User,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';
import { SEED_TEACHERS } from '@/lib/firebase/seed';

export default function AdminTeachersPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState(SEED_TEACHERS);
  const [search, setSearch] = useState('');
  const [addModal, setAddModal] = useState(false);

  const [name, setName] = useState('');
  const [empCode, setEmpCode] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAvailability = (id: string) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isAvailable: !t.isAvailable } : t))
    );
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const newT = {
      id: `t-${Date.now()}`,
      userId: `u-${Date.now()}`,
      name,
      employeeCode: empCode,
      email,
      departmentName: 'Computer Applications',
      designation,
      isAvailable: true,
    };
    setTeachers([newT, ...teachers]);
    setAddModal(false);
    setName('');
    setEmpCode('');
    setEmail('');
  };

  return (
    <AppShell>
      <div className="space-y-5 max-w-5xl mx-auto py-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/80">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Faculty Directory & Availability
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Department of Computer Applications • SICM Faculty Roll
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search faculty..."
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
              <span>Add Faculty</span>
            </button>
          </div>
        </div>

        {/* Teachers Roster */}
        <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
              Teaching Faculty ({filtered.length})
            </h3>
            <span className="text-[11px] text-stone-500 font-medium">Click status pill to toggle availability</span>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/50 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-stone-900 text-xs">{t.name}</p>
                    <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      {t.employeeCode}
                    </span>
                  </div>
                  <p className="text-stone-500 text-[11px]">
                    {t.designation} • {t.departmentName} • <span className="font-mono">{t.email}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleAvailability(t.id)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer self-start sm:self-center ${
                    t.isAvailable !== false
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {t.isAvailable !== false ? '● Available' : '○ On Leave'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add Faculty Modal */}
        {addModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-xl border border-stone-200 p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bold text-stone-900 text-sm">Register Faculty Member</h3>
                <button
                  type="button"
                  onClick={() => setAddModal(false)}
                  className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleAddTeacher} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Faculty Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Raghavendra Rao"
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Employee Code</label>
                    <input
                      type="text"
                      value={empCode}
                      onChange={(e) => setEmpCode(e.target.value)}
                      placeholder="EMP106"
                      className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Designation</label>
                    <select
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600 cursor-pointer"
                    >
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Professor & Head">Professor & Head</option>
                      <option value="Lecturer">Lecturer</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Academic Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="raghavendra.rao@sicm.edu.in"
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                    required
                  />
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
                    Save Faculty
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
