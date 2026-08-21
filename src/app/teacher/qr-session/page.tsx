'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import {
  QrCode,
  RefreshCw,
  Clock,
  CheckCircle2,
  Users,
  Maximize2,
  Minimize2,
  Sparkles,
  MapPin,
  Calendar,
  Loader2,
  ShieldCheck,
  Compass,
  Radio,
  Sliders,
  Award,
} from 'lucide-react';
import { SICM_CAMPUS_COORDINATES, DEFAULT_GEOFENCE_RADIUS_METERS } from '@/lib/geoFence';

function QrSessionContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const paramTimetableId = searchParams.get('timetableId');
  const paramDate = searchParams.get('date');

  const [selectedDate, setSelectedDate] = useState<string>(paramDate || new Date().toISOString().split('T')[0]);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>(paramTimetableId || '');
  const [session, setSession] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrToken, setQrToken] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [liveCheckins, setLiveCheckins] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Geofence Settings
  const [geofenceRadius, setGeofenceRadius] = useState<number>(DEFAULT_GEOFENCE_RADIUS_METERS);
  const [geofenceEnabled, setGeofenceEnabled] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch available timetable slots for this date
  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        let url = `/api/timetable?date=${selectedDate}`;
        if (user?.teacherProfileId) {
          url += `&teacherId=${user.teacherProfileId}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.timetables && data.timetables.length > 0) {
          setTimetables(data.timetables);
          if (!selectedTimetableId || !data.timetables.some((t: any) => t.id === selectedTimetableId)) {
            setSelectedTimetableId(data.timetables[0].id);
          }
        } else {
          // Fallback: If no teacher-specific timetables, fetch all daily slots
          const fallbackRes = await fetch(`/api/timetable?date=${selectedDate}`);
          const fallbackData = await fallbackRes.json();
          if (fallbackData.timetables && fallbackData.timetables.length > 0) {
            setTimetables(fallbackData.timetables);
            setSelectedTimetableId(fallbackData.timetables[0].id);
          } else {
            setTimetables([]);
            setSelectedTimetableId('');
          }
        }
      } catch (err) {
        console.error('Error fetching timetables:', err);
      }
    };
    fetchTimetables();
  }, [user?.teacherProfileId, selectedDate, selectedTimetableId]);

  // 2. Generate new QR Token
  const generateQrToken = async (targetSessionId: string, radius = geofenceRadius) => {
    try {
      setLoading(true);
      const res = await fetch('/api/attendance/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          sessionId: targetSessionId,
          expirySeconds: 90,
          geofenceRadiusMeters: geofenceEnabled ? radius : 5000,
          coordinates: SICM_CAMPUS_COORDINATES,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQrDataUrl(data.qrDataUrl);
        setQrToken(data.token);
        setTimeLeft(90);
      }
    } catch (e) {
      console.error('Error generating QR token:', e);
    } finally {
      setLoading(false);
    }
  };

  // 3. Start or load session when timetable or date changes
  useEffect(() => {
    if (!selectedTimetableId) {
      setSession(null);
      setQrDataUrl('');
      return;
    }

    const startSession = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/attendance/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timetableId: selectedTimetableId,
            date: selectedDate,
          }),
        });
        const data = await res.json();
        if (data.session) {
          setSession(data.session);
          if (data.session.records) {
            setLiveCheckins(data.session.records);
          }
          await generateQrToken(data.session.id, geofenceRadius);
        }
      } catch (e) {
        console.error('Error starting session:', e);
      } finally {
        setLoading(false);
      }
    };

    startSession();
  }, [selectedTimetableId, selectedDate]);

  // 4. Rotate QR countdown timer
  useEffect(() => {
    if (!session || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          generateQrToken(session.id, geofenceRadius);
          return 90;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, timeLeft, geofenceRadius]);

  // 5. Poll live student check-ins every 3 seconds
  useEffect(() => {
    if (!session?.id) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/attendance/session?sessionId=${session.id}`);
        const data = await res.json();
        if (data.session?.records) {
          setLiveCheckins(data.session.records);
        }
      } catch (e) {
        console.error('Error polling session:', e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [session?.id]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const presentCount = liveCheckins.filter((r) => r.status === 'PRESENT').length;
  const totalCount = session?.totalStudents || 70;
  const progressPercent = Math.round((presentCount / totalCount) * 100);

  return (
    <div ref={containerRef} className="space-y-6 min-h-screen">
      {/* Unified Executive Projector Control Bar */}
      <div className="rounded-3xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-serif text-2xl font-extrabold text-stone-900 tracking-tight">
                Classroom Smart QR Projector
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-xs font-bold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Geofence Radar
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Dynamic rolling tokens with GPS perimeter validation ({SICM_CAMPUS_COORDINATES.latitude}° N, {SICM_CAMPUS_COORDINATES.longitude}° E). Off-campus scans are rejected.
            </p>
          </div>

          {/* Streamlined Control Group */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            {/* Timetable Slot Selector */}
            <select
              value={selectedTimetableId}
              onChange={(e) => setSelectedTimetableId(e.target.value)}
              className="rounded-2xl border border-stone-200 bg-stone-50/80 hover:bg-stone-100 px-3.5 py-2 text-xs font-bold text-stone-800 shadow-2xs focus:border-crimson-800 outline-none cursor-pointer max-w-xs"
            >
              {timetables.map((t) => (
                <option key={t.id} value={t.id}>
                  Period {t.timeSlot?.slotNumber || ''} • {t.subject?.code} ({t.section?.name})
                </option>
              ))}
            </select>

            {/* GPS Perimeter Selector */}
            <select
              value={geofenceRadius}
              onChange={(e) => setGeofenceRadius(Number(e.target.value))}
              className="rounded-2xl border border-stone-200 bg-stone-50/80 hover:bg-stone-100 px-3.5 py-2 text-xs font-bold text-stone-800 shadow-2xs focus:border-crimson-800 outline-none cursor-pointer"
              title="GPS Geofence Perimeter Radius"
            >
              <option value={50}>📍 50m (Classroom)</option>
              <option value={100}>📍 100m (Department Wing)</option>
              <option value={150}>📍 150m (SICM Main Campus)</option>
              <option value={300}>📍 300m (Expanded Campus)</option>
            </select>

            {/* Date Input */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-2xl border border-stone-200 bg-stone-50/80 px-3.5 py-2 text-xs font-bold text-stone-800 shadow-2xs focus:border-crimson-800 outline-none font-mono cursor-pointer"
            />

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-crimson-800 to-crimson-900 hover:from-crimson-900 hover:to-black text-white px-4 py-2 text-xs font-bold shadow-xs transition-all"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4 text-gold-400" />}
              <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Projection Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Projected QR Code View */}
        <div className="lg:col-span-7 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xl flex flex-col items-center justify-center text-center space-y-6">
          {/* Class Info Header with Official SICM Emblem */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-11 w-11 p-1 bg-white rounded-2xl shadow-xs ring-1 ring-stone-200 flex items-center justify-center">
                <img src="/logo.png" alt="SICM" className="h-full w-full object-contain" />
              </div>
              <div className="text-left">
                <span className="rounded-full bg-crimson-50 border border-crimson-200 px-3 py-0.5 text-xs font-bold text-crimson-900 inline-block">
                  {session?.section?.name || 'BCA 2nd Year'} • Room {session?.timetable?.room?.roomNumber || '102'}
                </span>
                <p className="text-[10px] font-cinzel text-gold-900 font-bold tracking-widest uppercase">
                  Seshadripuram Institute of Commerce & Management
                </p>
              </div>
            </div>
            <h2 className="font-serif text-2xl font-extrabold text-stone-900 mt-1">
              {session?.subject?.name || 'Database Management Systems'}
            </h2>
            <p className="text-xs text-stone-500 font-medium font-mono mt-0.5">
              Faculty: {user?.name || 'Dr. Pratibha Rao'} • {session?.timeSlot?.startTime || '08:30'} - {session?.timeSlot?.endTime || '09:20'}
            </p>
          </div>

          {/* High-Resolution QR Code Frame */}
          <div className="relative p-6 rounded-3xl bg-white shadow-2xl ring-8 ring-stone-100 border border-gold-400/40">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Dynamic Geofenced Attendance QR Code"
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-2xl"
              />
            ) : (
              <div className="w-64 h-64 sm:w-72 sm:h-72 flex flex-col items-center justify-center text-stone-400 space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-crimson-800" />
                <span className="text-xs font-medium">Generating Secure Dynamic Token...</span>
              </div>
            )}

            {/* Glowing Scan Target Ring */}
            <div className="absolute inset-0 rounded-3xl border-2 border-crimson-700/20 pointer-events-none animate-pulse" />
          </div>

          {/* Token Security Bar & Rotation Timer */}
          <div className="w-full max-w-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-stone-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-crimson-800" /> Auto-rotates in
              </span>
              <span className="font-mono text-crimson-800 text-sm font-extrabold">{timeLeft}s</span>
            </div>

            {/* Progress countdown bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full bg-gradient-to-r from-gold-500 via-crimson-700 to-crimson-900 transition-all duration-1000"
                style={{ width: `${(timeLeft / 90) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono pt-1">
              <span>Token: {qrToken ? `${qrToken.slice(0, 14)}...` : 'Active'}</span>
              <span>Geofence: ±{geofenceRadius}m</span>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live Checked-in Students Feed */}
        <div className="lg:col-span-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Live Counter Widget */}
            <div className="rounded-2xl bg-gradient-to-br from-parchment-50 to-stone-50 p-4 border border-stone-200/80">
              <div className="flex items-center justify-between">
                <span className="font-cinzel text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  Live Attendance Check-In
                </span>
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {progressPercent}% Present
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-serif text-4xl font-extrabold text-stone-900">{presentCount}</span>
                <span className="text-sm font-semibold text-stone-500 font-mono">/ {totalCount} Scholars</span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-700 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Live Scholar Ticker */}
            <div>
              <p className="font-serif font-bold text-xs text-stone-900 mb-2 flex items-center justify-between">
                <span>Verified Scholar Feed</span>
                <span className="text-[10px] text-stone-400 font-mono">Live Sync</span>
              </p>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-stone-100">
                {liveCheckins.length === 0 ? (
                  <div className="py-12 text-center text-xs text-stone-400 space-y-2">
                    <QrCode className="h-8 w-8 text-stone-300 mx-auto" />
                    <p>Awaiting scholar QR check-ins...</p>
                  </div>
                ) : (
                  liveCheckins.map((r: any) => (
                    <div key={r.id} className="pt-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          ✓
                        </div>
                        <div>
                          <p className="font-serif font-bold text-stone-900">{r.student?.user?.name || 'Scholar'}</p>
                          <p className="text-[10px] text-stone-500 font-mono">{r.student?.rollNumber}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-[10px] text-stone-500 block">
                          {r.markedAt ? new Date(r.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Verified'}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {r.method === 'QR_GEOFENCED' ? 'GPS Match' : 'QR Verified'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 text-center">
            <p className="text-[11px] text-stone-400 font-serif italic">
              Attendance records are cryptographically timestamped and committed to the SICM database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeacherQrSessionPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-12 text-center text-xs text-stone-400">Loading projector...</div>}>
        <QrSessionContent />
      </Suspense>
    </AppShell>
  );
}
