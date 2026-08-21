'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Clock, Users, ShieldCheck, RefreshCw } from 'lucide-react';
import { createAttendanceSession, AttendanceSession } from '@/lib/firebase/firestore';

interface QRCodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  timetableSlotId: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  sectionName: string;
}

export default function QRCodeGeneratorModal({
  isOpen,
  onClose,
  timetableSlotId,
  subjectId,
  subjectName,
  teacherId,
  sectionName,
}: QRCodeGeneratorModalProps) {
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(300); // 5 mins
  const [checkedInCount, setCheckedInCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const initSession = async () => {
    try {
      setLoading(true);
      const newSession = await createAttendanceSession({
        timetableSlotId,
        subjectId,
        subjectName,
        teacherId,
        sectionName,
        durationMinutes: 5,
      });

      setSession(newSession);
      setTimeLeftSeconds(300);
      setCheckedInCount(0);

      // Generate QR Canvas Data URL
      const url = await QRCode.toDataURL(newSession.token, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('Failed to create attendance session', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      initSession();
    }
  }, [isOpen, timetableSlotId]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeftSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeftSeconds]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isExpired = timeLeftSeconds === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl border border-stone-200 p-6 max-w-sm w-full shadow-2xl space-y-5 text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Live Session QR
            </span>
            <h3 className="font-bold text-stone-900 text-sm mt-1">{subjectName}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* QR Code Canvas */}
        <div className="relative size-60 mx-auto rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center p-3 shadow-inner">
          {loading ? (
            <div className="space-y-2 text-stone-400">
              <RefreshCw className="size-6 animate-spin mx-auto text-blue-600" />
              <p className="text-xs">Generating secure token…</p>
            </div>
          ) : isExpired ? (
            <div className="space-y-2 p-4 text-center">
              <Clock className="size-8 text-rose-500 mx-auto" />
              <p className="text-xs font-bold text-stone-800">QR Code Expired</p>
              <button
                type="button"
                onClick={initSession}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                Generate New QR
              </button>
            </div>
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Attendance QR"
              className="size-full object-contain rounded shadow-xs"
            />
          ) : null}
        </div>

        {/* Countdown & Live Ticker */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-stone-50 p-3 border border-stone-100 space-y-0.5">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
              Time Remaining
            </span>
            <p
              className={`font-mono font-bold text-base ${
                timeLeftSeconds < 60 ? 'text-rose-600' : 'text-stone-900'
              }`}
            >
              {timeFormatted}
            </p>
          </div>

          <div className="rounded-lg bg-blue-50/60 p-3 border border-blue-100 space-y-0.5">
            <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">
              Checked In
            </span>
            <p className="font-mono font-bold text-base text-blue-900 flex items-center justify-center gap-1">
              <Users className="size-3.5 text-blue-600" />
              {checkedInCount} / 45
            </p>
          </div>
        </div>

        {/* Refresh Action */}
        <button
          type="button"
          onClick={initSession}
          disabled={loading}
          className="w-full py-2.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Session Token</span>
        </button>
      </div>
    </div>
  );
}
