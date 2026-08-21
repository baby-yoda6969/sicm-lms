'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import {
  BookOpen,
  Plus,
  Upload,
  Download,
  Trash2,
  FileText,
  X,
  CheckCircle2,
} from 'lucide-react';
import { SEED_MATERIALS } from '@/lib/firebase/seed';

export default function TeacherMaterialsPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState(SEED_MATERIALS);
  const [uploadModal, setUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Operating Systems (BCA404)');
  const [type, setType] = useState<'SLIDES' | 'NOTES' | 'LAB_MANUAL' | 'PDF'>('SLIDES');
  const [fileName, setFileName] = useState('');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const newMat = {
      id: `mat-${Date.now()}`,
      subjectId: 'sub-bca404',
      subjectName: subject,
      title,
      type,
      fileUrl: '#',
      uploadedBy: user?.name || 'Dr. Pratibha Rao',
      uploadedAt: new Date().toISOString().split('T')[0],
      fileSize: '3.4 MB',
    };
    setMaterials([newMat, ...materials]);
    setUploadModal(false);
    setTitle('');
    setFileName('');
  };

  const handleDelete = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  return (
    <AppShell>
      <div className="space-y-5 max-w-5xl mx-auto py-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/80">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Course Learning Materials Repository
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {user?.name || 'Dr. Pratibha Rao'} • Faculty Department of Computer Applications
            </p>
          </div>

          <button
            type="button"
            onClick={() => setUploadModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Upload New Material</span>
          </button>
        </div>

        {/* Materials List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs flex flex-col justify-between space-y-3"
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

                <p className="text-[11px] text-stone-400">
                  Published: {mat.uploadedAt}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  Live for Students
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(mat.id)}
                  className="p-1.5 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete resource"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Material Modal */}
        {uploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-xl border border-stone-200 p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bold text-stone-900 text-sm">Upload Study Resource</h3>
                <button
                  type="button"
                  onClick={() => setUploadModal(false)}
                  className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-3 text-xs">
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
                  <label className="font-semibold text-stone-700">Document Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Unit 4: File Systems & Directory Structures"
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Resource Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-900 outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="SLIDES">Lecture Presentation Slides</option>
                    <option value="NOTES">Comprehensive Study Notes</option>
                    <option value="LAB_MANUAL">Laboratory Manual & Code</option>
                    <option value="PDF">Reference Reading Material</option>
                  </select>
                </div>

                <div className="border-2 border-dashed border-stone-200 rounded-lg p-3.5 text-center space-y-1.5 bg-stone-50/50">
                  <Upload className="size-5 text-blue-600 mx-auto" />
                  <p className="text-[11px] text-stone-500">
                    {fileName ? `✓ Selected: ${fileName}` : 'Choose PDF, PPTX or ZIP file'}
                  </p>
                  <input
                    type="file"
                    id="mat-file"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setFileName(f.name);
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('mat-file')?.click()}
                    className="px-3 py-1 rounded bg-white border border-stone-200 text-[11px] font-semibold text-stone-700 hover:bg-stone-50 shadow-2xs cursor-pointer"
                  >
                    Browse Files
                  </button>
                </div>

                <div className="flex gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setUploadModal(false)}
                    className="flex-1 py-2 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Upload Resource
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
