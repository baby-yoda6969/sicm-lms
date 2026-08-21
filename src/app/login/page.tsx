'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { LoginBrandPanel } from '@/components/login/LoginBrandPanel';
import { LoginPanelDecor } from '@/components/login/LoginPanelDecor';

const fieldClass =
  'h-10 w-full rounded-sm border border-stone-300/70 bg-white/50 px-3 text-sm text-stone-900 shadow-none transition-colors focus:border-[#0D2F6B] focus:bg-white focus:outline-none';

const selectClass =
  'h-10 w-full cursor-pointer appearance-none rounded-sm border border-stone-300/70 bg-white/50 px-3 pr-9 text-sm text-stone-900 transition-colors focus:border-[#0D2F6B] focus:bg-white focus:outline-none';

const DEMO_ACCOUNTS = [
  {
    label: 'Aarav Sharma — Student (BCA 2nd Year)',
    email: 'aarav.sharma@sicm.edu.in',
    password: 'student123',
    role: 'STUDENT' as const,
  },
  {
    label: 'Dr. Pratibha Rao — Faculty & Assoc. Prof',
    email: 'pratibha.rao@sicm.edu.in',
    password: 'teacher123',
    role: 'TEACHER' as const,
  },
  {
    label: 'Prof. Narayana S. — Academic Dean & Admin',
    email: 'admin@sicm.edu.in',
    password: 'admin123',
    role: 'ADMIN' as const,
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('aarav.sharma@sicm.edu.in');
  const [password, setPassword] = useState('student123');
  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleDemoSelect = (selectedEmail: string) => {
    const demo = DEMO_ACCOUNTS.find((d) => d.email === selectedEmail);
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
      setRole(demo.role);
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password, role);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    try {
      await login('aarav.sharma@sicm.edu.in', 'student123', 'STUDENT');
    } catch (err: any) {
      setError(err?.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Majestic Brand Panel (Concord Layout) */}
      <LoginBrandPanel />

      {/* Right Form Main Area */}
      <main className="relative flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <LoginPanelDecor />

        <div className="relative z-10 -mt-16 w-full max-w-[340px] lg:-translate-x-12">
          <p className="mb-6 font-serif text-xl font-normal tracking-tight text-stone-900 lg:hidden">
            SICM Academic
          </p>

          <h1 className="font-serif text-[clamp(2.375rem,4.5vw,2.75rem)] font-normal leading-tight tracking-tight text-stone-900">
            Sign in
          </h1>
          <span aria-hidden className="mb-6 mt-4 block h-px w-full bg-stone-200" />

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-normal text-stone-600 block">
                Email or Academic Identifier
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                className={fieldClass}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-normal text-stone-600 block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotModal(true);
                    setForgotSent(false);
                  }}
                  className="text-[11px] font-normal text-stone-500 hover:text-[#0D2F6B] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className={`${fieldClass} pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 h-10 w-full rounded-sm bg-[#0D2F6B] hover:bg-[#0A2352] text-white text-sm font-normal transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? <span>Signing in…</span> : <span>Continue</span>}
            </button>

            {/* Demo Account Dropdown (Concord style) */}
            <div className="space-y-1.5 pt-2">
              <label htmlFor="demo-user" className="text-xs font-normal text-stone-500 block">
                Demo account
              </label>
              <div className="relative">
                <select
                  id="demo-user"
                  value={email}
                  onChange={(e) => handleDemoSelect(e.target.value)}
                  className={selectClass}
                >
                  {DEMO_ACCOUNTS.map((d) => (
                    <option key={d.email} value={d.email}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden
                  className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-stone-400"
                />
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <h3 className="font-serif font-bold text-stone-900 text-base">Reset Password</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Enter your registered academic email address to receive password reset instructions.
            </p>
            {forgotSent ? (
              <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold">
                ✓ Reset link dispatched to {forgotEmail}. Please check your inbox.
              </div>
            ) : (
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@sicm.edu.in"
                className="w-full rounded-sm border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-900 outline-none focus:border-[#0D2F6B]"
              />
            )}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setForgotModal(false)}
                className="flex-1 py-2 rounded-sm border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                Close
              </button>
              {!forgotSent && (
                <button
                  type="button"
                  onClick={() => setForgotSent(true)}
                  className="flex-1 py-2 rounded-sm bg-[#0D2F6B] text-white text-xs font-medium hover:bg-[#0A2352]"
                >
                  Send link
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
