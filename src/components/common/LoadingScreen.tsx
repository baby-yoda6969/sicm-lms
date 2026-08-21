'use client';

import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex h-screen w-full flex-col items-center justify-center bg-[#FBFBF9] selection:bg-blue-100 selection:text-blue-900">
      {/* Centered 3D Vector Spinning SICM Logo */}
      <div className="relative flex flex-col items-center justify-center">
        {/* 3D Rotating Logo Container */}
        <div
          className="relative size-20 sm:size-24 flex items-center justify-center transform-gpu"
          style={{
            perspective: '800px',
          }}
        >
          <div
            className="size-full flex items-center justify-center animate-[spin3d_2.4s_cubic-bezier(0.4,0,0.2,1)_infinite]"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            <img
              src="/logo.png"
              alt="SICM Logo"
              className="size-full object-contain filter drop-shadow-md select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Subtle Dynamic Shadow Underneath */}
        <div className="mt-4 h-1.5 w-12 rounded-full bg-stone-300/60 blur-xs animate-[shadowPulse_2.4s_cubic-bezier(0.4,0,0.2,1)_infinite]" />

        {/* Optional Minimalist Subtitle if message provided */}
        {message && (
          <p className="mt-4 text-[11px] font-semibold text-stone-400 tracking-wider uppercase">
            {message}
          </p>
        )}
      </div>

      {/* Embedded 3D Keyframe Animations */}
      <style jsx>{`
        @keyframes spin3d {
          0% {
            transform: rotateY(0deg) scale(1);
          }
          50% {
            transform: rotateY(180deg) scale(0.92);
          }
          100% {
            transform: rotateY(360deg) scale(1);
          }
        }
        @keyframes shadowPulse {
          0%,
          100% {
            transform: scaleX(1);
            opacity: 0.6;
          }
          50% {
            transform: scaleX(0.5);
            opacity: 0.25;
          }
        }
      `}</style>
    </div>
  );
}
