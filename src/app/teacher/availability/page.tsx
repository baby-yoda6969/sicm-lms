'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { safeFetchJson } from '@/lib/apiHelper';

export default function TeacherAvailabilityPage() {
  const { user } = useAuth();
  const [timeSlots, setTimeSlots] = useState<any[]>([
    { id: 'ts-1', slotNumber: 1, name: 'Period 1', startTime: '08:30 AM', endTime: '09:30 AM' },
    { id: 'ts-2', slotNumber: 2, name: 'Period 2', startTime: '09:30 AM', endTime: '10:30 AM' },
    { id: 'ts-3', slotNumber: 3, name: 'Period 3', startTime: '10:45 AM', endTime: '11:45 AM' },
    { id: 'ts-4', slotNumber: 4, name: 'Period 4', startTime: '11:45 AM', endTime: '12:45 PM' },
    { id: 'ts-5', slotNumber: 5, name: 'Period 5', startTime: '01:15 PM', endTime: '02:15 PM' },
    { id: 'ts-6', slotNumber: 6, name: 'Period 6', startTime: '02:15 PM', endTime: '03:15 PM' },
  ]);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, string>>({}); // key: `${day}_${slotId}` -> 'AVAILABLE' | 'UNAVAILABLE' | 'PARTIAL'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const { ok, data } = await safeFetchJson(
          `/api/teacher/availability?teacherId=${user?.teacherProfileId || 't-1'}`,
          undefined,
          {
            timeSlots: [
              { id: 'ts-1', slotNumber: 1, name: 'Period 1', startTime: '08:30 AM', endTime: '09:30 AM' },
              { id: 'ts-2', slotNumber: 2, name: 'Period 2', startTime: '09:30 AM', endTime: '10:30 AM' },
              { id: 'ts-3', slotNumber: 3, name: 'Period 3', startTime: '10:45 AM', endTime: '11:45 AM' },
              { id: 'ts-4', slotNumber: 4, name: 'Period 4', startTime: '11:45 AM', endTime: '12:45 PM' },
              { id: 'ts-5', slotNumber: 5, name: 'Period 5', startTime: '01:15 PM', endTime: '02:15 PM' },
              { id: 'ts-6', slotNumber: 6, name: 'Period 6', startTime: '02:15 PM', endTime: '03:15 PM' },
            ],
            availabilities: [],
          }
        );

        if (data?.timeSlots) {
          setTimeSlots(data.timeSlots);
        }

        const map: Record<string, string> = {};
        data?.availabilities?.forEach((a: any) => {
          map[`${a.dayOfWeek}_${a.timeSlotId}`] = a.status;
        });
        setAvailabilityMap(map);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [user?.teacherProfileId]);

  // Cycle status: AVAILABLE -> UNAVAILABLE -> PARTIAL -> AVAILABLE
  const handleToggleSlot = (day: string, slotId: string) => {
    const key = `${day}_${slotId}`;
    const current = availabilityMap[key] || 'AVAILABLE';
    let next = 'UNAVAILABLE';
    if (current === 'UNAVAILABLE') next = 'PARTIAL';
    else if (current === 'PARTIAL') next = 'AVAILABLE';

    setAvailabilityMap((prev) => ({
      ...prev,
      [key]: next,
    }));
  };

  // Bulk Day setter
  const setDayStatus = (day: string, status: string) => {
    const updates: Record<string, string> = {};
    timeSlots.forEach((slot) => {
      updates[`${day}_${slot.id}`] = status;
    });
    setAvailabilityMap((prev) => ({ ...prev, ...updates }));
  };

  // Save Preferences
  const handleSave = async () => {
    if (!user?.teacherProfileId) return;
    try {
      setSaving(true);
      const updates = [];
      for (const day of days) {
        for (const slot of timeSlots) {
          const key = `${day}_${slot.id}`;
          updates.push({
            dayOfWeek: day,
            timeSlotId: slot.id,
            status: availabilityMap[key] || 'AVAILABLE',
          });
        }
      }

      const res = await fetch('/api/teacher/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: user.teacherProfileId,
          updates,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Faculty Weekly Availability Matrix
              </h1>
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                Scheduling Preferences
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Specify your teaching time preferences. The Smart Timetable Engine strictly respects these constraints.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-sicm-800 hover:bg-sicm-900 text-white font-bold px-5 py-2.5 text-xs uppercase tracking-wider shadow-md shadow-sicm-900/20 transition-all hover:scale-105"
          >
            <Save className="h-4 w-4 text-amber-400" />
            {saving ? 'Saving...' : 'Save Availability Preferences'}
          </button>
        </div>

        {/* Informational Guidance Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs">
            <span className="font-bold text-slate-700">Legend (Click slot to toggle):</span>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="font-semibold text-emerald-800">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500" />
              <span className="font-semibold text-rose-800">Not Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="font-semibold text-amber-800">Partial / Preferred Off</span>
            </div>
          </div>

          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Preferences saved!
            </span>
          )}
        </div>

        {/* Availability Grid */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="p-3 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider w-36 border-r border-slate-200">
                    Day / Controls
                  </th>
                  {timeSlots.map((slot) => (
                    <th
                      key={slot.id}
                      className="p-3 text-center text-xs font-extrabold text-slate-800 border-r border-slate-200 last:border-r-0"
                    >
                      <div>{slot.name.split(' (')[0]}</div>
                      <div className="text-[10px] font-normal text-slate-400">
                        {slot.startTime} - {slot.endTime}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {days.map((day) => (
                  <tr key={day} className="hover:bg-slate-50/40">
                    {/* Day label and quick setters */}
                    <td className="p-3 border-r border-slate-200 bg-slate-50/50">
                      <p className="font-extrabold text-xs text-slate-900">{day}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          onClick={() => setDayStatus(day, 'AVAILABLE')}
                          className="text-[9px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded font-bold"
                        >
                          All Free
                        </button>
                        <button
                          onClick={() => setDayStatus(day, 'UNAVAILABLE')}
                          className="text-[9px] text-rose-700 bg-rose-50 hover:bg-rose-100 px-1.5 py-0.5 rounded font-bold"
                        >
                          All Busy
                        </button>
                      </div>
                    </td>

                    {/* Slots */}
                    {timeSlots.map((slot) => {
                      const key = `${day}_${slot.id}`;
                      const status = availabilityMap[key] || 'AVAILABLE';

                      return (
                        <td
                          key={slot.id}
                          className="p-2 border-r border-slate-200 last:border-r-0 text-center"
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleSlot(day, slot.id)}
                            className={`w-full py-3 px-2 rounded-xl text-xs font-extrabold transition-all border shadow-2xs hover:scale-105 ${
                              status === 'AVAILABLE'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : status === 'UNAVAILABLE'
                                ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              {status === 'AVAILABLE' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                              {status === 'UNAVAILABLE' && <XCircle className="h-3.5 w-3.5 text-rose-600" />}
                              {status === 'PARTIAL' && <AlertCircle className="h-3.5 w-3.5 text-amber-600" />}
                              <span>{status}</span>
                            </div>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
