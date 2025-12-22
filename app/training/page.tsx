'use client';

import GameLayout from '@/components/GameLayout';
import TrainingArea from '@/components/TrainingArea';
import { useGame } from '@/contexts/GameContext';

export default function TrainingPage() {
  const { points, setPoints } = useGame();

  return (
    <GameLayout>
      <main className="flex-1 bg-[#1a1a2e] p-8 flex items-center justify-center overflow-y-auto">
        <TrainingArea onPointsChange={setPoints} currentPoints={points} />
      </main>
    </GameLayout>
  );
}
