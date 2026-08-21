'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { safeFetchJson } from '@/lib/apiHelper';
import {
  Building,
  BookOpen,
  Users,
  MapPin,
  GraduationCap,
  Layers,
  Award,
} from 'lucide-react';

export default function AdminAcademicRecordsPage() {
  const [activeTab, setActiveTab] = useState<'DEPARTMENTS' | 'SUBJECTS' | 'ROOMS' | 'FACULTY' | 'SECTIONS'>('DEPARTMENTS');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAcademic = async () => {
      try {
        setLoading(true);
        const { ok, data: json } = await safeFetchJson('/api/academic', undefined, {
          departments: [
            { id: 'd-1', code: 'BCA', name: 'Department of Computer Applications', description: 'Undergraduate computing, data science, software engineering & AI curricula.', programs: [{ name: 'BCA (Regular)' }, { name: 'BCA (AIML)' }] },
            { id: 'd-2', code: 'BCOM', name: 'Department of Commerce', description: 'Accounting, finance, business taxation, and banking management studies.', programs: [{ name: 'B.Com General' }, { name: 'B.Com (A&F)' }, { name: 'B.Com (BDA)' }] },
            { id: 'd-3', code: 'BBA', name: 'Department of Business Administration', description: 'Corporate management, leadership, marketing, and human resources.', programs: [{ name: 'BBA' }] },
          ],
          subjects: [
            { id: 's-1', code: 'BCA401', name: 'Python Programming', color: '#0D2F6B', department: { name: 'Computer Applications' }, type: 'THEORY_LAB', credits: 4, hoursPerWeek: 5 },
            { id: 's-2', code: 'BCA402', name: 'Database Management Systems', color: '#0284C7', department: { name: 'Computer Applications' }, type: 'THEORY', credits: 4, hoursPerWeek: 4 },
            { id: 's-3', code: 'BCA403', name: 'Operating Systems', color: '#16A34A', department: { name: 'Computer Applications' }, type: 'THEORY', credits: 4, hoursPerWeek: 4 },
            { id: 's-4', code: 'BCOM201', name: 'Corporate Accounting', color: '#B45309', department: { name: 'Commerce' }, type: 'THEORY', credits: 4, hoursPerWeek: 5 },
          ],
          rooms: [
            { id: 'r-1', roomNumber: '101', name: 'Lecture Hall 101', building: 'Main Academic Block', floor: 1, capacity: 70, type: 'CLASSROOM' },
            { id: 'r-2', roomNumber: '102', name: 'Lecture Hall 102', building: 'Main Academic Block', floor: 1, capacity: 70, type: 'CLASSROOM' },
            { id: 'r-3', roomNumber: 'Lab 3', name: 'Computer Lab 3', building: 'Science Block', floor: 2, capacity: 45, type: 'LAB' },
            { id: 'r-4', roomNumber: 'Auditorium', name: 'Dr. Seshadri Memorial Hall', building: 'Central Block', floor: 1, capacity: 350, type: 'AUDITORIUM' },
          ],
          teachers: [
            { id: 't-1', name: 'Dr. Pratibha Rao', employeeCode: 'EMP101', designation: 'Associate Professor & HOD', department: 'Computer Applications', email: 'pratibha.rao@sicm.edu.in' },
            { id: 't-2', name: 'Prof. Suresh Kumar', employeeCode: 'EMP102', designation: 'Assistant Professor', department: 'Computer Applications', email: 'suresh.kumar@sicm.edu.in' },
            { id: 't-3', name: 'Prof. Narayana S.', employeeCode: 'EMP103', designation: 'Professor & Dean', department: 'Computer Applications', email: 'admin@sicm.edu.in' },
          ],
          sections: [
            { id: 'sec-1', name: 'BCA 1st Year', room: '101', capacity: 70, program: 'BCA' },
            { id: 'sec-2', name: 'BCA 2nd Year', room: '102', capacity: 70, program: 'BCA' },
            { id: 'sec-3', name: 'BCA 3rd Year', room: '103', capacity: 70, program: 'BCA' },
          ],
        });
        if (json) setData(json);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAcademic();
  }, []);

  return (
    <AppShell>
      <div className="space-y-5 max-w-7xl mx-auto py-2">
        {/* Header */}
        <div className="pb-2 border-b border-stone-200/80">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Collegiate Infrastructure & Master Registers
            </h1>
            <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase tracking-wider">
              Directory
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Institutional faculties, curricula, lecture halls, and academic rosters
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-xl bg-white border border-stone-200 p-1.5 overflow-x-auto shadow-2xs gap-1">
          {[
            { key: 'DEPARTMENTS', label: 'Faculties & Programs', icon: Building },
            { key: 'SUBJECTS', label: 'Curriculum Subjects', icon: BookOpen },
            { key: 'ROOMS', label: 'Lecture Halls & Labs', icon: MapPin },
            { key: 'FACULTY', label: 'Faculty Fellowship', icon: Users },
            { key: 'SECTIONS', label: 'Class Cohorts (27)', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Departments */}
        {activeTab === 'DEPARTMENTS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data?.departments?.map((dept: any) => (
              <div key={dept.id} className="rounded-xl border border-stone-200 bg-white p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-mono font-bold text-blue-900">
                    {dept.code}
                  </span>
                  <span className="text-xs text-stone-400 font-medium">{dept.programs?.length || 1} Programs</span>
                </div>
                <h3 className="font-bold text-sm text-stone-900">{dept.name}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{dept.description}</p>
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                  <span>Programs:</span>
                  <span className="font-bold text-stone-800">{dept.programs?.map((p: any) => p.name).join(', ') || 'Undergraduate'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Subjects */}
        {activeTab === 'SUBJECTS' && (
          <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-stone-50 text-[10px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200">
                    <th className="p-3.5 pl-5">Code</th>
                    <th className="p-3.5">Subject Title</th>
                    <th className="p-3.5">Faculty</th>
                    <th className="p-3.5 text-center">Type</th>
                    <th className="p-3.5 text-center">Credits</th>
                    <th className="p-3.5 text-right pr-5">Weekly Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data?.subjects?.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-3.5 pl-5 font-mono font-bold text-stone-900">{sub.code}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded" style={{ backgroundColor: sub.color || '#0D2F6B' }} />
                          <span className="font-bold text-stone-900">{sub.name}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-stone-600">{sub.department?.name || 'Computer Applications'}</td>
                      <td className="p-3.5 text-center">
                        <span className="rounded bg-stone-100 px-2 py-0.5 font-semibold text-[10px] text-stone-700">
                          {sub.type}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-bold text-stone-800">{sub.credits}</td>
                      <td className="p-3.5 text-right pr-5 font-bold text-stone-800 font-mono">{sub.hoursPerWeek} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Rooms */}
        {activeTab === 'ROOMS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.rooms?.map((r: any) => (
              <div key={r.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-stone-900">{r.roomNumber}</span>
                  <span className="rounded bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-700">
                    {r.type}
                  </span>
                </div>
                <p className="text-xs font-semibold text-stone-800">{r.name}</p>
                <p className="text-[11px] text-stone-500">{r.building} • Floor {r.floor}</p>
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                  <span>Capacity:</span>
                  <span className="font-bold text-blue-900">{r.capacity} Seats</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Faculty */}
        {activeTab === 'FACULTY' && (
          <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-[10px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200">
                    <th className="p-3.5 pl-5">Emp Code</th>
                    <th className="p-3.5">Professor Name</th>
                    <th className="p-3.5">Designation</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5 text-right pr-5">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data?.teachers?.map((t: any) => (
                    <tr key={t.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-3.5 pl-5 font-mono font-bold text-stone-900">{t.employeeCode || 'EMP101'}</td>
                      <td className="p-3.5 font-bold text-stone-900">{t.name}</td>
                      <td className="p-3.5 text-stone-600">{t.designation || 'Faculty'}</td>
                      <td className="p-3.5 text-stone-600">{t.department || 'Computer Applications'}</td>
                      <td className="p-3.5 text-right pr-5 font-mono text-stone-500">{t.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Sections */}
        {activeTab === 'SECTIONS' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data?.sections?.map((s: any) => (
              <div key={s.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-stone-900">{s.name}</h4>
                  <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    Room {s.room}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">Cohort Capacity: {s.capacity} Scholars</p>
                <p className="text-[10px] text-stone-400 font-mono">Program: {s.program}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
