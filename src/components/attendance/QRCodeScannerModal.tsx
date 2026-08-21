'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Zap, ZapOff, RefreshCw, CameraOff, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { verifyAndRecordAttendance } from '@/lib/firebase/firestore';

interface QRCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  onSuccess?: (result: { subjectName?: string; timestamp?: string }) => void;
}

export default function QRCodeScannerModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  onSuccess,
}: QRCodeScannerModalProps) {
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasScannedRef = useRef(false);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (trackRef.current) {
      try {
        if (torchOn) {
          (trackRef.current as any).applyConstraints({ advanced: [{ torch: false }] });
        }
      } catch {}
      trackRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [torchOn]);

  const handleSuccessfulScan = useCallback(
    async (rawCode: string) => {
      if (hasScannedRef.current) return;
      hasScannedRef.current = true;
      setScanning(false);

      // Play soft confirmation feedback
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#0D2F6B', '#0284C7', '#10B981', '#38BDF8'],
        });
      } catch {}

      // Verify token in Firestore
      const res = await verifyAndRecordAttendance({
        token: rawCode,
        studentId,
        studentName,
        verificationMethod: 'QR_SCAN',
      });

      stopCamera();
      if (onSuccess) {
        onSuccess(res);
      }
      onClose();
    },
    [studentId, studentName, stopCamera, onSuccess, onClose]
  );

  const startCamera = useCallback(async () => {
    setErrorMsg(null);
    hasScannedRef.current = false;
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionState('denied');
        setErrorMsg('Camera API is not supported on this browser or device.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setPermissionState('granted');

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        trackRef.current = videoTrack;
        const capabilities: any = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
        if (capabilities.torch) {
          setHasTorch(true);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
      }

      // BarcodeDetector automatic scanning loop
      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        try {
          const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
          scanIntervalRef.current = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState >= 2 && !hasScannedRef.current) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0 && barcodes[0].rawValue) {
                  handleSuccessfulScan(barcodes[0].rawValue);
                }
              } catch {}
            }
          }, 200);
        } catch {}
      }
    } catch (err: any) {
      console.warn('Camera permission error:', err);
      setPermissionState('denied');
      setErrorMsg('Camera permission was denied. Please allow camera access to scan QR.');
    }
  }, [stopCamera, handleSuccessfulScan]);

  const toggleTorch = async () => {
    if (!trackRef.current || !hasTorch) return;
    try {
      const nextState = !torchOn;
      await (trackRef.current as any).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchOn(nextState);
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Crisp Professional Viewport */}
      <div className="relative w-full max-w-sm mx-4 aspect-3/4 rounded-xl overflow-hidden bg-stone-950 flex flex-col items-center justify-between p-5 shadow-2xl border border-stone-800">
        {/* Top Header: Close & Torch */}
        <div className="w-full flex items-center justify-between z-20">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-black/50 text-white/80 hover:text-white hover:bg-black/80 backdrop-blur-md transition-colors cursor-pointer border border-white/10"
            title="Close Scanner"
          >
            <X className="size-4.5" />
          </button>

          {hasTorch && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`p-2 rounded-lg backdrop-blur-md transition-colors cursor-pointer border ${
                torchOn ? 'bg-amber-400 text-black border-amber-300' : 'bg-black/50 text-white/80 hover:text-white border-white/10'
              }`}
              title="Toggle Flash"
            >
              {torchOn ? <Zap className="size-4.5" /> : <ZapOff className="size-4.5" />}
            </button>
          )}
        </div>

        {/* Live Camera Stream */}
        {permissionState === 'granted' && (
          <video
            ref={videoRef}
            className="absolute inset-0 size-full object-cover"
            autoPlay
            playsInline
            muted
          />
        )}

        {/* Minimal Centered Scanning Frame */}
        {permissionState === 'granted' && (
          <div className="relative size-52 sm:size-56 rounded-lg border border-white/30 flex items-center justify-center z-10 pointer-events-none">
            {/* 4 Fine Corner Reticle Brackets */}
            <div className="absolute -top-0.5 -left-0.5 size-4 border-t-2 border-l-2 border-white" />
            <div className="absolute -top-0.5 -right-0.5 size-4 border-t-2 border-r-2 border-white" />
            <div className="absolute -bottom-0.5 -left-0.5 size-4 border-b-2 border-l-2 border-white" />
            <div className="absolute -bottom-0.5 -right-0.5 size-4 border-b-2 border-r-2 border-white" />

            {/* Scanning Beam */}
            <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_10px_rgba(56,189,248,0.8)] animate-pulse" />
          </div>
        )}

        {/* Permission Denied / Error State */}
        {permissionState === 'denied' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-4 z-20">
            <div className="size-12 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <CameraOff className="size-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white font-bold text-sm">Camera Access Blocked</h4>
              <p className="text-xs text-stone-400 max-w-[220px] leading-relaxed">
                {errorMsg || 'Please allow camera permission in browser settings to scan attendance QR codes.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => startCamera()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-stone-900 text-xs font-bold shadow-md hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              <span>Retry Camera</span>
            </button>
          </div>
        )}

        {/* Bottom Minimal Instruction */}
        <div className="z-20 text-center pb-1">
          <p className="text-xs font-medium text-white/90 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/10">
            Scan attendance QR
          </p>
        </div>
      </div>
    </div>
  );
}
