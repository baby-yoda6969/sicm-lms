'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        if (user.role === 'ADMIN') router.push('/admin');
        else if (user.role === 'TEACHER') router.push('/teacher');
        else router.push('/student');
      }
    }
  }, [user, loading, router]);

  return <LoadingScreen message="Entering SICM Collegiate Portal..." />;
}
