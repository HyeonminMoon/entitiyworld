'use client';

import GameLayout from '@/components/GameLayout';
import GrowthArea from '@/components/GrowthArea';
import { useGame } from '@/contexts/GameContext';

export default function GrowPage() {
  const { points, setPoints, playerEntity, setPlayerEntity } = useGame();

  const handleEntityUpdate = (updatedEntity: any) => {
    setPlayerEntity(updatedEntity);
  };

  return (
    <GameLayout>
      <main className="flex-1 bg-[#1a1a2e] p-8 flex items-center justify-center overflow-y-auto">
        <GrowthArea 
          playerEntity={playerEntity}
          points={points}
          onPointsChange={setPoints}
          onEntityUpdate={handleEntityUpdate}
        />
      </main>
    </GameLayout>
  );
}
