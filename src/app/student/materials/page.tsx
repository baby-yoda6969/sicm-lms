'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import {
  FileText,
  Download,
  Search,
  Filter,
  Layers,
  BookOpen,
  User,
  CheckCircle2,
} from 'lucide-react';
import { SEED_MATERIALS } from '@/lib/firebase/seed';

export default function StudentMaterialsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [downloaded, setDownloaded] = useState<{ [key: string]: boolean }>({});

  const filteredMaterials = SEED_MATERIALS.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      m.uploadedBy.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (id: string, title: string) => {
    setDownloaded((prev) => ({ ...prev, [id]: true }));
    alert(`Downloading "${title}"...`);
  };

  return (
    <AppShell>
      <div className="space-y-5 max-w-5xl mx-auto py-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/80">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Learning Materials & Lecture Notes
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {user?.sectionName || 'BCA 2nd Year'} • Official Academic Course Resources
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes, slides, manuals..."
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-blue-600 outline-none pr-8 shadow-2xs"
            />
            <Search className="size-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Materials List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs flex flex-col justify-between space-y-3 hover:border-stone-300 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {mat.subjectName}
                  </span>
                  <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                    {mat.type} • {mat.fileSize}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-stone-900 tracking-tight">
                  {mat.title}
                </h3>

                <p className="text-[11px] text-stone-500 flex items-center gap-1.5 font-medium">
                  <User className="size-3 text-stone-400" />
                  Uploaded by {mat.uploadedBy} • {mat.uploadedAt}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[10px] text-stone-400">PDF Document</span>
                <button
                  type="button"
                  onClick={() => handleDownload(mat.id, mat.title)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200/80 transition-colors cursor-pointer"
                >
                  {downloaded[mat.id] ? (
                    <>
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      <span>Downloaded</span>
                    </>
                  ) : (
                    <>
                      <Download className="size-3.5" />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
