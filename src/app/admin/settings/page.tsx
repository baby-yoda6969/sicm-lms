'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Clock,
  QrCode,
  Award,
} from 'lucide-react';
import { safeFetchJson } from '@/lib/apiHelper';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    ATTENDANCE_CRITICAL_THRESHOLD: '75',
    ATTENDANCE_WARNING_THRESHOLD: '85',
    COLLEGE_NAME: 'Seshadripuram Institute of Commerce and Management (SICM)',
    COLLEGE_CODE: 'SICM-BLR',
    ACADEMIC_YEAR: '2026-2027',
    QR_EXPIRY_SECONDS: '90',
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { ok, data } = await safeFetchJson('/api/settings');
        if (data?.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      } catch (e) {
        console.warn(e);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await safeFetchJson('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.warn(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-extrabold text-stone-900 tracking-tight">
                Institutional Governance & Policy Rules
              </h1>
              <span className="font-cinzel rounded-md bg-gold-100 px-2.5 py-0.5 text-xs font-bold text-gold-950 border border-gold-300">
                Statutes
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Configure collegiate attendance thresholds, smart QR token lifecycles, and institutional metadata
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Attendance Thresholds */}
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <ShieldCheck className="h-5 w-5 text-crimson-800" />
              <h2 className="font-serif font-extrabold text-sm text-stone-900">
                Academic Attendance Compliance Thresholds
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1 font-cinzel text-[10px]">
                  Mandatory Minimum Attendance (Critical Threshold %)
                </label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={settings.ATTENDANCE_CRITICAL_THRESHOLD}
                  onChange={(e) =>
                    setSettings({ ...settings, ATTENDANCE_CRITICAL_THRESHOLD: e.target.value })
                  }
                  className="w-full rounded-2xl border border-stone-200 px-3.5 py-2.5 text-stone-900 font-bold focus:border-crimson-700 outline-none"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Scholars falling below this percentage are flagged on the examination shortage watchlist.
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1 font-cinzel text-[10px]">
                  Warning Advisory Threshold (%)
                </label>
                <input
                  type="number"
                  min={60}
                  max={100}
                  value={settings.ATTENDANCE_WARNING_THRESHOLD}
                  onChange={(e) =>
                    setSettings({ ...settings, ATTENDANCE_WARNING_THRESHOLD: e.target.value })
                  }
                  className="w-full rounded-2xl border border-stone-200 px-3.5 py-2.5 text-stone-900 font-bold focus:border-crimson-700 outline-none"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Triggers precautionary dispatches to scholars before they breach critical examination levels.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Smart QR Code Security Settings */}
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <QrCode className="h-5 w-5 text-crimson-800" />
              <h2 className="font-serif font-extrabold text-sm text-stone-900">
                Smart QR Attendance Security Configuration
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1 font-cinzel text-[10px]">
                  Dynamic QR Code Expiry Duration (Seconds)
                </label>
                <input
                  type="number"
                  min={30}
                  max={300}
                  value={settings.QR_EXPIRY_SECONDS}
                  onChange={(e) => setSettings({ ...settings, QR_EXPIRY_SECONDS: e.target.value })}
                  className="w-full rounded-2xl border border-stone-200 px-3.5 py-2.5 text-stone-900 font-bold focus:border-crimson-700 outline-none"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Time window before projected token rotates to prevent unauthorized sharing.
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1 font-cinzel text-[10px]">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={settings.ACADEMIC_YEAR}
                  onChange={(e) => setSettings({ ...settings, ACADEMIC_YEAR: e.target.value })}
                  className="w-full rounded-2xl border border-stone-200 px-3.5 py-2.5 text-stone-900 font-bold focus:border-crimson-700 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Institution Metadata */}
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Settings className="h-5 w-5 text-crimson-800" />
              <h2 className="font-serif font-extrabold text-sm text-stone-900">
                Institution Identification
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1 font-cinzel text-[10px]">
                  Institution Full Name
                </label>
                <input
                  type="text"
                  value={settings.COLLEGE_NAME}
                  onChange={(e) => setSettings({ ...settings, COLLEGE_NAME: e.target.value })}
                  className="w-full rounded-2xl border border-stone-200 px-3.5 py-2.5 text-stone-900 font-bold focus:border-crimson-700 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1 font-cinzel text-[10px]">
                  College Code
                </label>
                <input
                  type="text"
                  value={settings.COLLEGE_CODE}
                  onChange={(e) => setSettings({ ...settings, COLLEGE_CODE: e.target.value })}
                  className="w-full rounded-2xl border border-stone-200 px-3.5 py-2.5 text-stone-900 font-bold focus:border-crimson-700 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            {saveSuccess ? (
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4" /> Statutes successfully updated and enforced!
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-crimson-800 via-crimson-900 to-crimson-950 hover:from-crimson-900 hover:to-black text-white font-bold px-6 py-3 text-xs uppercase tracking-wider shadow-md shadow-crimson-950/20 transition-all hover:scale-105"
            >
              <Save className="h-4 w-4 text-gold-400" />
              {saving ? 'Enforcing...' : 'Enforce Configuration'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
