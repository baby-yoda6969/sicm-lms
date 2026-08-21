'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import {
  FileSpreadsheet,
  TrendingUp,
  Download,
  AlertTriangle,
  Users,
  Building,
  CheckCircle2,
  Calendar,
  Filter,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/analytics');
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error('Error fetching analytics:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Export Low Attendance List to CSV
  const handleExportCSV = () => {
    if (!data?.lowAttendanceList) return;

    const headers = ['Student Name', 'Roll Number', 'Program', 'Section', 'Subject', 'Classes Held', 'Classes Present', 'Attendance %', 'Status'];
    const rows = data.lowAttendanceList.map((item: any) => [
      `"${item.name}"`,
      `"${item.rollNumber}"`,
      `"${item.program}"`,
      `"${item.section}"`,
      `"${item.subjectName}"`,
      item.held,
      item.present,
      `${item.percentage}%`,
      item.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SICM_Low_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const trends = data?.attendanceTrends || [
    { date: '08-10', percentage: 88.5 },
    { date: '08-11', percentage: 89.2 },
    { date: '08-12', percentage: 87.0 },
    { date: '08-13', percentage: 91.4 },
    { date: '08-14', percentage: 86.8 },
    { date: '08-17', percentage: 89.5 },
    { date: '08-18', percentage: 88.0 },
    { date: '08-19', percentage: 87.3 },
    { date: '08-20', percentage: 89.1 },
  ];

  const deptData = data?.departmentStats || [
    { code: 'BCA', name: 'Computer Applications', percentage: 89.2 },
    { code: 'BCOM', name: 'Commerce', percentage: 88.0 },
    { code: 'BBA', name: 'Business Admin', percentage: 87.5 },
  ];

  return (
    <AppShell>
      <div className="space-y-5 max-w-7xl mx-auto py-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/80">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Institutional Attendance Analytics & Reports
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Cross-departmental trends, lecture compliance rates, and university threshold compliance
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Download className="size-3.5" />
            <span>Export CSV Report</span>
          </button>
        </div>

        {/* Top Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Trend Line Chart */}
          <div className="lg:col-span-2 rounded-xl border border-stone-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                  Campus-Wide Attendance Trendline
                </h3>
                <p className="text-[11px] text-stone-500">10-Day aggregate attendance curve across all departments</p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                89.4% Avg
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#0D2F6B"
                    strokeWidth={2.5}
                    dot={{ fill: '#0D2F6B', strokeWidth: 1, r: 3.5 }}
                    activeDot={{ r: 5, fill: '#0284C7' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Breakdown Bar Chart */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                Department Comparison
              </h3>
              <p className="text-[11px] text-stone-500">Attendance compliance by discipline</p>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="code" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="percentage" fill="#0D2F6B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Low Attendance Critical Watchlist Table - Completely Redesigned & Sleek */}
        <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/50">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                <AlertTriangle className="size-4.5 stroke-[2]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                    Critical Attendance Shortage Watchlist (&lt;75%)
                  </h3>
                  <span className="rounded bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.2 border border-rose-200">
                    Remedial Required
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Scholars requiring mandatory remedial lecture attendance before end-semester exam hall ticket release
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs shadow-2xs transition-colors self-start sm:self-center cursor-pointer"
            >
              <Download className="size-3.5 text-stone-400" />
              <span>Export Full List</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="p-3.5 pl-5">Roll No</th>
                  <th className="p-3.5">Scholar Name</th>
                  <th className="p-3.5">Program & Cohort</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5 text-center">Conducted / Attended</th>
                  <th className="p-3.5 text-right pr-5">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {data?.lowAttendanceList?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-400">
                      No scholars currently below the 75% attendance requirement.
                    </td>
                  </tr>
                ) : (
                  data?.lowAttendanceList?.map((s: any, i: number) => (
                    <tr key={i} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-3.5 pl-5 font-mono font-bold text-stone-900">
                        <span className="bg-stone-100 px-1.5 py-0.5 rounded text-[11px]">
                          {s.rollNumber}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-stone-900">{s.name}</td>
                      <td className="p-3.5 text-stone-600">{s.section}</td>
                      <td className="p-3.5 font-semibold text-stone-900">{s.subjectName}</td>
                      <td className="p-3.5 text-center text-stone-600 font-mono text-[11px]">
                        {s.present} / {s.held} lectures
                      </td>
                      <td className="p-3.5 text-right pr-5">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-rose-700 font-mono">
                            {s.percentage}%
                          </span>
                          <span className="text-[9px] font-bold text-rose-800 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            Shortage
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
