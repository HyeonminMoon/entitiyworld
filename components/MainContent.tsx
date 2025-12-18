'use client';

import { useState } from 'react';
import TrainingArea from './TrainingArea';
import BattleArea from './BattleArea';
import GrowthArea from './GrowthArea';
import ArchiveArea from './ArchiveArea';
import { UserEntity, EntityMaster, ArchiveStatus } from '@/types/entity';
import { MOCK_ENTITIES } from '@/data/mockEntities';
import { generateRandomStats } from '@/lib/battleUtils';

interface MainContentProps {
  activeMenu: string;
  points: number;
  onPointsChange: (points: number) => void;
}

export default function MainContent({ activeMenu, points, onPointsChange }: MainContentProps) {
  const [inBattle, setInBattle] = useState(false);
  const [playerEntity, setPlayerEntity] = useState<UserEntity | null>(null);
  const [discoveredEntities, setDiscoveredEntities] = useState<Map<number, ArchiveStatus>>(new Map());

  // 엔티티 업데이트
  const handleEntityUpdate = (updatedEntity: UserEntity) => {
    setPlayerEntity(updatedEntity);
  };

  // 전투 시작
  const handleStartBattle = () => {
    // 임시 플레이어 엔티티 생성 (Forest 첫 번째 엔티티)
    const firstEntity = MOCK_ENTITIES.find(e => e.id === 21); // Forest Rabbit
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
      setInBattle(true);
    }
  };

  // 전투 종료
  const handleBattleEnd = (result: 'win' | 'lose' | 'escape', expGained: number) => {
    setInBattle(false);
    
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
        {activeMenu === 'explore' && !inBattle && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-[400px] h-[400px] bg-[#16213e] border-4 border-[#8b5cf6] rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl mb-4">🗺️</div>
                <h2 className="text-2xl font-bold text-white mb-2">Forest 맵</h2>
                <p className="text-[#e5e7eb] mb-6">엔티티가 출몰합니다!</p>
                <button
                  onClick={handleStartBattle}
                  className="px-8 py-3 bg-[#8b5cf6] text-white font-bold rounded-lg hover:bg-[#a78bfa] transition-all shadow-lg shadow-[#8b5cf6]/50"
                >
                  ⚔️ 전투 시작
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 전투 화면 */}
        {activeMenu === 'explore' && inBattle && playerEntity && (
          <BattleArea
            playerEntity={playerEntity}
            currentMap="forest"
            onBattleEnd={handleBattleEnd}
            onCapture={handleCapture}
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
          <ArchiveArea discoveredEntities={discoveredEntities} />
        )}
      </div>
    </main>
  );
}
