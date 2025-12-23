'use client';

import GameLayout from '@/components/GameLayout';
import ArchiveArea from '@/components/ArchiveArea';
import { useGame } from '@/contexts/GameContext';

export default function ArchivePage() {
  const { discoveredEntities, entities, entitiesLoading } = useGame();

  return (
    <GameLayout>
      <main className="flex-1 bg-[#1a1a2e] p-8 flex items-center justify-center overflow-y-auto">
        {entitiesLoading ? (
          <div className="text-white text-2xl">데이터 로딩 중...</div>
        ) : (
          <ArchiveArea discoveredEntities={discoveredEntities} entities={entities} />
        )}
      </main>
    </GameLayout>
  );
}
