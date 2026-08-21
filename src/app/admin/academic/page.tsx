'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import {
  Building,
  BookOpen,
  Users,
  MapPin,
  GraduationCap,
  Sparkles,
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
        const res = await fetch('/api/academic');
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAcademic();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-extrabold text-stone-900 tracking-tight">
              Collegiate Infrastructure & Master Registers
            </h1>
            <span className="font-cinzel rounded-md bg-gold-100 px-2.5 py-0.5 text-xs font-bold text-gold-950 border border-gold-300">
              Directory
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Institutional faculties, curricula, lecture halls, and fellowship profiles
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-2xl bg-white border border-stone-200 p-1.5 overflow-x-auto shadow-xs">
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
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-crimson-800 to-crimson-900 text-white shadow-md shadow-crimson-950/20'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Departments */}
        {activeTab === 'DEPARTMENTS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data?.departments?.map((dept: any) => (
              <div key={dept.id} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-crimson-50 border border-crimson-200 px-2.5 py-1 text-xs font-mono font-bold text-crimson-900">
                    {dept.code}
                  </span>
                  <span className="text-xs text-stone-400 font-medium">{dept.programs?.length || 1} Programs</span>
                </div>
                <h3 className="font-serif font-extrabold text-base text-stone-900">{dept.name}</h3>
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
          <div className="rounded-3xl border border-stone-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-stone-50 text-[10px] font-cinzel font-bold text-stone-500 uppercase tracking-widest border-b border-stone-200">
                    <th className="p-4">Code</th>
                    <th className="p-4">Subject Title</th>
                    <th className="p-4">Faculty</th>
                    <th className="p-4 text-center">Type</th>
                    <th className="p-4 text-center">Credits</th>
                    <th className="p-4 text-center">Weekly Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {data?.subjects?.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-stone-50/60">
                      <td className="p-4 font-mono font-bold text-stone-900">{sub.code}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: sub.color || '#0D2F6B' }} />
                          <span className="font-serif font-bold text-stone-900">{sub.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-stone-600">{sub.department?.name || 'Computer Applications'}</td>
                      <td className="p-4 text-center">
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 font-semibold text-[10px] text-stone-700">
                          {sub.type}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-stone-800">{sub.credits}</td>
                      <td className="p-4 text-center font-bold text-stone-800 font-mono">{sub.hoursPerWeek} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Rooms */}
        {activeTab === 'ROOMS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data?.rooms?.map((room: any) => (
              <div key={room.id} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-stone-100 px-2 py-0.5 rounded text-stone-800">
                    {room.roomNumber}
                  </span>
                  <span className="text-[10px] font-cinzel font-bold text-gold-900 bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
                    {room.type}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-sm text-stone-900">{room.name}</h3>
                <p className="text-xs text-stone-500">Floor {room.floor} • Capacity: {room.capacity} scholars</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Faculty */}
        {activeTab === 'FACULTY' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data?.teachers?.map((t: any) => (
              <div key={t.id} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-crimson-100 text-crimson-900 font-serif font-bold text-sm">
                    {t.user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-serif font-bold text-sm text-stone-900 truncate">{t.user.name}</h3>
                    <p className="text-[10px] text-stone-500 font-mono">{t.employeeCode}</p>
                  </div>
                </div>
                <p className="text-xs text-stone-600 font-medium">{t.designation || 'Faculty Member'}</p>
                <p className="text-[11px] text-crimson-800 font-semibold">{t.department?.name || 'Department Faculty'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Sections */}
        {activeTab === 'SECTIONS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data?.sections?.map((sec: any) => (
              <div key={sec.id} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-stone-900">{sec.name}</span>
                  <span className="font-mono text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                    70 Enrolled
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-mono">Academic Cohort 2024-2027</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
