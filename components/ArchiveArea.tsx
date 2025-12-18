'use client';

import { useState } from 'react';
import { EntityMaster, ArchiveStatus } from '@/types/entity';
import { MOCK_ENTITIES } from '@/data/mockEntities';
import Image from 'next/image';

interface ArchiveAreaProps {
  discoveredEntities: Map<number, ArchiveStatus>; // entity_id -> status
}

export default function ArchiveArea({ discoveredEntities }: ArchiveAreaProps) {
  const [selectedEntity, setSelectedEntity] = useState<EntityMaster | null>(null);
  const [filterElement, setFilterElement] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');

  // 필터링된 엔티티 목록
  const filteredEntities = MOCK_ENTITIES.filter(entity => {
    const matchElement = filterElement === 'all' || entity.element === filterElement;
    const matchRarity = filterRarity === 'all' || entity.rarity === filterRarity;
    return matchElement && matchRarity;
  });

  // 발견 통계
  const totalEntities = MOCK_ENTITIES.length;
  const discoveredCount = Array.from(discoveredEntities.values()).filter(
    status => status === 'open'
  ).length;
  const encounteredCount = discoveredEntities.size;

  // 엔티티 상태 가져오기
  const getEntityStatus = (entityId: number): ArchiveStatus => {
    return discoveredEntities.get(entityId) || 'none';
  };

  // 엔티티 카드 클릭
  const handleEntityClick = (entity: EntityMaster) => {
    const status = getEntityStatus(entity.id);
    if (status !== 'none') {
      setSelectedEntity(entity);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-6xl">
      {/* 도감 헤더 */}
      <div className="w-full bg-[#16213e] border-4 border-[#8b5cf6] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              📚 <span>아카이브</span>
            </h2>
            <p className="text-[#e5e7eb] text-sm mt-2">발견한 엔티티를 기록합니다</p>
          </div>
          <div className="text-right">
            <div className="text-[#10b981] text-sm">발견</div>
            <div className="text-white text-3xl font-bold">
              {discoveredCount} / {totalEntities}
            </div>
            <div className="text-[#8b5cf6] text-xs mt-1">
              조우: {encounteredCount}
            </div>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="w-full bg-[#1a1a2e] rounded-full h-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[#8b5cf6] to-[#10b981] h-full transition-all duration-300"
            style={{ width: `${(discoveredCount / totalEntities) * 100}%` }}
          />
        </div>
      </div>

      {/* 필터 */}
      <div className="w-full bg-[#16213e] border-2 border-[#8b5cf6]/30 rounded-lg p-4">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">속성:</span>
            <select
              value={filterElement}
              onChange={(e) => setFilterElement(e.target.value)}
              className="bg-[#1a1a2e] text-white border-2 border-[#8b5cf6] rounded px-3 py-1 font-bold"
            >
              <option value="all">전체</option>
              <option value="water">Water</option>
              <option value="fire">Fire</option>
              <option value="forest">Forest</option>
              <option value="electric">Electric</option>
              <option value="stone">Stone</option>
              <option value="chaos">Chaos</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white font-bold">희귀도:</span>
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="bg-[#1a1a2e] text-white border-2 border-[#8b5cf6] rounded px-3 py-1 font-bold"
            >
              <option value="all">전체</option>
              <option value="normal">Normal</option>
              <option value="rare">Rare</option>
              <option value="unique">Unique</option>
              <option value="legend">Legend</option>
            </select>
          </div>
        </div>
      </div>

      {/* 엔티티 그리드 */}
      <div className="w-full grid grid-cols-8 gap-3">
        {filteredEntities.map((entity) => {
          const status = getEntityStatus(entity.id);
          return (
            <EntityCard
              key={entity.id}
              entity={entity}
              status={status}
              onClick={() => handleEntityClick(entity)}
            />
          );
        })}
      </div>

      {/* 상세 정보 모달 */}
      {selectedEntity && (
        <EntityDetailModal
          entity={selectedEntity}
          status={getEntityStatus(selectedEntity.id)}
          onClose={() => setSelectedEntity(null)}
        />
      )}
    </div>
  );
}

// 엔티티 카드 컴포넌트
interface EntityCardProps {
  entity: EntityMaster;
  status: ArchiveStatus;
  onClick: () => void;
}

function EntityCard({ entity, status, onClick }: EntityCardProps) {
  const rarityColors = {
    normal: 'border-gray-500',
    rare: 'border-blue-500',
    unique: 'border-purple-500',
    legend: 'border-yellow-500',
  };

  if (status === 'none') {
    // 미발견
    return (
      <div className="aspect-square bg-[#16213e] border-2 border-[#8b5cf6]/20 rounded-lg flex items-center justify-center">
        <span className="text-7xl opacity-30">❓</span>
      </div>
    );
  }

  if (status === 'close') {
    // 실루엣 (close 폴더 이미지)
    return (
      <div
        onClick={onClick}
        className={`aspect-square bg-[#16213e] border-2 ${rarityColors[entity.rarity]} rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform flex flex-col items-center justify-center`}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={`/assets/entities/close/${entity.id}.png`}
            alt={`Entity ${entity.id} silhouette`}
            width={100}
            height={100}
            className="object-contain opacity-50 grayscale"
            onError={(e) => {
              // 이미지 로드 실패 시 기본 아이콘 표시
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = '<div class="text-6xl grayscale opacity-50">👾</div>';
              }
            }}
          />
        </div>
        <div className="text-xs text-gray-400 text-center mt-1">???</div>
      </div>
    );
  }

  // Open (포획 완료 - open 폴더 이미지)
  return (
    <div
      onClick={onClick}
      className={`aspect-square bg-[#16213e] border-2 ${rarityColors[entity.rarity]} rounded-lg p-2 cursor-pointer hover:scale-110 transition-all flex flex-col items-center justify-center shadow-lg hover:shadow-2xl hover:shadow-${rarityColors[entity.rarity]}/50`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <Image
          src={`/assets/entities/open/${entity.id}.png`}
          alt={entity.display_name}
          width={100}
          height={100}
          className="object-contain"
          onError={(e) => {
            // 이미지 로드 실패 시 기본 아이콘 표시
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const icon = entity.element === 'water' ? '💧' :
                           entity.element === 'fire' ? '🔥' :
                           entity.element === 'forest' ? '🌿' :
                           entity.element === 'electric' ? '⚡' :
                           entity.element === 'stone' ? '🪨' : '🌀';
              parent.innerHTML = `<div class="text-6xl">${icon}</div>`;
            }
          }}
        />
      </div>
      <div className="text-[10px] text-white text-center font-bold truncate w-full mt-1">
        {entity.display_name}
      </div>
      <div className="text-[9px] text-[#8b5cf6]">#{entity.id}</div>
    </div>
  );
}

// 상세 정보 모달
interface EntityDetailModalProps {
  entity: EntityMaster;
  status: ArchiveStatus;
  onClose: () => void;
}

function EntityDetailModal({ entity, status, onClose }: EntityDetailModalProps) {
  const rarityColors = {
    normal: 'text-gray-400',
    rare: 'text-blue-400',
    unique: 'text-purple-400',
    legend: 'text-yellow-400',
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#16213e] border-4 border-[#8b5cf6] rounded-2xl p-8 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-3xl font-bold text-white mb-2">
              {status === 'close' ? '???' : entity.display_name}
            </h3>
            <div className="flex gap-3 text-sm">
              <span className="text-[#8b5cf6]">#{entity.id}</span>
              <span className={rarityColors[entity.rarity]}>
                {entity.rarity.toUpperCase()}
              </span>
              <span className="text-[#10b981]">{entity.element}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white text-3xl hover:text-[#ef4444] transition-colors"
          >
            ×
          </button>
        </div>

        {status === 'close' ? (
          // 실루엣 상태
          <div className="text-center py-12">
            <div className="bg-[#1a1a2e] rounded-lg p-12 mb-6 flex justify-center items-center">
              <Image
                src={`/assets/entities/close/${entity.id}.png`}
                alt={`Entity ${entity.id} silhouette`}
                width={300}
                height={300}
                className="object-contain opacity-50 grayscale"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="text-9xl grayscale opacity-50">👾</div>';
                  }
                }}
              />
            </div>
            <p className="text-[#e5e7eb] text-lg">아직 포획하지 못한 엔티티입니다.</p>
            <p className="text-[#8b5cf6] text-sm mt-2">전투에서 승리하여 포획하세요!</p>
          </div>
        ) : (
          // 포획 완료 상태
          <>
            {/* 이미지 영역 */}
            <div className="bg-[#1a1a2e] rounded-lg p-12 mb-6 flex justify-center items-center">
              <Image
                src={`/assets/entities/open/${entity.id}.png`}
                alt={entity.display_name}
                width={400}
                height={400}
                className="object-contain hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const icon = entity.element === 'water' ? '💧' :
                                 entity.element === 'fire' ? '🔥' :
                                 entity.element === 'forest' ? '🌿' :
                                 entity.element === 'electric' ? '⚡' :
                                 entity.element === 'stone' ? '🪨' : '🌀';
                    parent.innerHTML = `<div class="text-9xl">${icon}</div>`;
                  }
                }}
              />
            </div>

            {/* 스탯 정보 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#1a1a2e] rounded-lg p-4">
                <h4 className="text-[#10b981] font-bold mb-3">최소 스탯</h4>
                <div className="space-y-2 text-sm text-white">
                  <div className="flex justify-between">
                    <span>❤️ HP:</span>
                    <span className="font-bold">{entity.min_stats.hp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⚔️ ATK:</span>
                    <span className="font-bold">{entity.min_stats.atk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🛡️ DEF:</span>
                    <span className="font-bold">{entity.min_stats.def}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>✨ MATK:</span>
                    <span className="font-bold">{entity.min_stats.matk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🌟 MDEF:</span>
                    <span className="font-bold">{entity.min_stats.mdef}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a2e] rounded-lg p-4">
                <h4 className="text-[#8b5cf6] font-bold mb-3">최대 스탯</h4>
                <div className="space-y-2 text-sm text-white">
                  <div className="flex justify-between">
                    <span>❤️ HP:</span>
                    <span className="font-bold">{entity.max_stats.hp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⚔️ ATK:</span>
                    <span className="font-bold">{entity.max_stats.atk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🛡️ DEF:</span>
                    <span className="font-bold">{entity.max_stats.def}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>✨ MATK:</span>
                    <span className="font-bold">{entity.max_stats.matk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🌟 MDEF:</span>
                    <span className="font-bold">{entity.max_stats.mdef}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 추가 정보 */}
            <div className="bg-[#1a1a2e] rounded-lg p-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#e5e7eb]">공격 타입:</span>
                <span className="text-white font-bold">
                  {entity.attack_type === 'physical' ? '⚔️ Physical' : '✨ Magic'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
