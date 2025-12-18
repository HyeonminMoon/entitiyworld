'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface TrainingAreaProps {
  onPointsChange: (points: number) => void;
  currentPoints: number;
}

interface ReactionCube {
  id: number;
  x: number;
  y: number;
}

export default function TrainingArea({ onPointsChange, currentPoints }: TrainingAreaProps) {
  const [clicks, setClicks] = useState(0);
  const [reactionCube, setReactionCube] = useState<ReactionCube | null>(null);
  const [showClickEffect, setShowClickEffect] = useState(false);
  const [clickEffectPos, setClickEffectPos] = useState({ x: 0, y: 0 });

  // 중앙 엔티티 클릭 핸들러
  const handleEntityClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // +1 Point 추가
    onPointsChange(currentPoints + 1);
    setClicks(prev => prev + 1);

    // 클릭 효과 표시
    const rect = e.currentTarget.getBoundingClientRect();
    setClickEffectPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setShowClickEffect(true);
    setTimeout(() => setShowClickEffect(false), 500);

    // 10% 확률로 리액션 큐브 생성
    if (Math.random() < 0.1 && !reactionCube) {
      spawnReactionCube();
    }
  };

  // 리액션 큐브 생성
  const spawnReactionCube = useCallback(() => {
    const x = Math.random() * 70 + 10; // 10% ~ 80% 범위
    const y = Math.random() * 70 + 10;
    
    setReactionCube({
      id: Date.now(),
      x,
      y,
    });

    // 1.5초 후 자동 소멸
    setTimeout(() => {
      setReactionCube(null);
    }, 1500);
  }, []);

  // 리액션 큐브 클릭 핸들러
  const handleCubeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reactionCube) {
      // +30 Point (Critical!)
      onPointsChange(currentPoints + 30);
      setReactionCube(null);
      
      // Critical 효과 표시
      alert('🎉 Critical! +30 Points!');
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 중앙 엔티티 영역 */}
      <div className="relative">
        <div
          onClick={handleEntityClick}
          className="w-[400px] h-[400px] bg-[#16213e] border-4 border-[#8b5cf6] rounded-2xl flex items-center justify-center cursor-pointer hover:border-[#a78bfa] hover:scale-105 transition-all relative overflow-hidden"
        >
          {/* 엔티티 이미지 플레이스홀더 */}
          <div className="text-center select-none">
            <div className="text-9xl mb-4 animate-bounce">🎮</div>
            <p className="text-white font-bold text-xl">클릭하여 훈련!</p>
            <p className="text-[#10b981] text-sm mt-2">클릭할 때마다 +1 Point</p>
          </div>

          {/* 클릭 효과 */}
          {showClickEffect && (
            <div
              className="absolute text-2xl font-bold text-[#10b981] animate-ping pointer-events-none"
              style={{
                left: clickEffectPos.x,
                top: clickEffectPos.y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              +1
            </div>
          )}

          {/* 리액션 큐브 */}
          {reactionCube && (
            <div
              onClick={handleCubeClick}
              className="absolute w-16 h-16 bg-gradient-to-br from-[#10b981] to-[#059669] border-4 border-white rounded-lg flex items-center justify-center cursor-pointer animate-pulse shadow-lg shadow-[#10b981]/50 hover:scale-110 transition-transform z-10"
              style={{
                left: `${reactionCube.x}%`,
                top: `${reactionCube.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className="text-3xl">💎</span>
            </div>
          )}
        </div>

        {/* 리액션 큐브 안내 */}
        {reactionCube && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-[#10b981] text-sm font-bold animate-bounce">
            ⚡ 빨리 클릭! +30 Points!
          </div>
        )}
      </div>

      {/* 훈련 통계 */}
      <div className="grid grid-cols-2 gap-4 w-[400px]">
        <div className="bg-[#16213e] border-2 border-[#8b5cf6]/30 rounded-lg p-4 text-center">
          <div className="text-[#10b981] text-sm mb-1">총 클릭 수</div>
          <div className="text-white font-bold text-2xl">{clicks}</div>
        </div>
        <div className="bg-[#16213e] border-2 border-[#8b5cf6]/30 rounded-lg p-4 text-center">
          <div className="text-[#10b981] text-sm mb-1">현재 포인트</div>
          <div className="text-white font-bold text-2xl">{currentPoints}</div>
        </div>
      </div>

      {/* 훈련 팁 */}
      <div className="bg-[#16213e]/50 border border-[#8b5cf6]/30 rounded-lg p-4 w-[400px]">
        <div className="text-[#8b5cf6] font-bold mb-2 flex items-center gap-2">
          💡 <span>훈련 팁</span>
        </div>
        <ul className="text-[#e5e7eb] text-sm space-y-1">
          <li>• 중앙을 클릭하면 +1 Point 획득</li>
          <li>• 가끔 나타나는 💎 큐브를 클릭하면 +30 Point!</li>
          <li>• 큐브는 1.5초만 유지되니 빠르게 클릭하세요</li>
        </ul>
      </div>
    </div>
  );
}
