'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { safeFetchJson } from '@/lib/apiHelper';

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  avatar?: string | null;
  teacherProfileId?: string;
  studentProfileId?: string;
  rollNumber?: string;
  employeeCode?: string;
  departmentName?: string;
  sectionName?: string;
  semesterNumber?: number;
  programCode?: string;
}

const DEFAULT_DEMO_USERS: { [key: string]: UserSession } = {
  STUDENT: {
    userId: 'u-student-1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@sicm.edu.in',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=95',
    studentProfileId: 's-1',
    rollNumber: '22BCA001',
    sectionName: 'BCA 2nd Year',
    programCode: 'BCA',
    semesterNumber: 4,
  },
  TEACHER: {
    userId: 'u-teacher-1',
    name: 'Dr. Pratibha Rao',
    email: 'pratibha.rao@sicm.edu.in',
    role: 'TEACHER',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=95',
    teacherProfileId: 't-1',
    employeeCode: 'EMP101',
    departmentName: 'Computer Applications',
  },
  ADMIN: {
    userId: 'u-admin-1',
    name: 'Prof. Narayana S.',
    email: 'admin@sicm.edu.in',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=95',
  },
};

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (identifier: string, pass: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchDemoUser: (role: 'ADMIN' | 'TEACHER' | 'STUDENT') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      setLoading(true);

      // 1. Check client localStorage first for instant hydration
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('sicm_current_user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.role) {
              setUser(parsed);
              setLoading(false);
              return;
            }
          } catch {}
        }
      }

      // 2. Try API endpoint if on a full-stack server
      const { ok, data } = await safeFetchJson('/api/auth/me');
      if (ok && data?.user) {
        setUser(data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sicm_current_user', JSON.stringify(data.user));
        }
      } else {
        // Fallback default demo user (Student)
        const defaultUser = DEFAULT_DEMO_USERS.STUDENT;
        setUser(defaultUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sicm_current_user', JSON.stringify(defaultUser));
        }
      }
    } catch (e) {
      console.warn('Fallback to student demo session', e);
      setUser(DEFAULT_DEMO_USERS.STUDENT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (identifier: string, pass: string, role?: string): Promise<boolean> => {
    try {
      // 1. Try server API login
      const { ok, data } = await safeFetchJson(
        '/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password: pass, role }),
        },
        null
      );

      if (ok && data?.success && data?.user) {
        setUser(data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sicm_current_user', JSON.stringify(data.user));
        }
        const targetRole = data.user.role;
        if (targetRole === 'ADMIN') router.push('/admin');
        else if (targetRole === 'TEACHER') router.push('/teacher');
        else router.push('/student');
        return true;
      }

      // 2. Client-side authentication fallback (for GitHub Pages / Static Hosting)
      let resolvedUser: UserSession = DEFAULT_DEMO_USERS.STUDENT;
      const lower = identifier.toLowerCase();

      if (lower.includes('admin') || role === 'ADMIN') {
        resolvedUser = DEFAULT_DEMO_USERS.ADMIN;
      } else if (lower.includes('pratibha') || lower.includes('teacher') || role === 'TEACHER') {
        resolvedUser = DEFAULT_DEMO_USERS.TEACHER;
      } else {
        resolvedUser = DEFAULT_DEMO_USERS.STUDENT;
      }

      setUser(resolvedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('sicm_current_user', JSON.stringify(resolvedUser));
      }

      if (resolvedUser.role === 'ADMIN') router.push('/admin');
      else if (resolvedUser.role === 'TEACHER') router.push('/teacher');
      else router.push('/student');
      return true;
    } catch (err: any) {
      console.warn('Client fallback login engaged', err);
      const defaultUser = DEFAULT_DEMO_USERS.STUDENT;
      setUser(defaultUser);
      router.push('/student');
      return true;
    }
  };

  const logout = async () => {
    try {
      await safeFetchJson('/api/auth/logout', { method: 'POST' });
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sicm_current_user');
    }
    setUser(null);
    router.push('/login');
  };

  const switchDemoUser = async (targetRole: 'ADMIN' | 'TEACHER' | 'STUDENT') => {
    try {
      setLoading(true);
      const newUser = DEFAULT_DEMO_USERS[targetRole] || DEFAULT_DEMO_USERS.STUDENT;
      setUser(newUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('sicm_current_user', JSON.stringify(newUser));
      }

      // Sync with server if available
      try {
        await safeFetchJson('/api/auth/switch-demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: targetRole }),
        });
      } catch {}

      if (targetRole === 'ADMIN') router.push('/admin');
      else if (targetRole === 'TEACHER') router.push('/teacher');
      else router.push('/student');
    } catch (e) {
      console.error('Switch error', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        switchDemoUser,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
