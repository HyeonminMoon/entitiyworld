'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useGame();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push('/');
    }
  }, [user, router]);

  // 로그인 확인 중일 때 로딩 표시
  if (user === null) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-white text-2xl">로그인이 필요합니다...</div>
      </div>
    );
  }

  return <>{children}</>;
}
