'use client';

import { useState } from 'react';
import { UserEntity, EntityMaster } from '@/types/entity';
import Image from 'next/image';
import { getEntityImageUrl } from '@/lib/imageUtils';

interface BagAreaProps {
  userEntities: UserEntity[];
  entities: EntityMaster[];
  currentEntity: UserEntity | null;
  onSelectEntity: (entity: UserEntity) => void;
}

export default function BagArea({ userEntities, entities, currentEntity, onSelectEntity }: BagAreaProps) {
  const [selectedEntity, setSelectedEntity] = useState<UserEntity | null>(null);

  // entity_id로 마스터 데이터 찾기
  const getEntityMaster = (entityId: number): EntityMaster | undefined => {
    return entities.find(e => e.id === entityId);
  };

  const handleEntityClick = (userEntity: UserEntity) => {
    setSelectedEntity(userEntity);
  };

  const handleSelect = () => {
    if (selectedEntity) {
      onSelectEntity(selectedEntity);
      setSelectedEntity(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'normal': return 'border-gray-500';
      case 'rare': return 'border-blue-500';
      case 'unique': return 'border-purple-500';
      case 'legend': return 'border-yellow-500';
      default: return 'border-gray-500';
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-6xl">
      {/* 헤더 */}
      <div className="w-full bg-[#16213e] border-4 border-[#8b5cf6] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              🎒 내 엔티티
            </h2>
            <p className="text-[#e5e7eb] text-sm mt-2">보유한 엔티티를 관리합니다</p>
          </div>
          <div className="text-right">
            <div className="text-[#10b981] text-sm">보유</div>
            <div className="text-white text-3xl font-bold">
              {userEntities.length}
            </div>
            <div className="text-[#8b5cf6] text-xs mt-1">
              마리
            </div>
          </div>
        </div>
      </div>

      {/* 엔티티 없을 때 */}
      {userEntities.length === 0 && (
        <div className="w-full bg-[#16213e] border-2 border-[#8b5cf6]/30 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-white text-xl mb-2">엔티티가 없습니다</p>
          <p className="text-[#e5e7eb] text-sm">탐색에서 전투를 시작해보세요!</p>
        </div>
      )}

      {/* 엔티티 그리드 */}
      {userEntities.length > 0 && (
        <div className="w-full grid grid-cols-5 gap-4">
          {userEntities.map((userEntity) => {
            const master = getEntityMaster(userEntity.entity_id);
            if (!master) return null;

            const isActive = currentEntity?.id === userEntity.id;

            return (
              <div
                key={userEntity.id}
                onClick={() => handleEntityClick(userEntity)}
                className={`
                  bg-[#16213e] border-2 ${getRarityColor(master.rarity)} rounded-lg p-3 
                  cursor-pointer hover:scale-105 transition-all
                  ${isActive ? 'ring-4 ring-[#10b981] border-[#10b981]' : ''}
                  ${selectedEntity?.id === userEntity.id ? 'ring-4 ring-[#8b5cf6]' : ''}
                `}
              >
                {/* 이미지 */}
                <div className="relative w-full aspect-square mb-2 flex items-center justify-center">
                  <Image
                    src={getEntityImageUrl(master.id, 'open')}
                    alt={master.display_name}
                    width={120}
                    height={120}
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const icon = master.element === 'water' ? '💧' :
                                     master.element === 'fire' ? '🔥' :
                                     master.element === 'forest' ? '🌿' :
                                     master.element === 'electric' ? '⚡' :
                                     master.element === 'stone' ? '🪨' : '🌀';
                        parent.innerHTML = `<div class="text-6xl">${icon}</div>`;
                      }
                    }}
                  />
                  {isActive && (
                    <div className="absolute -top-2 -right-2 bg-[#10b981] text-white text-xs font-bold px-2 py-1 rounded-full">
                      활성
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="text-center">
                  <h3 className="text-white font-bold text-sm mb-1 truncate">
                    {master.display_name}
                  </h3>
                  <p className="text-[#8b5cf6] text-xs mb-2">
                    Lv.{userEntity.current_level}
                  </p>

                  {/* 스탯 */}
                  <div className="bg-[#1a1a2e] rounded p-2 text-[10px] text-white space-y-1">
                    <div className="flex justify-between">
                      <span>HP</span>
                      <span className="font-bold">{userEntity.current_stats.hp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ATK</span>
                      <span className="font-bold">{userEntity.current_stats.atk}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DEF</span>
                      <span className="font-bold">{userEntity.current_stats.def}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 상세 정보 모달 */}
      {selectedEntity && (() => {
        const master = getEntityMaster(selectedEntity.entity_id);
        if (!master) return null;

        return (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEntity(null)}
          >
            <div 
              className="bg-[#16213e] border-4 border-[#8b5cf6] rounded-2xl p-8 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {master.display_name}
                  </h3>
                  <div className="flex gap-3 text-sm">
                    <span className="text-[#8b5cf6]">Lv.{selectedEntity.current_level}</span>
                    <span className="text-[#10b981]">{master.element}</span>
                    <span className="text-yellow-400">{master.rarity}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="text-white text-3xl hover:text-[#ef4444] transition-colors"
                >
                  ×
                </button>
              </div>

              {/* 이미지 */}
              <div className="bg-[#1a1a2e] rounded-lg p-12 mb-6 flex justify-center items-center">
                <Image
                  src={getEntityImageUrl(master.id, 'open')}
                  alt={master.display_name}
                  width={300}
                  height={300}
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              {/* 스탯 */}
              <div className="bg-[#1a1a2e] rounded-lg p-4 mb-6">
                <h4 className="text-[#8b5cf6] font-bold mb-3">현재 스탯</h4>
                <div className="grid grid-cols-2 gap-3 text-sm text-white">
                  <div className="flex justify-between">
                    <span>❤️ HP:</span>
                    <span className="font-bold">{selectedEntity.current_stats.hp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⚔️ ATK:</span>
                    <span className="font-bold">{selectedEntity.current_stats.atk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🛡️ DEF:</span>
                    <span className="font-bold">{selectedEntity.current_stats.def}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>✨ MATK:</span>
                    <span className="font-bold">{selectedEntity.current_stats.matk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🌟 MDEF:</span>
                    <span className="font-bold">{selectedEntity.current_stats.mdef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⭐ XP:</span>
                    <span className="font-bold">{selectedEntity.current_xp}</span>
                  </div>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-all"
                >
                  닫기
                </button>
                <button
                  onClick={handleSelect}
                  className="flex-1 px-6 py-3 bg-[#8b5cf6] text-white font-bold rounded-lg hover:bg-[#a78bfa] transition-all"
                >
                  이 엔티티로 활동하기
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
