'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  GraduationCap,
  X,
  CheckCircle2,
} from 'lucide-react';
import { SEED_STUDENTS } from '@/lib/firebase/seed';

export default function AdminStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState(SEED_STUDENTS);
  const [search, setSearch] = useState('');
  const [addModal, setAddModal] = useState(false);

  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [email, setEmail] = useState('');

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.registerNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent = {
      id: `s-${Date.now()}`,
      userId: `u-${Date.now()}`,
      name,
      rollNumber,
      registerNumber: regNumber,
      programCode: 'BCA',
      sectionName: 'BCA 2nd Year',
      semesterNumber: 4,
      email,
      contactNumber: '+91 98000 00000',
    };
    setStudents([newStudent, ...students]);
    setAddModal(false);
    setName('');
    setRollNumber('');
    setRegNumber('');
    setEmail('');
  };

  return (
    <AppShell>
      <div className="space-y-5 max-w-5xl mx-auto py-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/80">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Student Directory & Enrollment
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Official Collegiate Registry • Bangalore City University
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
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
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Student Cards Roster */}
        <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
              Enrolled Scholars ({filtered.length})
            </h3>
            <span className="text-xs text-stone-500 font-medium">BCA Department</span>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {filtered.map((st) => (
              <div
                key={st.id}
                className="p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/50 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-stone-900 text-xs">{st.name}</p>
                    <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      {st.rollNumber}
                    </span>
                  </div>
                  <p className="text-stone-500 text-[11px]">
                    Reg No: <strong className="text-stone-800">{st.registerNumber}</strong> • {st.sectionName}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  <span className="text-stone-500 font-mono text-[11px] flex items-center gap-1">
                    <Mail className="size-3 text-stone-400" />
                    {st.email}
                  </span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Student Modal */}
        {addModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-xl border border-stone-200 p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bold text-stone-900 text-sm">Enroll New Student</h3>
                <button
                  type="button"
                  onClick={() => setAddModal(false)}
                  className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Neha Kulkarni"
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Roll Number</label>
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="22BCA004"
                      className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Register Number</label>
                    <input
                      type="text"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="U18CM21S0004"
                      className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Academic Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="neha.kulkarni@sicm.edu.in"
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
                    Enroll Student
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
