'use client';

import React, { useState, useRef, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Award,
  Camera,
  Upload,
  X,
  SwitchCamera,
  Check,
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=95',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=95',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=95',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=95',
];

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [currentAvatar, setCurrentAvatar] = useState<string>(
    user?.avatar ||
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=95'
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API is not supported on this browser/device.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError('Camera access denied. Please upload a photo instead.');
      setCameraActive(false);
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    if (cameraActive) {
      startCamera(nextMode);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 400;
    canvas.height = videoRef.current.videoHeight || 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCurrentAvatar(dataUrl);
      stopCamera();
      setModalOpen(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setCurrentAvatar(reader.result as string);
          setModalOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloseModal = () => {
    stopCamera();
    setModalOpen(false);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-5 py-2">
        {/* Profile Card */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-5 border-b border-stone-100">
            {/* Interactive Avatar */}
            <div className="relative group self-start sm:self-center">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(true);
                  startCamera();
                }}
                className="relative block size-20 rounded-lg overflow-hidden ring-2 ring-blue-100 hover:ring-blue-300 transition-all shadow-xs cursor-pointer group"
                title="Click to update photo with camera"
              >
                <img
                  src={currentAvatar}
                  alt="Avatar"
                  className="size-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-blue-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                  <Camera className="size-5 text-white" />
                  <span className="text-[9px] font-bold">Edit</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalOpen(true);
                  startCamera();
                }}
                className="absolute -bottom-1 -right-1 size-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xs border-2 border-white transition-transform hover:scale-110 cursor-pointer"
                title="Open Camera / Update Photo"
              >
                <Camera className="size-3.5" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                  {user?.name || 'Aarav Sharma'}
                </h1>
                <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                  Collegiate Scholar
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1 font-medium">
                Student ID: <span className="font-mono font-semibold text-stone-800">U18CM21S0001</span> • Roll No:{' '}
                <span className="font-mono font-semibold text-stone-800">22BCA001</span>
              </p>
              <p className="text-xs text-blue-700 font-bold mt-1">
                Bachelor of Computer Applications (BCA) - 2nd Year
              </p>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-stone-50 p-3.5 border border-stone-100 space-y-1">
              <span className="font-bold text-stone-400 uppercase tracking-wider text-[9px]">Academic Email</span>
              <p className="font-semibold text-stone-900 flex items-center gap-1.5 font-mono text-[11px]">
                <Mail className="size-3.5 text-stone-400" />
                {user?.email || 'aarav.sharma@sicm.edu.in'}
              </p>
            </div>

            <div className="rounded-lg bg-stone-50 p-3.5 border border-stone-100 space-y-1">
              <span className="font-bold text-stone-400 uppercase tracking-wider text-[9px]">Contact Number</span>
              <p className="font-semibold text-stone-900 flex items-center gap-1.5 font-mono text-[11px]">
                <Phone className="size-3.5 text-stone-400" />
                +91 99000 48291
              </p>
            </div>

            <div className="rounded-lg bg-stone-50 p-3.5 border border-stone-100 space-y-1">
              <span className="font-bold text-stone-400 uppercase tracking-wider text-[9px]">Department Faculty</span>
              <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                <Building className="size-3.5 text-stone-400" />
                Faculty of Computer Applications
              </p>
            </div>

            <div className="rounded-lg bg-stone-50 p-3.5 border border-stone-100 space-y-1">
              <span className="font-bold text-stone-400 uppercase tracking-wider text-[9px]">Collegiate Cohort</span>
              <p className="font-semibold text-stone-900 flex items-center gap-1.5 font-mono text-[11px]">
                <Calendar className="size-3.5 text-stone-400" />
                2024 - 2027 (Undergraduate)
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50/50 border border-blue-200/80 p-3.5 text-xs text-stone-900 flex items-start gap-3">
            <Award className="size-4.5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-stone-950">Institutional Academic Standing</h4>
              <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                Registered under Bangalore City University collegiate curriculum at Seshadripuram Institute of Commerce and Management.
              </p>
            </div>
          </div>
        </div>

        {/* Live Camera & Avatar Update Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-xl border border-stone-200 p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Camera className="size-3.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Update Profile Photo</h3>
                    <p className="text-[11px] text-stone-500">Take a live snapshot or upload photo</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Live Camera Viewfinder */}
              {cameraActive ? (
                <div className="space-y-3">
                  <div className="relative size-52 mx-auto rounded-lg overflow-hidden bg-stone-950 border border-blue-300 shadow-inner flex items-center justify-center">
                    <video
                      ref={videoRef}
                      className="absolute inset-0 size-full object-cover transform-gpu"
                      autoPlay
                      playsInline
                      muted
                    />
                    <div className="relative size-36 rounded-full border border-dashed border-white/60 pointer-events-none" />
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={toggleFacingMode}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
                    >
                      <SwitchCamera className="size-3.5" />
                      <span>Flip</span>
                    </button>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <Camera className="size-3.5" />
                      <span>Capture Photo</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {cameraError && (
                    <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 text-center font-medium">
                      {cameraError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="size-4" />
                    <span>Open Live Camera</span>
                  </button>
                </div>
              )}

              {/* Upload Photo Option */}
              <div className="pt-2 border-t border-stone-100 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Upload className="size-3.5 text-stone-500" />
                  <span>Upload from Device</span>
                </button>

                {/* Preset Avatars */}
                <div>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5 text-center">
                    Or choose collegiate avatar
                  </span>
                  <div className="flex items-center justify-center gap-2.5">
                    {PRESET_AVATARS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCurrentAvatar(av);
                          setModalOpen(false);
                        }}
                        className={`size-10 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer ${
                          currentAvatar === av ? 'border-blue-600 ring-1 ring-blue-200' : 'border-stone-200'
                        }`}
                      >
                        <img src={av} alt="Preset" className="size-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
