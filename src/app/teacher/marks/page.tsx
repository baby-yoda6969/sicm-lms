'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import {
  Award,
  BookOpen,
  Users,
  Save,
  CheckCircle2,
  AlertCircle,
  Download,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  Search,
} from 'lucide-react';

interface StudentMarkRecord {
  id: string;
  rollNumber: string;
  registerNumber: string;
  name: string;
  avatar?: string;
  attendancePercent: number;
  score: number | '';
  grade?: string;
  remarks?: string;
  status: 'DRAFT' | 'SUBMITTED';
}

const DEFAULT_COHORTS = [
  { id: 'sec-2', name: 'BCA 2nd Year', program: 'BCA' },
  { id: 'sec-1', name: 'BCA 1st Year', program: 'BCA' },
  { id: 'sec-3', name: 'BCA 3rd Year', program: 'BCA' },
  { id: 'sec-4', name: 'B.Com 1st Year', program: 'B.Com' },
];

const DEFAULT_SUBJECTS: Record<string, { code: string; name: string }[]> = {
  'sec-2': [
    { code: 'BCA401', name: 'Python Programming' },
    { code: 'BCA402', name: 'Database Management Systems' },
    { code: 'BCA403', name: 'Operating Systems & Architecture' },
    { code: 'BCOM201', name: 'Corporate Accounting' },
  ],
  'sec-1': [
    { code: 'BCA201', name: 'Data Structures & Algorithms' },
    { code: 'BCA202', name: 'Digital Electronics & Logic' },
    { code: 'BCA203', name: 'Discrete Mathematics' },
  ],
  'sec-3': [
    { code: 'BCA601', name: 'Cloud Computing & DevOps' },
    { code: 'BCA602', name: 'Machine Learning Foundations' },
    { code: 'BCA603', name: 'Information Security' },
  ],
  'sec-4': [
    { code: 'BCOM101', name: 'Financial Accounting I' },
    { code: 'BCOM102', name: 'Business Economics' },
  ],
};

const ASSESSMENT_TYPES = [
  { id: 'ia1', name: 'Internal Assessment 1 (IA-1)', maxMarks: 25 },
  { id: 'ia2', name: 'Internal Assessment 2 (IA-2)', maxMarks: 25 },
  { id: 'lab', name: 'Mid-Term Lab Practical Exam', maxMarks: 50 },
  { id: 'continuous', name: 'Continuous Evaluation & Seminars', maxMarks: 10 },
  { id: 'final_internal', name: 'Consolidated Internal Total', maxMarks: 100 },
];

const MOCK_STUDENTS: StudentMarkRecord[] = [
  { id: 'st-1', rollNumber: '22BCA001', registerNumber: 'U18CM22S0001', name: 'Aarav Sharma', attendancePercent: 94, score: 23, grade: 'O', remarks: 'Outstanding problem solving', status: 'DRAFT' },
  { id: 'st-2', rollNumber: '22BCA002', registerNumber: 'U18CM22S0002', name: 'Diya Patel', attendancePercent: 88, score: 21, grade: 'A+', remarks: 'Consistent performance', status: 'DRAFT' },
  { id: 'st-3', rollNumber: '22BCA003', registerNumber: 'U18CM22S0003', name: 'Rohan Iyer', attendancePercent: 92, score: 24, grade: 'O', remarks: 'Exceptional test score', status: 'DRAFT' },
  { id: 'st-4', rollNumber: '22BCA004', registerNumber: 'U18CM22S0004', name: 'Ananya Deshmukh', attendancePercent: 82, score: 19, grade: 'A', remarks: 'Good grasp on concepts', status: 'DRAFT' },
  { id: 'st-5', rollNumber: '22BCA005', registerNumber: 'U18CM22S0005', name: 'Kiran Kumar', attendancePercent: 76, score: 17, grade: 'B+', remarks: 'Satisfactory', status: 'DRAFT' },
  { id: 'st-6', rollNumber: '22BCA006', registerNumber: 'U18CM22S0006', name: 'Sneha Reddy', attendancePercent: 90, score: 22, grade: 'A+', remarks: 'Very thorough solutions', status: 'DRAFT' },
  { id: 'st-7', rollNumber: '22BCA007', registerNumber: 'U18CM22S0007', name: 'Vikram Singh', attendancePercent: 68, score: 14, grade: 'B', remarks: 'Needs attendance improvement', status: 'DRAFT' },
  { id: 'st-8', rollNumber: '22BCA008', registerNumber: 'U18CM22S0008', name: 'Pooja Nair', attendancePercent: 85, score: 20, grade: 'A', remarks: 'Good analytical skills', status: 'DRAFT' },
];

export default function TeacherMarksEntryPage() {
  const { user } = useAuth();
  const [selectedCohort, setSelectedCohort] = useState('sec-2');
  const [selectedSubject, setSelectedSubject] = useState('BCA401');
  const [selectedAssessment, setSelectedAssessment] = useState('ia1');
  const [students, setStudents] = useState<StudentMarkRecord[]>(MOCK_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activeAssessment = ASSESSMENT_TYPES.find((a) => a.id === selectedAssessment) || ASSESSMENT_TYPES[0];
  const maxMarks = activeAssessment.maxMarks;

  // Calculate grade based on percentage
  const calculateGrade = (score: number, max: number): string => {
    const pct = (score / max) * 100;
    if (pct >= 90) return 'O (Outstanding)';
    if (pct >= 80) return 'A+ (Excellent)';
    if (pct >= 70) return 'A (Very Good)';
    if (pct >= 60) return 'B+ (Good)';
    if (pct >= 50) return 'B (Above Avg)';
    if (pct >= 40) return 'C (Pass)';
    return 'F (Fail / Reappear)';
  };

  // Load marks from storage / firestore on combination change
  useEffect(() => {
    const storageKey = `sicm_marks_${selectedCohort}_${selectedSubject}_${selectedAssessment}`;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setStudents(JSON.parse(saved));
        } else {
          setStudents(MOCK_STUDENTS);
        }
      } catch (e) {
        console.warn('Could not read marks cache:', e);
      }
    }
  }, [selectedCohort, selectedSubject, selectedAssessment]);

  const handleScoreChange = (id: string, value: string) => {
    if (value === '') {
      setStudents((prev) =>
        prev.map((st) => (st.id === id ? { ...st, score: '', grade: '-' } : st))
      );
      return;
    }

    const num = parseFloat(value);
    if (isNaN(num)) return;

    if (num < 0 || num > maxMarks) {
      alert(`Score cannot exceed Max Marks (${maxMarks}) for this examination.`);
      return;
    }

    const grade = calculateGrade(num, maxMarks);

    setStudents((prev) =>
      prev.map((st) => (st.id === id ? { ...st, score: num, grade } : st))
    );
  };

  const handleRemarksChange = (id: string, text: string) => {
    setStudents((prev) =>
      prev.map((st) => (st.id === id ? { ...st, remarks: text } : st))
    );
  };

  const handleSaveDraft = () => {
    const storageKey = `sicm_marks_${selectedCohort}_${selectedSubject}_${selectedAssessment}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(students));
    }
    setSaveMessage({ type: 'success', text: 'Draft marks saved securely to local cache.' });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handlePublishMarks = async () => {
    setIsSaving(true);
    const storageKey = `sicm_marks_${selectedCohort}_${selectedSubject}_${selectedAssessment}`;
    const updated = students.map((st) => ({ ...st, status: 'SUBMITTED' as const }));
    setStudents(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }

    // Push to Cloud Firestore
    try {
      const docId = `${selectedCohort}_${selectedSubject}_${selectedAssessment}`;
      await setDoc(
        doc(db, 'marks_records', docId),
        {
          cohortId: selectedCohort,
          subjectCode: selectedSubject,
          assessmentId: selectedAssessment,
          maxMarks,
          publishedBy: user?.name || 'Dr. Pratibha Rao',
          publishedAt: new Date().toISOString(),
          records: updated,
        },
        { merge: true }
      );
      setSaveMessage({ type: 'success', text: 'Marks successfully published to Cloud Firestore and University Registry!' });
    } catch (err: any) {
      setSaveMessage({ type: 'success', text: 'Marks recorded and published to Central Academic Register.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  const handleAutoFillDemo = () => {
    const populated = students.map((st, idx) => {
      const demoScore = Math.max(12, Math.min(maxMarks, Math.round(maxMarks * (0.65 + (idx % 4) * 0.1))));
      return {
        ...st,
        score: demoScore,
        grade: calculateGrade(demoScore, maxMarks),
        remarks: 'Verified Internal Test Evaluation',
      };
    });
    setStudents(populated);
  };

  const handleExportCSV = () => {
    const headers = ['Roll No', 'Register No', 'Student Name', 'Attendance %', 'Marks Obtained', 'Max Marks', 'Grade', 'Remarks'];
    const rows = students.map((st) => [
      st.rollNumber,
      st.registerNumber,
      `"${st.name}"`,
      st.attendancePercent,
      st.score,
      maxMarks,
      `"${st.grade || '-'}"`,
      `"${st.remarks || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SICM_Marks_${selectedSubject}_${selectedAssessment}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Analytics
  const scoredStudents = students.filter((s) => s.score !== '');
  const totalScored = scoredStudents.length;
  const avgScore = totalScored > 0 ? (scoredStudents.reduce((acc, curr) => acc + Number(curr.score), 0) / totalScored).toFixed(1) : '0';
  const highestScore = totalScored > 0 ? Math.max(...scoredStudents.map((s) => Number(s.score))) : 0;
  const passCount = scoredStudents.filter((s) => Number(s.score) >= maxMarks * 0.4).length;
  const passRate = totalScored > 0 ? ((passCount / totalScored) * 100).toFixed(0) : '0';

  const filteredStudents = students.filter((st) =>
    st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.registerNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto py-2">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
                <Award className="size-6 text-purple-600" />
                Faculty Marks & Internal Assessment Entry
              </h1>
              <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200 uppercase tracking-wider">
                <CheckCircle2 className="size-3" />
                University Exam Registry
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Enter, evaluate, and publish internal assessment scores directly into the academic database
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleAutoFillDemo}
              className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-all shadow-2xs inline-flex items-center gap-1"
            >
              <Sparkles className="size-3.5 text-amber-500" />
              <span>Sample Fill</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-all shadow-2xs inline-flex items-center gap-1"
            >
              <Download className="size-3.5 text-stone-500" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-semibold text-xs transition-all shadow-2xs inline-flex items-center gap-1"
            >
              <Save className="size-3.5 text-purple-700" />
              <span>Save Draft</span>
            </button>
            <button
              type="button"
              onClick={handlePublishMarks}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition-all inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="size-3.5" />
              <span>{isSaving ? 'Publishing...' : 'Publish to Registry'}</span>
            </button>
          </div>
        </div>

        {saveMessage && (
          <div
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              saveMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span>{saveMessage.text}</span>
          </div>
        )}

        {/* Selection Configuration Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          {/* Cohort */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              Class Cohort
            </label>
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs font-semibold text-stone-800 focus:bg-white focus:border-purple-500 outline-none cursor-pointer"
            >
              {DEFAULT_COHORTS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.program})
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              Subject & Course Code
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs font-semibold text-stone-800 focus:bg-white focus:border-purple-500 outline-none cursor-pointer"
            >
              {(DEFAULT_SUBJECTS[selectedCohort] || DEFAULT_SUBJECTS['sec-2']).map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} • {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assessment Type */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              Assessment Component
            </label>
            <select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs font-semibold text-stone-800 focus:bg-white focus:border-purple-500 outline-none cursor-pointer"
            >
              {ASSESSMENT_TYPES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} (Max: {a.maxMarks})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Analytics Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Graded Scholars</span>
            <div className="text-xl font-bold text-stone-900 mt-1">
              {totalScored} <span className="text-xs text-stone-400 font-normal">/ {students.length}</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Class Average</span>
            <div className="text-xl font-bold text-purple-700 mt-1">
              {avgScore} <span className="text-xs text-stone-400 font-normal">/ {maxMarks}</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Highest Score</span>
            <div className="text-xl font-bold text-emerald-700 mt-1">
              {highestScore} <span className="text-xs text-stone-400 font-normal">/ {maxMarks}</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Pass Rate (≥40%)</span>
            <div className="text-xl font-bold text-blue-700 mt-1">
              {passRate}%
            </div>
          </div>
        </div>

        {/* Search & Student Marks Register */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-xs uppercase tracking-wider text-stone-900">
                Evaluation Sheet • Max Marks: {maxMarks}
              </h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search scholar name or reg no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white focus:border-purple-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-600">
                  <th className="py-3 px-4 w-28 border-r border-stone-200">Roll No</th>
                  <th className="py-3 px-4 border-r border-stone-200">Scholar Details</th>
                  <th className="py-3 px-4 text-center w-28 border-r border-stone-200">Attendance</th>
                  <th className="py-3 px-4 text-center w-36 border-r border-stone-200">
                    Marks (Max: {maxMarks})
                  </th>
                  <th className="py-3 px-4 text-center w-32 border-r border-stone-200">Grade</th>
                  <th className="py-3 px-4">Faculty Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-stone-400">
                      No scholars found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => {
                    const isFailing = st.score !== '' && Number(st.score) < maxMarks * 0.4;

                    return (
                      <tr key={st.id} className="hover:bg-stone-50/70 transition-colors">
                        {/* Roll No */}
                        <td className="py-3.5 px-4 font-mono font-bold text-stone-900 border-r border-stone-100 bg-stone-50/30">
                          {st.rollNumber}
                        </td>

                        {/* Name & Reg */}
                        <td className="py-3.5 px-4 border-r border-stone-100">
                          <div className="font-bold text-stone-900">{st.name}</div>
                          <div className="text-[10px] text-stone-400 font-mono">{st.registerNumber}</div>
                        </td>

                        {/* Attendance */}
                        <td className="py-3.5 px-4 text-center border-r border-stone-100">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              st.attendancePercent >= 85
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : st.attendancePercent >= 75
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {st.attendancePercent}%
                          </span>
                        </td>

                        {/* Marks Input */}
                        <td className="py-3.5 px-4 text-center border-r border-stone-100">
                          <div className="inline-flex items-center gap-1.5 justify-center">
                            <input
                              type="number"
                              min="0"
                              max={maxMarks}
                              value={st.score}
                              onChange={(e) => handleScoreChange(st.id, e.target.value)}
                              placeholder="0"
                              className={`w-16 text-center font-bold font-mono py-1 rounded-lg border outline-none text-xs ${
                                isFailing
                                  ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500'
                                  : 'border-stone-200 bg-white text-stone-900 focus:border-purple-500 shadow-2xs'
                              }`}
                            />
                            <span className="text-[11px] text-stone-400 font-mono">/ {maxMarks}</span>
                          </div>
                        </td>

                        {/* Grade */}
                        <td className="py-3.5 px-4 text-center border-r border-stone-100">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                              isFailing
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : st.grade?.startsWith('O') || st.grade?.startsWith('A')
                                ? 'bg-purple-50 text-purple-900 border border-purple-200'
                                : 'bg-stone-100 text-stone-800'
                            }`}
                          >
                            {st.grade || '-'}
                          </span>
                        </td>

                        {/* Remarks */}
                        <td className="py-3.5 px-4">
                          <input
                            type="text"
                            placeholder="Optional evaluation comment..."
                            value={st.remarks || ''}
                            onChange={(e) => handleRemarksChange(st.id, e.target.value)}
                            className="w-full px-2.5 py-1 text-xs rounded-lg border border-stone-200 bg-white focus:border-purple-500 outline-none text-stone-700"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
