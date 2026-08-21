'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

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
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('Failed to fetch session', e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (identifier: string, pass: string, role?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: pass, role }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchUser();
        // Redirect to role portal
        const targetRole = data.user.role;
        if (targetRole === 'ADMIN') router.push('/admin');
        else if (targetRole === 'TEACHER') router.push('/teacher');
        else router.push('/student');
        return true;
      }
      alert(data.error || 'Login failed');
      return false;
    } catch (err: any) {
      alert(err.message || 'Error connecting to server');
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  const switchDemoUser = async (role: 'ADMIN' | 'TEACHER' | 'STUDENT') => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/switch-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        await fetchUser();
        if (role === 'ADMIN') router.push('/admin');
        else if (role === 'TEACHER') router.push('/teacher');
        else router.push('/student');
      }
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
