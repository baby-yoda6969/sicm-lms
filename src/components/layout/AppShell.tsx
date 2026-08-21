'use client';

import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';
import { useAuth } from '@/context/AuthContext';
import { SidebarProvider } from '@/context/SidebarContext';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Loading SICM Academic System..." />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#FBFBF9] flex flex-col text-stone-900 selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto overflow-x-hidden transition-all duration-300">
            {children}
          </main>
        </div>
        <MobileNavigation />
      </div>
    </SidebarProvider>
  );
}
