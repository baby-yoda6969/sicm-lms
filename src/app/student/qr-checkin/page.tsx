'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  CalendarCheck,
  ClipboardCheck,
} from 'lucide-react';
import QRCodeScannerModal from '@/components/attendance/QRCodeScannerModal';
import { verifyAndRecordAttendance } from '@/lib/firebase/firestore';

export default function StudentQrCheckinPage() {
  const { user } = useAuth();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    alreadyMarked?: boolean;
    subjectName?: string;
    timestamp?: string;
  } | null>(null);

  const handleManualVerify = async () => {
    if (!tokenInput.trim()) {
      alert('Please enter a session token.');
      return;
    }
    setLoading(true);
    const res = await verifyAndRecordAttendance({
      token: tokenInput.trim(),
      studentId: user?.studentProfileId || 's-1',
      studentName: user?.name || 'Aarav Sharma',
      verificationMethod: 'MANUAL',
    });
    setResult(res);
    setLoading(false);
  };

  const handleInstantCheckIn = async () => {
    setLoading(true);
    const res = await verifyAndRecordAttendance({
      token: 'SICM-LIVE-BCA404',
      studentId: user?.studentProfileId || 's-1',
      studentName: user?.name || 'Aarav Sharma',
      verificationMethod: 'ONE_CLICK',
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <AppShell>
      <div className="max-w-md mx-auto py-6 sm:py-8 space-y-5">
        {/* Professional Structured Card */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-xs space-y-5 text-center">
          {/* Lecture Metadata */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="size-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>Period 3 • Live Session Active</span>
            </div>
            <h1 className="text-lg font-bold text-stone-900 tracking-tight pt-1">
              Operating Systems
            </h1>
            <p className="text-xs text-stone-500 font-medium">
              BCA404 • Dr. Pratibha Rao • Hall 302
            </p>
          </div>

          {/* Interactive QR Scan Card */}
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="w-full aspect-4/3 rounded-lg bg-sky-50/50 hover:bg-sky-50 border border-dashed border-sky-300 flex flex-col items-center justify-center space-y-2.5 p-5 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="size-12 rounded-lg bg-white text-blue-600 border border-blue-200 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Camera className="size-6 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">
                Scan Projector QR Code
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Tap to launch focused camera scanner
              </p>
            </div>
          </button>

          {/* Primary Quick Actions */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleInstantCheckIn}
              disabled={loading || (result !== null && result.success)}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="size-3.5 text-blue-200" />
              <span>{loading ? 'Recording Presence…' : '1-Click Attendance Check-In'}</span>
            </button>

            <div className="text-center pt-0.5">
              <button
                type="button"
                onClick={() => setShowManual(!showManual)}
                className="text-[11px] text-stone-500 hover:text-stone-800 font-medium cursor-pointer transition-colors"
              >
                {showManual ? 'Hide manual token entry' : 'Or enter session token manually →'}
              </button>
            </div>

            {/* Manual Code Input */}
            {showManual && (
              <div className="flex gap-2 pt-1 animate-in fade-in">
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste 64-char token..."
                  className="flex-1 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-mono text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:bg-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleManualVerify}
                  disabled={loading || !tokenInput.trim()}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-40"
                >
                  Verify
                </button>
              </div>
            )}
          </div>

          {/* Verification Result Feedback */}
          {result && (
            <div
              className={`rounded-lg p-3.5 text-xs space-y-1 border animate-in fade-in text-left ${
                result.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  {result.success ? (
                    <CheckCircle2 className="size-4 text-emerald-700" />
                  ) : (
                    <AlertCircle className="size-4 text-rose-700" />
                  )}
                  <span>{result.success ? 'Attendance Verified' : 'Check-In Refused'}</span>
                </div>
                {result.timestamp && (
                  <span className="font-mono text-[10px] text-emerald-800 font-semibold bg-emerald-100/60 px-1.5 py-0.5 rounded">
                    {result.timestamp}
                  </span>
                )}
              </div>
              <p className="text-stone-600 text-[11px]">{result.message}</p>
            </div>
          )}

          {/* Footnote Navigation */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-100">
            <Link
              href="/student/timetable"
              className="text-blue-700 hover:text-blue-900 font-medium transition-colors"
            >
              Daily Schedule →
            </Link>
            <Link
              href="/student/attendance"
              className="hover:text-stone-700 transition-colors"
            >
              Attendance Records
            </Link>
          </div>
        </div>
      </div>

      {/* Minimalist Banking-Style Camera Scanner Modal */}
      <QRCodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        studentId={user?.studentProfileId || 's-1'}
        studentName={user?.name || 'Aarav Sharma'}
        onSuccess={(res) => {
          setResult({
            success: true,
            message: `Attendance verified successfully for ${res.subjectName || 'Operating Systems'}.`,
            timestamp: res.timestamp,
          });
        }}
      />
    </AppShell>
  );
}
