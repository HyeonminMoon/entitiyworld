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

  // 맵 위치 정의 (이미지 기준 퍼센트)
  const mapPositions = [
    { map: MAPS[0], top: '35%', left: '75%', icon: '💧' }, // Water (오른쪽 아래)
    { map: MAPS[1], top: '15%', right: '15%', icon: '🔥' }, // Fire (오른쪽 위)
    { map: MAPS[2], top: '25%', left: '15%', icon: '🌲' }, // Forest (왼쪽 위)
    { map: MAPS[3], bottom: '25%', left: '20%', icon: '⚡' }, // Electric (왼쪽 아래)
    { map: MAPS[4], top: '18%', left: '45%', icon: '🪨' }, // Stone (위쪽 중앙)
    { map: MAPS[5], top: '45%', left: '48%', icon: '🌀' }, // Chaos (중앙)
  ];

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full">
      {/* 진행률 표시 */}
      <div className="w-full bg-[#16213e] border-2 border-[#8b5cf6]/30 rounded-lg p-4 flex justify-between items-center">
        <div>
          <h3 className="text-white font-bold text-lg">🗺️ 월드 탐색</h3>
          <p className="text-[#e5e7eb] text-sm">마을을 선택하여 엔티티를 탐색하세요</p>
        </div>
        <div className="text-right">
          <div className="text-[#10b981] text-sm">도감 진행률</div>
          <div className="text-white text-2xl font-bold">{completionRate}%</div>
        </div>
      </div>

      {/* 월드맵 + 마을 버튼 */}
      <div className="relative w-[1400px] h-[700px] border-4 border-[#8b5cf6] rounded-2xl overflow-hidden mx-auto">
        {/* 대체 배경 (기본 배경) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] z-0" />
        
        {/* 배경 이미지 */}
        <div className="absolute inset-0 z-0">
          <Image
            src={getBackgroundImageUrl('background/field.jpg')}
            alt="World Map"
            fill
            className="object-contain"
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
        {mapPositions.map(({ map, top, left, right, bottom, icon }) => {
          const isLocked = map.unlock_requirement > completionRate;
          const position: any = { position: 'absolute', zIndex: 10 };
          if (top) position.top = top;
          if (left) position.left = left;
          if (right) position.right = right;
          if (bottom) position.bottom = bottom;

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

      {/* 선택된 맵 정보 (Hover 시) */}
      {hoveredMap && (
        <div className="w-full bg-[#16213e] border-2 border-[#8b5cf6] rounded-lg p-4 animate-fadeIn">
          {(() => {
            const map = MAPS.find(m => m.id === hoveredMap);
            if (!map) return null;
            return (
              <div>
                <h4 className="text-white font-bold text-lg mb-2">{map.display_name}</h4>
                <p className="text-[#e5e7eb] text-sm">{map.description}</p>
                <div className="mt-2 text-[#8b5cf6] text-xs">
                  출현 엔티티: #{map.entity_id_range[0]} ~ #{map.entity_id_range[1]}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
