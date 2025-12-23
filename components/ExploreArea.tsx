'use client';

import { useState } from 'react';
import { Map } from '@/types/entity';
import { MAPS } from '@/data/maps';
import Image from 'next/image';
import { getBackgroundImageUrl } from '@/lib/imageUtils';

interface ExploreAreaProps {
  discoveredCount: number;
  totalEntities: number;
  onMapSelect: (mapId: string) => void;
}

export default function ExploreArea({ discoveredCount, totalEntities, onMapSelect }: ExploreAreaProps) {
  const [hoveredMap, setHoveredMap] = useState<string | null>(null);
  
  // 도감 진행률
  const completionRate = Math.floor((discoveredCount / totalEntities) * 100);

  // 맵 위치 정의 (레벨 순서)
  const mapPositions = [
    { map: MAPS[0], top: 710, left: 1280, icon: '💧' }, // Water (Lv 1-10)
    { map: MAPS[1], top: 360, left: 1420, icon: '🔥' }, // Fire (Lv 11-20)
    { map: MAPS[2], top: 360, left: 640, icon: '🌲' }, // Forest (Lv 21-30)
    { map: MAPS[3], top: 710, right: 1100, icon: '⚡' }, // Electric (Lv 31-40)
    { map: MAPS[4], top: 180, left: 1020, icon: '🪨' }, // Stone (Lv 41-50)
    { map: MAPS[5], top: 460, left: 1020, icon: '🌀' }, // Chaos (Lv 1-52)
  ];

  return (
    <div className="flex flex-col w-full h-full overflow-auto">
      {/* 월드맵 + 마을 버튼 - 전체 화면 */}
      <div className="relative w-[2000px] h-[1000px] border-4 border-[#8b5cf6] rounded-2xl overflow-hidden">
        {/* 대체 배경 (기본 배경) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] z-0" />
        
        {/* 배경 이미지 */}
        <div className="absolute inset-0 z-0">
          <Image
            src={getBackgroundImageUrl('background/field.jpg')}
            alt="World Map"
            fill
            className="object-cover object-left"
            priority
            unoptimized
            onError={(e) => {
              const imageUrl = getBackgroundImageUrl('background/field.jpg');
              console.error('배경 이미지 로드 실패:', imageUrl);
              console.error('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* 마을 버튼들 */}
        {mapPositions.map(({ map, top, left, right, icon }) => {
          const isLocked = map.unlock_requirement > completionRate;
          const position: any = { position: 'absolute', zIndex: 10 };
          if (top) position.top = top;
          if (left) position.left = left;
          if (right) position.right = right;

          return (
            <button
              key={map.id}
              style={position}
              disabled={isLocked}
              onClick={() => onMapSelect(map.id)}
              onMouseEnter={() => setHoveredMap(map.id)}
              onMouseLeave={() => setHoveredMap(null)}
              className={`
                transform -translate-x-1/2 -translate-y-1/2
                px-4 py-3 rounded-xl
                bg-[#16213e]/90 backdrop-blur-sm
                border-2 transition-all duration-200
                ${isLocked 
                  ? 'border-gray-600 opacity-50 cursor-not-allowed' 
                  : 'border-[#8b5cf6] hover:scale-110 hover:shadow-2xl hover:shadow-[#8b5cf6]/50 cursor-pointer'
                }
                ${hoveredMap === map.id ? 'scale-110 shadow-2xl' : ''}
              `}
            >
              <div className="flex flex-col items-center gap-1 min-w-[100px]">
                <div className="text-3xl">{isLocked ? '🔒' : icon}</div>
                <div className={`text-sm font-bold ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                  {map.display_name}
                </div>
                {isLocked && (
                  <div className="text-[10px] text-gray-400">
                    {map.unlock_requirement}% 필요
                  </div>
                )}
                {!isLocked && (
                  <div className="text-[10px] text-[#10b981]">
                    Lv {map.entity_id_range[0]}-{map.entity_id_range[1]}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
