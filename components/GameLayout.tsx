'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ArchivePanel from '@/components/ArchivePanel';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-[#1a1a2e]">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          {children}
          <ArchivePanel />
        </div>
      </div>
    </ProtectedRoute>
  );
}
