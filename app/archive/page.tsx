'use client';

import GameLayout from '@/components/GameLayout';
import ArchiveArea from '@/components/ArchiveArea';
import { useGame } from '@/contexts/GameContext';

export default function ArchivePage() {
  const { discoveredEntities } = useGame();

  return (
    <GameLayout>
      <main className="flex-1 bg-[#1a1a2e] p-8 flex items-center justify-center overflow-y-auto">
        <ArchiveArea discoveredEntities={discoveredEntities} />
      </main>
    </GameLayout>
  );
}
