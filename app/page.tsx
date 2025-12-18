'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import ArchivePanel from '@/components/ArchivePanel';

export default function Home() {
  const [activeMenu, setActiveMenu] = useState('training');
  const [points, setPoints] = useState(100);

  const handlePointsChange = (newPoints: number) => {
    setPoints(newPoints);
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col">
      {/* 헤더 */}
      <Header points={points} />

      {/* 메인 콘텐츠 영역 (3단 레이아웃) */}
      <div className="flex flex-1 overflow-hidden">
        {/* 왼쪽: 메뉴 */}
        <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

        {/* 중앙: 메인 플레이 영역 */}
        <MainContent 
          activeMenu={activeMenu} 
          points={points}
          onPointsChange={handlePointsChange}
        />

        {/* 오른쪽: 도감/가방 */}
        <ArchivePanel />
      </div>
    </div>
  );
}
