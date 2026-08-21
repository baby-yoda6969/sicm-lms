'use client';

import React from 'react';

/** Left brand panel on the login page inspired by Concord design system. */
export function LoginBrandPanel() {
  return (
    <aside className="relative hidden w-[44%] items-center justify-center overflow-hidden lg:flex">
      {/* —— Custom background artwork —— */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {/* Deep Royal Navy & Midnight gradient */}
        <div className="absolute inset-0 bg-[linear-gradient(168deg,#0D2F6B_0%,#0A2352_46%,#061533_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(240,247,255,0.08)_0%,transparent_52%)]" />

        {/* Topographic contour field */}
        <svg
          className="absolute inset-0 size-full opacity-[0.11]"
          viewBox="0 0 560 760"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-20 180 C80 120, 160 220, 280 180 S480 100, 600 160"
            stroke="#f0f7ff"
            strokeWidth="1"
          />
          <path
            d="M-40 280 C100 220, 200 320, 320 270 S520 190, 640 250"
            stroke="#f0f7ff"
            strokeWidth="1"
          />
          <path
            d="M-10 380 C120 330, 220 420, 340 370 S500 290, 620 340"
            stroke="#f0f7ff"
            strokeWidth="1"
          />
          <path
            d="M0 480 C140 430, 240 520, 360 470 S520 390, 650 450"
            stroke="#f0f7ff"
            strokeWidth="1"
          />
          <path
            d="M20 580 C160 530, 260 610, 380 560 S540 490, 660 550"
            stroke="#f0f7ff"
            strokeWidth="1"
          />
          <path
            d="M40 680 C180 630, 280 700, 400 650 S560 580, 680 640"
            stroke="#f0f7ff"
            strokeWidth="0.75"
            opacity="0.7"
          />
        </svg>

        {/* Academic Astrolabe Arc — upper right */}
        <svg
          className="absolute -right-8 top-[12%] size-56 opacity-[0.08]"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="78" stroke="#f0f7ff" strokeWidth="1.5" strokeDasharray="3 9" />
          <circle cx="100" cy="100" r="54" stroke="#f0f7ff" strokeWidth="1" />
          <path d="M100 22 V46 M100 154 V178 M22 100 H46 M154 100 H178" stroke="#f0f7ff" strokeWidth="1" opacity="0.5" />
        </svg>

        {/* Flowing curve — lower left */}
        <svg
          className="absolute -bottom-6 -left-6 size-72 opacity-[0.08]"
          viewBox="0 0 200 200"
          fill="none"
        >
          <path
            d="M20 160 C60 120, 80 60, 130 40 C160 28, 185 45, 190 75"
            stroke="#f0f7ff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M30 170 C70 135, 95 85, 145 65"
            stroke="#f0f7ff"
            strokeWidth="1"
            opacity="0.55"
          />
          <circle cx="190" cy="75" r="4" fill="#f0f7ff" opacity="0.35" />
        </svg>

        {/* Sparse constellation nodes */}
        <svg
          className="absolute inset-0 size-full opacity-[0.09]"
          viewBox="0 0 560 760"
          preserveAspectRatio="xMidYMid slice"
        >
          {[
            [420, 120, 140, 200],
            [140, 200, 220, 280],
            [220, 280, 380, 240],
            [380, 240, 480, 360],
            [120, 420, 240, 500],
            [240, 500, 360, 440],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f0f7ff" strokeWidth="0.75" opacity="0.6" />
          ))}
          {[
            [420, 120],
            [140, 200],
            [220, 280],
            [380, 240],
            [480, 360],
            [120, 420],
            [240, 500],
            [360, 440],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2" fill="#f0f7ff" opacity="0.5" />
          ))}
        </svg>

        {/* Soft light pool behind the name */}
        <div className="absolute left-1/2 top-[42%] size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f0f7ff]/[0.05] blur-3xl" />
      </div>

      {/* —— Foreground: name is the hero —— */}
      <div className="relative z-10 flex flex-col items-center px-10 text-center text-[#f7faf9]">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 p-2 shadow-sm ring-1 ring-white/20 backdrop-blur-md">
          <img src="/logo.png" alt="SICM Emblem" className="h-full w-full object-contain" />
        </div>
        <h1 className="font-serif text-[clamp(4.5rem,8.5vw,6.75rem)] font-normal leading-[0.88] tracking-[-0.04em] text-white">
          SICM
        </h1>
        <p className="mt-6 text-[10px] font-light tracking-[0.32em] text-[#f7faf9]/40 uppercase font-cinzel">
          Academic Workspace • Jnanam Brahma
        </p>
      </div>

      {/* Supporting copy — quiet, bottom */}
      <div className="absolute bottom-12 left-0 right-0 z-10 px-12 text-center">
        <p className="mx-auto max-w-[17rem] text-[13px] font-normal leading-relaxed tracking-[-0.01em] text-[#f7faf9]/35">
          Timetable intelligence, verified attendance & faculty registry.
        </p>
        <p className="mt-4 text-[9px] font-light tracking-[0.24em] text-[#f7faf9]/25 uppercase font-cinzel">
          NAAC &lsquo;A&rsquo; Grade • Bengaluru City University
        </p>
      </div>
    </aside>
  );
}
