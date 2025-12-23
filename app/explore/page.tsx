'use client';

import { useState } from 'react';
import GameLayout from '@/components/GameLayout';
import ExploreArea from '@/components/ExploreArea';
import BattleArea from '@/components/BattleArea';
import StarterSelection from '@/components/StarterSelection';
import { useGame } from '@/contexts/GameContext';
import { MAPS } from '@/data/maps';
import { generateRandomStats } from '@/lib/battleUtils';
import { UserEntity, EntityMaster, Stats } from '@/types/entity';
import { saveUserEntity, saveArchiveEntry } from '@/lib/supabase';

export default function ExplorePage() {
  const { playerEntity, setPlayerEntity, discoveredEntities, updateDiscoveredEntity, entities, entitiesLoading, user, userEntities, setUserEntities } = useGame();
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [inBattle, setInBattle] = useState(false);
  const [hasStarter, setHasStarter] = useState(!!playerEntity);

  // 도감 통계
  const discoveredCount = Array.from(discoveredEntities.values()).filter(s => s === 'open').length;
  const totalEntities = entities.length;

  // 시작 엔티티 선택
  const handleStarterSelect = async (entity: EntityMaster, stats: Stats) => {
    if (!user) {
      alert('로그인이 필요합니다!');
      return;
    }

    // DB에 저장
    const savedEntity = await saveUserEntity(user.id, entity.id, stats);
    if (!savedEntity) {
      alert('엔티티 저장에 실패했습니다!');
      return;
    }

    // 도감에도 기록
    await saveArchiveEntry(user.id, entity.id, 'open');

    const newPlayer: UserEntity = {
      id: savedEntity.id,
      entity_id: entity.id,
      user_id: user.id,
      current_level: 1,
      current_stats: stats,
      current_xp: 0,
      current_hp: stats.hp,
      acquired_at: new Date(savedEntity.acquired_at),
    };
    setPlayerEntity(newPlayer);
    updateDiscoveredEntity(entity.id, 'open');
    setHasStarter(true);
  };

  // 맵 선택 → 바로 전투 시작
  const handleMapSelect = (mapId: string) => {
    const firstEntity = entities.find(e => e.id === 21);
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
  const handleCapture = async (entity: EntityMaster, capturedStats: Stats) => {
    if (!user) return;
    
    // DB에 포획한 엔티티 저장
    const savedEntity = await saveUserEntity(user.id, entity.id, capturedStats);
    if (savedEntity) {
      // userEntities 배열에 추가
      const newEntity: UserEntity = {
        id: savedEntity.id,
        entity_id: entity.id,
        user_id: user.id,
        current_level: 1,
        current_stats: capturedStats,
        current_xp: 0,
        current_hp: capturedStats.hp,
        acquired_at: new Date(savedEntity.acquired_at),
      };
      setUserEntities([...userEntities, newEntity]);
    }
    
    // 도감에 포획 기록 저장
    await saveArchiveEntry(user.id, entity.id, 'open');
    updateDiscoveredEntity(entity.id, 'open');
  };

  // 전투 시작 시 조우 기록
  const handleEncounter = async (entity: EntityMaster) => {
    if (!user) return;
    
    if (!discoveredEntities.has(entity.id)) {
      // 도감에 조우 기록 저장
      await saveArchiveEntry(user.id, entity.id, 'close');
      updateDiscoveredEntity(entity.id, 'close');
    }
  };

  return (
    <>
      {/* 로딩 화면 */}
      {entitiesLoading && (
        <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
          <div className="text-white text-2xl">엔티티 데이터 로딩 중...</div>
        </div>
      )}

      {/* 시작 엔티티 선택 화면 */}
      {!entitiesLoading && !hasStarter && (
        <StarterSelection onSelect={handleStarterSelect} entities={entities} />
      )}

      {/* 게임 화면 */}
      {!entitiesLoading && hasStarter && (
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

              {/* 전투 화면 */}
              {inBattle && playerEntity && selectedMap && (
                <BattleArea
                  playerEntity={playerEntity}
                  currentMap={selectedMap}
                  onBattleEnd={handleBattleEnd}
                  onCapture={handleCapture}
                  entities={entities}
                />
              )}
            </div>
          </main>
        </GameLayout>
      )}
    </>
  );
}
