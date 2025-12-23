'use client';

import { useState } from 'react';
import TrainingArea from './TrainingArea';
import BattleArea from './BattleArea';
import GrowthArea from './GrowthArea';
import ArchiveArea from './ArchiveArea';
import ExploreArea from './ExploreArea';
import { UserEntity, EntityMaster, ArchiveStatus } from '@/types/entity';
import { generateRandomStats } from '@/lib/battleUtils';
import { MAPS } from '@/data/maps';
import { useGame } from '@/contexts/GameContext';

interface MainContentProps {
  activeMenu: string;
  points: number;
  onPointsChange: (points: number) => void;
}

export default function MainContent({ activeMenu, points, onPointsChange }: MainContentProps) {
  const { entities } = useGame();
  const [inBattle, setInBattle] = useState(false);
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [playerEntity, setPlayerEntity] = useState<UserEntity | null>(null);
  const [discoveredEntities, setDiscoveredEntities] = useState<Map<number, ArchiveStatus>>(new Map());

  // 엔티티 업데이트
  const handleEntityUpdate = (updatedEntity: UserEntity) => {
    setPlayerEntity(updatedEntity);
  };

  // 맵 선택 핸들러
  const handleMapSelect = (mapId: string) => {
    setSelectedMap(mapId);
  };

  // 전투 시작
  const handleStartBattle = (mapId: string) => {
    // 임시 플레이어 엔티티 생성 (Forest 첫 번째 엔티티)
    const firstEntity = entities.find(e => e.id === 21); // Forest Rabbit
    if (firstEntity) {
      const stats = generateRandomStats(firstEntity.min_stats, firstEntity.max_stats);
      const tempPlayer: UserEntity = {
        id: 'temp-1',
        entity_id: firstEntity.id,
        user_id: 'temp-user',
        current_level: 1,
        current_stats: stats,
        current_xp: 0,
        current_hp: stats.hp,
        acquired_at: new Date(),
      };
      setPlayerEntity(tempPlayer);
      setSelectedMap(mapId);
      setInBattle(true);
    }
  };

  // 전투 종료
  const handleBattleEnd = (result: 'win' | 'lose' | 'escape', expGained: number) => {
    setInBattle(false);
    setSelectedMap(null);
    
    if (result === 'win' && playerEntity) {
      // 경험치 추가
      const updatedEntity = {
        ...playerEntity,
        current_xp: playerEntity.current_xp + expGained,
      };
      setPlayerEntity(updatedEntity);
      alert(`승리! ${expGained} 경험치 획득!`);
    } else if (result === 'lose') {
      alert('패배했습니다...');
    } else {
      alert('도망쳤습니다!');
    }
  };

  // 포획 성공
  const handleCapture = (entity: EntityMaster) => {
    console.log('포획 성공:', entity.display_name);
    
    // 도감에 등록 (Open 상태로)
    setDiscoveredEntities(prev => {
      const newMap = new Map(prev);
      newMap.set(entity.id, 'open');
      return newMap;
    });
  };

  // 전투 시작 시 조우 기록 (Close 상태로)
  const handleEncounter = (entity: EntityMaster) => {
    setDiscoveredEntities(prev => {
      const newMap = new Map(prev);
      // 이미 포획했으면 (open) 유지, 아니면 close로 기록
      if (!newMap.has(entity.id)) {
        newMap.set(entity.id, 'close');
      }
      return newMap;
    });
  };

  return (
    <main className="flex-1 bg-[#1a1a2e] p-8 flex items-center justify-center overflow-y-auto">
      <div className="text-center">
        {/* 훈련 모드 */}
        {activeMenu === 'training' && (
          <TrainingArea onPointsChange={onPointsChange} currentPoints={points} />
        )}

        {/* 탐색 모드 */}
        {activeMenu === 'explore' && !inBattle && !selectedMap && (
          <ExploreArea
            discoveredCount={Array.from(discoveredEntities.values()).filter(s => s === 'open').length}
            totalEntities={entities.length}
            onMapSelect={handleMapSelect}
          />
        )}

        {/* 맵 상세 화면 */}
        {activeMenu === 'explore' && !inBattle && selectedMap && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-[500px] bg-[#16213e] border-4 border-[#8b5cf6] rounded-2xl p-8">
              <div className="text-center">
                {(() => {
                  const map = MAPS.find(m => m.id === selectedMap);
                  if (!map) return null;
                  const icon = map.id === 'water' ? '💧' :
                               map.id === 'fire' ? '🔥' :
                               map.id === 'forest' ? '🌲' :
                               map.id === 'electric' ? '⚡' :
                               map.id === 'stone' ? '🪨' : '🌀';
                  return (
                    <>
                      <div className="text-8xl mb-4">{icon}</div>
                      <h2 className="text-3xl font-bold text-white mb-3">{map.display_name}</h2>
                      <p className="text-[#e5e7eb] mb-2">{map.description}</p>
                      <p className="text-[#8b5cf6] text-sm mb-6">
                        출현 엔티티: #{map.entity_id_range[0]} ~ #{map.entity_id_range[1]}
                      </p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => setSelectedMap(null)}
                          className="px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-all"
                        >
                          ← 돌아가기
                        </button>
                        <button
                          onClick={() => handleStartBattle(selectedMap)}
                          className="px-8 py-3 bg-[#8b5cf6] text-white font-bold rounded-lg hover:bg-[#a78bfa] transition-all shadow-lg shadow-[#8b5cf6]/50"
                        >
                          ⚔️ 전투 시작
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* 전투 화면 */}
        {activeMenu === 'explore' && inBattle && playerEntity && selectedMap && (
          <BattleArea
            playerEntity={playerEntity}
            currentMap={selectedMap}
            onBattleEnd={handleBattleEnd}
            onCapture={(entity, stats) => handleCapture(entity)}
            entities={entities}
          />
        )}

        {/* 성장 모드 */}
        {activeMenu === 'grow' && (
          <GrowthArea 
            playerEntity={playerEntity}
            points={points}
            onPointsChange={onPointsChange}
            onEntityUpdate={handleEntityUpdate}
          />
        )}

        {/* 도감 모드 */}
        {activeMenu === 'archive' && (
          <ArchiveArea discoveredEntities={discoveredEntities} entities={entities} />
        )}
      </div>
    </main>
  );
}
