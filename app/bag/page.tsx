'use client';

import GameLayout from '@/components/GameLayout';
import BagArea from '@/components/BagArea';
import { useGame } from '@/contexts/GameContext';

export default function BagPage() {
  const { userEntities, entities, entitiesLoading, playerEntity, setPlayerEntity } = useGame();

  return (
    <GameLayout>
      <main className="flex-1 bg-[#1a1a2e] p-8 flex items-start justify-start overflow-y-auto">
        {entitiesLoading ? (
          <div className="text-white text-2xl">데이터 로딩 중...</div>
        ) : (
          <BagArea 
            userEntities={userEntities} 
            entities={entities}
            currentEntity={playerEntity}
            onSelectEntity={setPlayerEntity}
          />
        )}
      </main>
    </GameLayout>
  );
}
