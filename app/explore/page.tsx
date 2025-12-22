'use client';

import { useState } from 'react';
import GameLayout from '@/components/GameLayout';
import ExploreArea from '@/components/ExploreArea';
import BattleArea from '@/components/BattleArea';
import { useGame } from '@/contexts/GameContext';
import { MOCK_ENTITIES } from '@/data/mockEntities';
import { MAPS } from '@/data/maps';
import { generateRandomStats } from '@/lib/battleUtils';
import { UserEntity, EntityMaster } from '@/types/entity';

export default function ExplorePage() {
  const { playerEntity, setPlayerEntity, discoveredEntities, updateDiscoveredEntity } = useGame();
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [inBattle, setInBattle] = useState(false);

  // 도감 통계
  const discoveredCount = Array.from(discoveredEntities.values()).filter(s => s === 'open').length;
  const totalEntities = MOCK_ENTITIES.length;

  // 맵 선택
  const handleMapSelect = (mapId: string) => {
    setSelectedMap(mapId);
  };

  // 전투 시작
  const handleStartBattle = (mapId: string) => {
    const firstEntity = MOCK_ENTITIES.find(e => e.id === 21);
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
    updateDiscoveredEntity(entity.id, 'open');
  };

  // 전투 시작 시 조우 기록
  const handleEncounter = (entity: EntityMaster) => {
    if (!discoveredEntities.has(entity.id)) {
      updateDiscoveredEntity(entity.id, 'close');
    }
  };

  return (
    <GameLayout>
      <main className="flex-1 bg-[#1a1a2e] p-8 flex items-center justify-center overflow-y-auto">
        <div className="text-center w-full h-full">
          {/* 맵 선택 화면 */}
          {!inBattle && !selectedMap && (
            <ExploreArea
              discoveredCount={discoveredCount}
              totalEntities={totalEntities}
              onMapSelect={handleMapSelect}
            />
          )}

          {/* 맵 상세 화면 */}
          {!inBattle && selectedMap && (
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
          {inBattle && playerEntity && selectedMap && (
            <BattleArea
              playerEntity={playerEntity}
              currentMap={selectedMap}
              onBattleEnd={handleBattleEnd}
              onCapture={handleCapture}
            />
          )}
        </div>
      </main>
    </GameLayout>
  );
}
